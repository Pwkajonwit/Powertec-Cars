"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, query, where, onSnapshot, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AlertToast from "@/components/ui/AlertToast";

const Icons = {
  ArrowLeft: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  Car: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H6.128c-.643 0-1.238.328-1.58.86A17.9 17.9 0 001.335 17.626c-.039.62.469 1.124 1.09 1.124H3.75" />
    </svg>
  ),
  User: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  MapPin: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ExclamationTriangle: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
};

function getStatusLabel(status) {
  switch (status) {
    case "in-use":
    case "in_use":
      return "กำลังถูกใช้งาน";
    case "on-trip":
    case "on_trip":
      return "อยู่ระหว่างเดินทาง";
    default:
      return "กำลังใช้งาน";
  }
}

export default function VehiclesInUsePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forceReturnModal, setForceReturnModal] = useState(null);
  const [forceReturnLoading, setForceReturnLoading] = useState(false);
  const [endMileage, setEndMileage] = useState("");

  // Alert State
  const [alertState, setAlertState] = useState({ show: false, message: "", type: "success" });
  const showAlert = (message, type = "success") => {
    setAlertState({ show: true, message, type });
  };

  useEffect(() => {
    const q = query(
      collection(db, "vehicles"),
      where("status", "in", ["in-use", "in_use", "on-trip", "on_trip"])
    );

    const unsubscribe = onSnapshot(q, async (qs) => {
      const list = [];
      for (const docSnap of qs.docs) {
        const data = { id: docSnap.id, ...docSnap.data() };
        try {
          const usageQ = query(
            collection(db, "vehicle-usage"),
            where("vehicleId", "==", data.id),
            where("status", "==", "active")
          );
          const usageSnap = await getDocs(usageQ);
          if (!usageSnap.empty) {
            const usageDoc = usageSnap.docs[0];
            const usageData = usageDoc.data();
            data.driver = { name: usageData.userName };
            data.activeUsageId = usageDoc.id;
            data.activeUsage = {
              id: usageDoc.id,
              ...usageData,
              startTime: usageData.startTime?.toDate?.() || new Date(usageData.startTime),
            };

            const expensesQ = query(
              collection(db, "expenses"),
              where("usageId", "==", usageDoc.id),
              orderBy("timestamp", "desc")
            );
            const expensesSnap = await getDocs(expensesQ);
            const expenses = expensesSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
              timestamp: d.data().timestamp?.toDate?.() || new Date(d.data().timestamp),
            }));
            data.expenses = expenses;
            data.totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
          }
        } catch (e) {
          console.error("Failed to fetch active vehicle-usage for driver", e);
        }
        list.push(data);
      }
      setVehicles(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleForceReturn = async () => {
    if (!forceReturnModal) return;

    setForceReturnLoading(true);
    try {
      const response = await fetch("/api/vehicle-usage/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usageId: forceReturnModal.activeUsageId,
          endMileage: endMileage ? Number(endMileage) : null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showAlert("บังคับคืนรถสำเร็จ เปลี่ยนสถานะเป็นพร้อมใช้งานแล้ว", "success");
        setForceReturnModal(null);
        setEndMileage("");
      } else {
        showAlert(data.error || "เกิดข้อผิดพลาดในการบังคับคืนรถ", "error");
      }
    } catch (err) {
      console.error("Force return error:", err);
      showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ", "error");
    }
    setForceReturnLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const inUseCount = vehicles.filter((v) => ["in-use", "in_use"].includes(v.status)).length;
  const onTripCount = vehicles.filter((v) => ["on-trip", "on_trip"].includes(v.status)).length;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <AlertToast
        show={alertState.show}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState((prev) => ({ ...prev, show: false }))}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2.5">
          <Link
            href="/vehicles"
            className="h-9 w-9 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
            title="กลับไปหน้ารายการรถทั้งหมด"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">รถที่กำลังใช้งาน</h1>
            <p className="text-xs font-normal text-slate-600 mt-0.5">
              ตรวจสอบยานพาหนะที่กำลังถูกใช้งานอยู่ หากผู้ใช้ลืมคืนรถ แอดมินสามารถบังคับคืนได้
            </p>
          </div>
        </div>

        <Link
          href="/vehicles"
          className="h-9 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-normal transition-colors flex items-center gap-1.5 self-end sm:self-auto shadow-xs"
        >
          <Icons.Car className="w-4 h-4" />
          <span>ดูรถทั้งหมด</span>
        </Link>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">รถที่ถูกใช้งานขณะนี้</p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {vehicles.length} คัน
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Icons.Car className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">กำลังถูกใช้งาน (In-Use)</p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {inUseCount} คัน
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <Icons.Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">อยู่ระหว่างเดินทาง (On-Trip)</p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {onTripCount} คัน
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <Icons.MapPin className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Vehicles Grid / Empty State */}
      {vehicles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
            <Icons.Car className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">ไม่มีรถที่กำลังใช้งานอยู่ในขณะนี้</h3>
          <p className="text-xs font-normal text-slate-500 mt-1">
            รถทุกคันอยู่ในสถานะพร้อมใช้งาน หรืออยู่ระหว่างการซ่อมบำรุง
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3.5 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                {/* Vehicle Header */}
                <div className="flex items-center gap-3">
                  {v.imageUrl ? (
                    <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <Image
                        src={v.imageUrl}
                        alt={`${v.brand} ${v.model}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                      <Icons.Car className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {v.brand} {v.model}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-normal bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        {getStatusLabel(v.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {v.licensePlate ? (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-900 border border-slate-200">
                          {v.licensePlate}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-normal">-</span>
                      )}
                      <span className="text-xs text-slate-600 font-normal truncate">
                        {v.type || "ทั่วไป"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="flex items-center gap-2 text-xs text-slate-700 font-normal px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  <Icons.User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    คนขับ:{" "}
                    <span className="font-semibold text-slate-900">
                      {v.driver?.name || v.activeUsage?.userName || "ไม่พบข้อมูลผู้ขับ"}
                    </span>
                  </span>
                </div>

                {/* Active Usage Details */}
                {v.activeUsage && (
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-2.5 text-xs text-slate-700 font-normal space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-200/60">
                      <span>เริ่มใช้งาน</span>
                      <span className="font-mono text-slate-800">
                        {v.activeUsage.startTime?.toLocaleString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) || "-"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2 pt-0.5">
                      <span className="text-slate-500 text-[11px] shrink-0">จุดหมาย:</span>
                      <span className="text-slate-800 text-right truncate">
                        {v.activeUsage.destination || "-"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 text-[11px] shrink-0">วัตถุประสงค์:</span>
                      <span className="text-slate-800 text-right truncate">
                        {v.activeUsage.purpose || "-"}
                      </span>
                    </div>
                    {v.activeUsage.startMileage && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 text-[11px]">ไมล์เริ่มต้น:</span>
                        <span className="font-mono text-slate-800">
                          {v.activeUsage.startMileage.toLocaleString()} กม.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Expenses During Trip */}
                {v.expenses && v.expenses.length > 0 && (
                  <div className="bg-sky-50/50 border border-sky-200/70 rounded-lg p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-sky-100">
                      <span className="text-sky-900 font-normal">ค่าใช้จ่ายระหว่างทริป</span>
                      <span className="font-mono font-bold text-sky-950">
                        {v.totalExpenses?.toLocaleString()} ฿
                      </span>
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {v.expenses.map((exp) => (
                        <div key={exp.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-700 truncate">
                            {exp.type === "fuel" ? "⛽ เติมน้ำมัน" : exp.type === "fluid" ? "🛢️ ของเหลว" : exp.title || "อื่นๆ"}
                            {exp.note ? ` (${exp.note})` : ""}
                          </span>
                          <span className="font-mono text-slate-800 shrink-0 ml-2">
                            {exp.amount?.toLocaleString()} ฿
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Force Return Action Button */}
              {v.activeUsageId && (
                <button
                  type="button"
                  onClick={() => {
                    setForceReturnModal(v);
                    setEndMileage(v.activeUsage?.startMileage?.toString() || "");
                  }}
                  className="w-full h-9 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-normal transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Icons.ExclamationTriangle className="w-3.5 h-3.5" />
                  <span>บังคับคืนรถ (Admin)</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Force Return Confirmation Modal */}
      {forceReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100 shrink-0">
                <Icons.ExclamationTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">ยืนยันบังคับคืนรถ</h2>
                <p className="text-xs font-normal text-slate-500">
                  ทะเบียน {forceReturnModal.licensePlate}
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs font-normal text-amber-800 leading-relaxed">
              การบังคับคืนรถจะเปลี่ยนสถานะของรถคันนี้เป็น <span className="font-bold">"พร้อมใช้งาน"</span> ทันที และบันทึกประวัติการคืนในระบบ
            </div>

            <div className="space-y-2 text-xs font-normal text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200/70">
              <div className="flex justify-between">
                <span className="text-slate-500">ผู้ใช้งาน:</span>
                <span className="font-semibold text-slate-900">
                  {forceReturnModal.driver?.name || forceReturnModal.activeUsage?.userName || "ไม่พบข้อมูล"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">เริ่มใช้งาน:</span>
                <span className="font-mono text-slate-900">
                  {forceReturnModal.activeUsage?.startTime?.toLocaleString("th-TH") || "-"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1">
                เลขไมล์สิ้นสุด (ไม่บังคับ)
              </label>
              <input
                type="number"
                value={endMileage}
                onChange={(e) => setEndMileage(e.target.value)}
                placeholder="ระบุเลขไมล์ขณะคืนรถ"
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setForceReturnModal(null);
                  setEndMileage("");
                }}
                disabled={forceReturnLoading}
                className="h-9 px-3.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-normal transition-colors cursor-pointer disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleForceReturn}
                disabled={forceReturnLoading}
                className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-normal transition-colors cursor-pointer disabled:opacity-50"
              >
                {forceReturnLoading ? "กำลังดำเนินการ..." : "ยืนยันบังคับคืนรถ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
