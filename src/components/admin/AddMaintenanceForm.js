"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, runTransaction } from "firebase/firestore";

export default function AddMaintenanceForm({ vehicleId, onClose, onlyCost = false }) {
  const { userProfile } = useAuth();
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const defaultDateTime = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const [formData, setFormData] = useState({
    date: defaultDateTime,
    details: '',
    cost: '',
    mileage: '',
    type: onlyCost ? 'cost-only' : 'cost-only',
    vendor: '',
    expectedReturnDate: '',
  });
  const [latestMileage, setLatestMileage] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (formData.type === 'garage') {
        // ส่งซ่อมอู่ - บันทึกใน maintenances และเปลี่ยนสถานะรถ
        await runTransaction(db, async (tx) => {
          const vehicleRef = doc(db, 'vehicles', vehicleId);
          const vSnap = await tx.get(vehicleRef);
          if (!vSnap.exists()) throw new Error('vehicle-not-found');

          const maintRef = doc(collection(db, 'maintenances'));
          tx.set(maintRef, {
            vehicleId: vehicleId,
            date: new Date(formData.date),
            details: formData.details,
            cost: Number(formData.cost),
            type: 'garage',
            vendor: formData.vendor || null,
            odometerAtDropOff: formData.mileage ? Number(formData.mileage) : null,
            expectedReturnDate: formData.expectedReturnDate ? new Date(formData.expectedReturnDate) : null,
            maintenanceStatus: 'in_progress',
            createdAt: serverTimestamp(),
            userId: userProfile?.uid || null,
            source: 'admin',
          });

          tx.update(vehicleRef, { status: 'maintenance', lastMaintenanceId: maintRef.id });
        });
      } else {
        // บันทึกค่าใช้จ่าย - บันทึกใน expenses collection
        await addDoc(collection(db, "expenses"), {
          vehicleId: vehicleId,
          userId: userProfile?.uid || null, // ผู้บันทึก
          usageId: null, // ไม่เกี่ยวกับ usage
          type: 'other',
          amount: Number(formData.cost),
          mileage: formData.mileage ? Number(formData.mileage) : null,
          note: formData.details,
          timestamp: new Date(formData.date),
          createdAt: serverTimestamp(),
          source: 'admin',
        });
      }

      setMessage('บันทึกข้อมูลสำเร็จ!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error adding maintenance record: ", error);
      setMessage('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch latest mileage for display only
  useEffect(() => {
    let mounted = true;
    const fetchVehicle = async () => {
      try {
        const vRef = doc(db, 'vehicles', vehicleId);
        const snap = await getDoc(vRef);
        if (mounted && snap.exists()) {
          const data = snap.data();
          if (data.currentMileage || data.currentMileage === 0) {
            setLatestMileage(data.currentMileage);
          }
        }
      } catch (err) {
        console.error('Failed to fetch vehicle for maintenance form:', err);
      }
    };
    if (vehicleId) fetchVehicle();
    return () => { mounted = false; };
  }, [vehicleId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg p-5 bg-white rounded-xl shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {formData.type === "garage" ? "ส่งซ่อมอู่ / ศูนย์บริการ" : "เพิ่มรายการซ่อมบำรุง"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-xs"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-normal text-slate-700">วันที่/เวลา</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {!onlyCost ? (
              <div>
                <label className="block mb-1 text-xs font-normal text-slate-700">ประเภทการแจ้งซ่อม</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                >
                  <option value="cost-only">แจ้งค่าซ่อม (บันทึกค่าใช้จ่าย)</option>
                  <option value="garage">ซ่อมอู่ (รอรับ)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block mb-1 text-xs font-normal text-slate-700">หมวดค่าใช้จ่าย</label>
                <input
                  type="text"
                  disabled
                  value="บันทึกค่าซ่อมทั่วไป"
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-normal"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 text-xs font-normal text-slate-700">
              รายละเอียดการซ่อม <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="details"
              placeholder="เช่น เปลี่ยนน้ำมันเครื่อง, สลับยาง, ซ่อมระบบเบรก"
              value={formData.details}
              onChange={handleChange}
              required
              rows={2}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-normal text-slate-700">
                ค่าใช้จ่าย (บาท) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="cost"
                placeholder="0.00"
                value={formData.cost}
                onChange={handleChange}
                required
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-normal text-slate-700">เลขไมล์ (ถ้ามี)</label>
                {latestMileage !== null && (
                  <span className="text-[11px] text-slate-500 font-normal">
                    ล่าสุด: <span className="font-mono text-slate-800">{latestMileage.toLocaleString()}</span> กม.
                  </span>
                )}
              </div>
              <input
                type="number"
                name="mileage"
                placeholder="เช่น 10500"
                value={formData.mileage}
                onChange={handleChange}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {formData.type === "garage" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/60 rounded-lg border border-amber-200/80">
              <div>
                <label className="block mb-1 text-xs font-normal text-slate-700">ชื่ออู่/ศูนย์บริการ</label>
                <input
                  type="text"
                  name="vendor"
                  placeholder="ชื่ออู่หรือศูนย์บริการ"
                  value={formData.vendor}
                  onChange={handleChange}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-normal text-slate-700">วันที่คาดว่าจะรับคืน</label>
                <input
                  type="date"
                  name="expectedReturnDate"
                  value={formData.expectedReturnDate}
                  onChange={handleChange}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {userProfile && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-700 font-normal">
                ผู้บันทึก: <span className="text-slate-900">{userProfile.name || userProfile.email || "ไม่ระบุ"}</span>
              </p>
            </div>
          )}

          {message && <p className="text-center text-xs font-normal text-rose-600">{message}</p>}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-normal text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 text-white bg-emerald-600 rounded-lg text-xs font-normal hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}