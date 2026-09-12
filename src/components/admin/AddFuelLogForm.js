"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function AddFuelLogForm({ vehicleId, currentMileage, onClose }) {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    cost: '',
    mileage: '',
    note: '',
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestMileage, setLatestMileage] = useState(null);

  // Fetch latest mileage for display
  useEffect(() => {
    const fetchLatestMileage = async () => {
      try {
        const { query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
        // ดึงข้อมูลเติมน้ำมันล่าสุดที่มีเลขไมล์
        const fuelQuery = query(
          collection(db, 'expenses'),
          where('vehicleId', '==', vehicleId),
          where('type', '==', 'fuel'),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const fuelSnap = await getDocs(fuelQuery);
        if (!fuelSnap.empty) {
          const latestFuel = fuelSnap.docs[0].data();
          if (latestFuel.mileage || latestFuel.mileage === 0) {
            setLatestMileage(latestFuel.mileage);
            return;
          }
        }
        // ถ้าไม่มีข้อมูลเติมน้ำมัน ให้ใช้ currentMileage จาก vehicle
        const vRef = doc(db, 'vehicles', vehicleId);
        const snap = await getDoc(vRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.currentMileage || data.currentMileage === 0) {
            setLatestMileage(data.currentMileage);
          }
        }
      } catch (err) {
        console.error('Failed to fetch latest mileage for fuel form:', err);
      }
    };
    if (vehicleId) fetchLatestMileage();
  }, [vehicleId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // บันทึกลง expenses collection
      await addDoc(collection(db, "expenses"), {
        vehicleId,
        userId: userProfile?.uid || null, // บันทึกผู้ใช้ที่เพิ่มข้อมูล
        usageId: null, // ไม่เกี่ยวกับ usage
        type: 'fuel',
        amount: Number(formData.cost),
        mileage: formData.mileage ? Number(formData.mileage) : null,
        note: formData.note || '',
        timestamp: serverTimestamp(), // ใช้เวลาปัจจุบัน
        createdAt: serverTimestamp(),
        source: 'admin', // ระบุว่าเพิ่มจากผู้ดูแลระบบ
      });
      setMessage('บันทึกข้อมูลสำเร็จ!');
      setTimeout(() => onClose(true), 1000); // ส่ง true เพื่อบอกว่าบันทึกสำเร็จ
    } catch (error) {
      setMessage('เกิดข้อผิดพลาดในการบันทึก');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md p-5 bg-white rounded-xl shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">เพิ่มรายการเติมน้ำมัน</h2>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-xs"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1 text-xs font-normal text-slate-700">วันที่</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-normal text-slate-700">
                เลขไมล์ <span className="text-rose-500">*</span>
              </label>
              {latestMileage !== null && (
                <span className="text-[11px] text-slate-500 font-normal">
                  ล่าสุด: <span className="font-mono text-slate-800">{latestMileage.toLocaleString()}</span> กม.
                </span>
              )}
            </div>
            <input
              type="number"
              name="mileage"
              placeholder="เช่น 45000"
              value={formData.mileage}
              onChange={handleChange}
              required
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-normal text-slate-700">
              ราคารวม (บาท) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="cost"
              placeholder="0.00"
              value={formData.cost}
              onChange={handleChange}
              required
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-normal text-slate-700">หมายเหตุ (ถ้ามี)</label>
            <input
              type="text"
              name="note"
              placeholder="เช่น เติมที่ปั๊ม ปตท., ปั๊มบางจาก"
              value={formData.note}
              onChange={handleChange}
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {userProfile && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-700 font-normal">
                ผู้บันทึก: <span className="text-slate-900">{userProfile.name || userProfile.email || "ไม่ระบุ"}</span>
              </p>
            </div>
          )}

          {message && (
            <p className="text-center text-xs font-normal text-rose-600">{message}</p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onClose(false)}
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