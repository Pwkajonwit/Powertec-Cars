"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import AddFluidLogForm from "@/components/admin/AddFluidLogForm";
import AlertToast from "@/components/ui/AlertToast";

const Icons = {
  ArrowLeft: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  Plus: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Trash: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Droplet: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.25 7.5-7.5 10.5-7.5 13.5a7.5 7.5 0 0015 0c0-3-2.25-6-7.5-13.5z" />
    </svg>
  ),
  Car: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H6.128c-.643 0-1.238.328-1.58.86A17.9 17.9 0 001.335 17.626c-.039.62.469 1.124 1.09 1.124H3.75" />
    </svg>
  ),
};

// Row item component with user lookup
function FluidRecord({ record, onSelect, isSelected }) {
  const [userName, setUserName] = useState(record.userName || "-");

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    let dateObj = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return dateObj.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }) +
      " " + dateObj.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };

  const formatCurrency = (number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(number || 0);

  useEffect(() => {
    async function fetchUser() {
      const uid = (record.userId || "").toString().trim();
      if (uid) {
        try {
          const userRef = doc(db, "users", uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setUserName(data.name || data.fullName || "-");
            return;
          }
          const q = query(collection(db, "users"), where("lineId", "==", uid));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            const data = qSnap.docs[0].data();
            setUserName(data.name || data.fullName || "-");
            return;
          }
          setUserName("-");
        } catch {
          setUserName("-");
        }
      } else {
        setUserName("-");
      }
    }
    fetchUser();
  }, [record.userId]);

  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      <td className="px-3.5 py-2.5 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(record.id)}
          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
        />
      </td>
      <td className="px-3.5 py-2.5 text-xs text-slate-800 font-normal whitespace-nowrap">
        {formatDateTime(record.timestamp)}
      </td>
      <td className="px-3.5 py-2.5 text-xs text-slate-800 font-normal whitespace-nowrap">
        {userName}
      </td>
      <td className="px-3.5 py-2.5 text-xs text-slate-800 font-normal font-mono whitespace-nowrap">
        {record.mileage ? `${record.mileage.toLocaleString()} กม.` : "-"}
      </td>
      <td className="px-3.5 py-2.5 text-xs font-semibold text-slate-900 font-mono text-right whitespace-nowrap">
        {record.amount ? formatCurrency(record.amount) : "-"}
      </td>
      <td className="px-3.5 py-2.5 text-xs font-normal whitespace-nowrap">
        {record.source === "admin" ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-normal bg-emerald-50 text-emerald-800 border border-emerald-200">
            บันทึกจากพนักงาน
          </span>
        ) : record.usageId ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-normal bg-sky-50 text-sky-800 border border-sky-200">
            จากทริป
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-normal bg-slate-100 text-slate-800 border border-slate-200">
            ทั่วไป
          </span>
        )}
      </td>
    </tr>
  );
}

