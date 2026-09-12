"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AlertToast from "@/components/ui/AlertToast";

const Icons = {
  ArrowLeft: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  Refresh: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  ExclamationTriangle: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  CheckCircle: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Car: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H6.128c-.643 0-1.238.328-1.58.86A17.9 17.9 0 001.335 17.626c-.039.62.469 1.124 1.09 1.124H3.75" />
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  UserX: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25 9.75a7.5 7.5 0 00-11.5 0M12 11.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
    </svg>
  ),
};

export default function OrphanedUsagePage() {
  const [orphanedUsages, setOrphanedUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forceReturnLoading, setForceReturnLoading] = useState(null);
  const [confirmModalUsage, setConfirmModalUsage] = useState(null);

  // Alert State
  const [alertState, setAlertState] = useState({ show: false, message: "", type: "success" });
  const showAlert = (message, type = "success") => {
    setAlertState({ show: true, message, type });
  };

  useEffect(() => {
    fetchOrphanedUsages();
  }, []);

  const fetchOrphanedUsages = async () => {
    setLoading(true);
    try {
      const usagesQ = query(
        collection(db, "vehicle-usage"),
        where("status", "==", "active"),
        orderBy("startTime", "desc")
      );
      const usagesSnap = await getDocs(usagesQ);
      const orphaned = [];

      for (const usageDoc of usagesSnap.docs) {
        const usageData = usageDoc.data();
        const hasUserInfo = usageData.userName || usageData.userId;
        const startTime = usageData.startTime?.toDate?.() || new Date(usageData.startTime);
        const now = new Date();
        const hoursDiff = (now - startTime) / (1000 * 60 * 60);

        if (hoursDiff > 12 || !hasUserInfo) {
          let vehicleData = null;
          try {
            const vehicleDoc = await getDocs(
              query(collection(db, "vehicles"), where("__name__", "==", usageData.vehicleId))
            );
            if (!vehicleDoc.empty) {
              vehicleData = { id: vehicleDoc.docs[0].id, ...vehicleDoc.docs[0].data() };
            }
          } catch (e) {
            console.error("Failed to fetch vehicle:", e);
          }

          orphaned.push({
            id: usageDoc.id,
            ...usageData,
            startTime,
            hoursDiff: Math.round(hoursDiff * 10) / 10,
            hasUserInfo,
            vehicle: vehicleData,
          });
        }
      }

      setOrphanedUsages(orphaned);
    } catch (err) {
      console.error("Error fetching orphaned usages:", err);
      showAlert("เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");
    }
    setLoading(false);
  };

  const handleForceReturn = async () => {
    if (!confirmModalUsage) return;
    const usage = confirmModalUsage;
    setForceReturnLoading(usage.id);

    try {
      const response = await fetch("/api/vehicle-usage/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usageId: usage.id,
          endMileage: null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showAlert("บังคับคืนรถสำเร็จ และปรับสถานะเป็นพร้อมใช้งานแล้ว", "success");
        setConfirmModalUsage(null);
        fetchOrphanedUsages();
      } else {
        showAlert(data.error || "เกิดข้อผิดพลาดในการคืนรถ", "error");
      }
    } catch (err) {
      console.error("Force return error:", err);
      showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
    setForceReturnLoading(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const noUserInfoCount = orphanedUsages.filter((u) => !u.hasUserInfo).length;
  const over24hCount = orphanedUsages.filter((u) => u.hoursDiff > 24).length;

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
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              การใช้งานที่น่าสงสัย (ค้างคืน / ไม่มีข้อมูลผู้ใช้)
            </h1>
            <p className="text-xs font-normal text-slate-600 mt-0.5">
              รายการรถที่มีการใช้งานนานเกิน 12 ชั่วโมง หรือไม่มีข้อมูลผู้ใช้ ให้แอดมินตรวจสอบและบังคับคืนสถานะ
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchOrphanedUsages}
          className="h-9 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-normal transition-colors flex items-center gap-1.5 self-end sm:self-auto shadow-xs cursor-pointer"
        >
          <Icons.Refresh className="w-3.5 h-3.5" />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">ไม่มีข้อมูลผู้ใช้งาน</p>
            <p className="text-base sm:text-lg font-bold font-mono text-rose-700 mt-0.5">
              {noUserInfoCount} รายการ
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
            <Icons.UserX className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">ใช้งานเกิน 24 ชั่วโมง</p>
            <p className="text-base sm:text-lg font-bold font-mono text-amber-700 mt-0.5">
              {over24hCount} รายการ
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <Icons.Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">รอการตรวจสอบทั้งหมด</p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {orphanedUsages.length} รายการ
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <Icons.ExclamationTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      {orphanedUsages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
            <Icons.CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">ไม่พบการใช้งานที่น่าสงสัย</h3>
          <p className="text-xs font-normal text-slate-500 mt-1">
            รถทุกคันมีการใช้งานและคืนรถเข้าสู่ระบบตามกำหนดอย่างถูกต้อง
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orphanedUsages.map((usage) => {
            const licensePlate = usage.vehicleLicensePlate || usage.vehicle?.licensePlate || "ไม่ทราบทะเบียน";
            const borderAccent = !usage.hasUserInfo
              ? "border-l-rose-500"
              : usage.hoursDiff > 24
              ? "border-l-amber-500"
              : "border-l-yellow-400";

            return (
              <div
                key={usage.id}
                className={`bg-white rounded-xl shadow-xs border border-slate-200/80 border-l-4 ${borderAccent} p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3.5`}
              >
                {/* Vehicle Thumbnail & Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {usage.vehicle?.imageUrl ? (
                    <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <Image
                        src={usage.vehicle.imageUrl}
                        alt={usage.vehicle.brand || ""}
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

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-900 border border-slate-200">
                        {licensePlate}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {usage.vehicle?.brand} {usage.vehicle?.model}
                      </span>
                    </div>
                    <p className="text-xs font-normal text-slate-500 truncate mt-0.5">
                      จุดหมาย: {usage.destination || "-"}
                    </p>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  {usage.hasUserInfo ? (
                    <div>
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {usage.userName || "ไม่ระบุชื่อ"}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500 truncate">
                        {usage.userId}
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-normal bg-rose-50 text-rose-700 border border-rose-200">
                      <Icons.ExclamationTriangle className="w-3 h-3" />
                      ไม่พบข้อมูลผู้ใช้
                    </span>
                  )}
                </div>

                {/* Timing Info */}
                <div className="text-left md:text-right shrink-0">
                  <div className="text-xs font-normal text-slate-500">
                    เริ่ม:{" "}
                    <span className="font-mono text-slate-700">
                      {usage.startTime.toLocaleString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div
                    className={`text-xs font-bold font-mono mt-0.5 ${
                      usage.hoursDiff > 24
                        ? "text-rose-600"
                        : usage.hoursDiff > 12
                        ? "text-amber-600"
                        : "text-slate-700"
                    }`}
                  >
                    ใช้งานมาแล้ว {usage.hoursDiff} ชม.
                  </div>
                </div>

                {/* Force Return Button */}
                <div className="shrink-0 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => setConfirmModalUsage(usage)}
                    disabled={forceReturnLoading === usage.id}
                    className="h-9 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-normal transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Icons.ExclamationTriangle className="w-3.5 h-3.5" />
                    <span>บังคับคืน</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Force Return Confirmation Modal */}
      {confirmModalUsage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100 shrink-0">
                <Icons.ExclamationTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">ยืนยันบังคับคืนรถ</h2>
                <p className="text-xs font-normal text-slate-500">
                  {confirmModalUsage.vehicleLicensePlate || confirmModalUsage.vehicle?.licensePlate || "รถคันนี้"}
                </p>
              </div>
            </div>

            <p className="text-xs font-normal text-slate-600 leading-relaxed">
              คุณต้องการบังคับคืนสถานะรถคันนี้ใช่หรือไม่? การคืนจะทำให้สถานะรถเปลี่ยนเป็น <span className="font-bold">"พร้อมใช้งาน"</span> ทันที
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModalUsage(null)}
                disabled={forceReturnLoading === confirmModalUsage.id}
                className="h-9 px-3.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-normal transition-colors cursor-pointer disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleForceReturn}
                disabled={forceReturnLoading === confirmModalUsage.id}
                className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-normal transition-colors cursor-pointer disabled:opacity-50"
              >
                {forceReturnLoading === confirmModalUsage.id ? "กำลังดำเนินการ..." : "ยืนยันบังคับคืน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