export default function FluidHistoryPage() {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [fluidLogs, setFluidLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Alert State
  const [alertState, setAlertState] = useState({ show: false, message: "", type: "success" });
  const showAlert = (message, type = "success") => {
    setAlertState({ show: true, message, type });
  };

  useEffect(() => {
    if (!vehicleId) return;
    const vehicleRef = doc(db, "vehicles", vehicleId);
    getDoc(vehicleRef).then((docSnap) => {
      if (docSnap.exists()) setVehicle({ id: docSnap.id, ...docSnap.data() });
    });

    const fetchFluidExpenses = async () => {
      try {
        const expensesSnap = await getDocs(
          query(collection(db, "expenses"), where("vehicleId", "==", vehicleId), where("type", "==", "fluid"))
        );
        const fluidExps = expensesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          source: "expenses",
        }));
        const sorted = fluidExps.sort((a, b) => {
          const at = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
          const bt = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
          return bt - at;
        });
        setFluidLogs(sorted);
      } catch (e) {
        console.error(e);
        setFluidLogs([]);
      }
      setLoading(false);
    };
    fetchFluidExpenses();
  }, [vehicleId]);

  const totalCost = fluidLogs.reduce((sum, rec) => sum + (rec.amount || 0), 0);
  const lastMileage =
    fluidLogs.length > 0 && fluidLogs.some((r) => r.mileage)
      ? Math.max(...fluidLogs.filter((r) => r.mileage).map((r) => r.mileage))
      : null;

  const handleDeleteSelected = async () => {
    setShowDeleteConfirm(false);
    setIsReloading(true);
    try {
      const { deleteDoc, doc: docRef } = await import("firebase/firestore");
      const idsToDelete = itemToDelete ? [itemToDelete] : selectedItems;

      const deletePromises = idsToDelete.map((id) => deleteDoc(docRef(db, "expenses", id)));
      await Promise.all(deletePromises);

      setFluidLogs((prev) => prev.filter((item) => !idsToDelete.includes(item.id)));
      setSelectedItems([]);
      setItemToDelete(null);
      setIsReloading(false);
      showAlert("ลบรายการที่เลือกสำเร็จ", "success");
    } catch (error) {
      console.error("Error deleting fluid records:", error);
      showAlert("เกิดข้อผิดพลาดในการลบ", "error");
      setIsReloading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === fluidLogs.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(fluidLogs.map((log) => log.id));
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const navTabs = [
    { label: "แก้ไขข้อมูล", href: `/vehicles/${vehicleId}/edit`, active: false },
    { label: "ประวัติน้ำมัน", href: `/vehicles/${vehicleId}/fuel`, active: false },
    { label: "ประวัติของเหลว", href: `/vehicles/${vehicleId}/fluid`, active: true },
    { label: "ประวัติส่งซ่อม", href: `/vehicles/${vehicleId}/garage`, active: false },
    { label: "ประวัติซ่อมบำรุง", href: `/vehicles/${vehicleId}/maintenance`, active: false },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <AlertToast
        show={alertState.show}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState((prev) => ({ ...prev, show: false }))}
      />

      {/* Header & Sub-Navigation Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/vehicles"
              className="h-9 w-9 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
              title="กลับไปหน้ารายการรถ"
            >
              <Icons.ArrowLeft className="w-4 h-4" />
            </Link>

            {vehicle?.imageUrl ? (
              <div className="relative w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                <Image
                  src={vehicle.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-12 h-9 sm:w-14 sm:h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                <Icons.Car className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">ประวัติการเปลี่ยนของเหลว</h1>
                {vehicle?.licensePlate && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-900 border border-slate-200">
                    {vehicle.licensePlate}
                  </span>
                )}
              </div>
              <p className="text-xs font-normal text-slate-600 mt-0.5">
                {vehicle?.brand} {vehicle?.model} {vehicle?.year ? `(${vehicle.year})` : ""}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {selectedItems.length > 0 && (
              <button
                onClick={() => {
                  setItemToDelete(null);
                  setShowDeleteConfirm(true);
                }}
                className="h-9 px-3 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-normal transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Icons.Trash className="w-3.5 h-3.5" />
                <span>ลบที่เลือก ({selectedItems.length})</span>
              </button>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-normal transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Icons.Plus className="w-4 h-4" />
              <span>เพิ่มรายการของเหลว</span>
            </button>
          </div>
        </div>

        {/* Subpage Pill Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto">
          {navTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`h-8 px-3 rounded-lg text-xs font-normal whitespace-nowrap transition-colors flex items-center ${
                tab.active
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">ราคารวมทั้งหมด</p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(totalCost)}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Icons.Droplet className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">เลขไมล์ล่าสุดที่เปลี่ยน</p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {lastMileage ? `${lastMileage.toLocaleString()} กม.` : "-"}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <Icons.Car className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">จำนวนบันทึกทั้งหมด</p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {fluidLogs.length} รายการ
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <Icons.Droplet className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-3.5 py-2 text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === fluidLogs.length && fluidLogs.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  วันที่/เวลา
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  ผู้บันทึก
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  เลขไมล์
                </th>
                <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  ราคา
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  แหล่งที่มา
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {fluidLogs.length > 0 ? (
                fluidLogs.map((log) => (
                  <FluidRecord
                    key={log.id}
                    record={log}
                    onSelect={handleSelectItem}
                    isSelected={selectedItems.includes(log.id)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs font-normal text-slate-500">
                    ยังไม่มีประวัติการเปลี่ยนของเหลว
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <AddFluidLogForm
          vehicleId={vehicleId}
          onClose={(success) => {
            setShowForm(false);
            if (success) {
              setIsReloading(true);
              setTimeout(() => {
                window.location.reload();
              }, 300);
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการลบรายการ</h3>
              <p className="text-xs font-normal text-slate-600 mt-1.5 leading-relaxed">
                {itemToDelete
                  ? "คุณแน่ใจหรือไม่ที่จะลบรายการเปลี่ยนของเหลวนี้?"
                  : `คุณแน่ใจหรือไม่ที่จะลบ ${selectedItems.length} รายการที่เลือก?`}
              </p>
              <p className="text-[11px] font-normal text-rose-600 mt-1">
                การดำเนินการนี้ไม่สามารถเรียกคืนได้
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="h-9 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-normal transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="h-9 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-normal transition-colors cursor-pointer"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay during reload */}
      {isReloading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-xs font-normal text-slate-700">กำลังอัปเดตข้อมูล...</p>
          </div>
        </div>
      )}
    </div>
  );
}
