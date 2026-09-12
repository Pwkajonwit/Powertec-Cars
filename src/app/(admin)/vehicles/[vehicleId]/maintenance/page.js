"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import AddMaintenanceForm from "@/components/admin/AddMaintenanceForm";
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
  Wrench: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-4.486c.092-1.077-.398-2.264-1.137-3.003l-6.49 6.49" />
    </svg>
  ),
  Car: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H6.128c-.643 0-1.238.328-1.58.86A17.9 17.9 0 001.335 17.626c-.039.62.469 1.124 1.09 1.124H3.75" />
    </svg>
  ),
};

function MaintenanceRecord({ record, onSelect, isSelected }) {
  const formatDateTime = (value) => {
    if (!value) return "-";
    let dateObj;
    if (value.seconds) {
      dateObj = new Date(value.seconds * 1000);
    } else if (value.toDate) {
      dateObj = value.toDate();
    } else {
      dateObj = new Date(value);
    }
    return dateObj.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }) +
      " " + dateObj.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };

  const formatCurrency = (number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(number ?? 0);

  const displayDate = record.date ? formatDateTime(record.date) : record.createdAt ? formatDateTime(record.createdAt) : "-";
  const displayCost = record.finalCost ?? record.cost ?? 0;
  const typeLabel = record.type === "garage" ? "ซ่อมอู่" : "แจ้งค่าซ่อม";
  const status = record.maintenanceStatus || (record.type === "cost-only" ? "recorded" : "-");

  const statusBadge = (st) => {
    switch (st) {
      case "pending":
        return "bg-amber-50 text-amber-800 border border-amber-200";
      case "in_progress":
        return "bg-amber-100 text-amber-900 border border-amber-300";
      case "completed":
        return "bg-emerald-50 text-emerald-800 border border-emerald-200";
      case "cancelled":
        return "bg-rose-50 text-rose-800 border border-rose-200";
      case "recorded":
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  const statusLabel = (st) => {
    switch (st) {
      case "pending": return "รอดำเนินการ";
      case "in_progress": return "กำลังซ่อม";
      case "completed": return "เสร็จสิ้น";
      case "cancelled": return "ยกเลิก";
      case "recorded": return "บันทึกแล้ว";
      default: return "-";
    }
  };

  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      <td className="px-3.5 py-2.5 text-center w-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(record.id)}
          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
        />
      </td>
      <td className="px-3.5 py-2.5 text-xs text-slate-800 font-normal whitespace-nowrap">
        {displayDate}
      </td>
      <td className="px-3.5 py-2.5 text-xs font-normal whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-normal ${
            record.type === "garage"
              ? "bg-indigo-50 text-indigo-800 border border-indigo-200"
              : "bg-slate-100 text-slate-800 border border-slate-200"
          }`}
        >
          {typeLabel}
        </span>
      </td>
      <td className="px-3.5 py-2.5 text-xs text-slate-800 font-normal whitespace-nowrap">
        {record.vendor ?? "-"}
      </td>
      <td className="px-3.5 py-2.5 text-xs text-slate-800 font-normal max-w-xs truncate">
        {record.details || "-"}
      </td>
      <td className="px-3.5 py-2.5 text-xs font-semibold text-slate-900 font-mono text-right whitespace-nowrap">
        {formatCurrency(displayCost)}
      </td>
      <td className="px-3.5 py-2.5 text-xs font-normal whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-normal ${statusBadge(status)}`}>
            {statusLabel(status)}
          </span>
          {record.source === "admin" || record.source === "maintenances" ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-normal bg-emerald-50 text-emerald-800 border border-emerald-200">
              บันทึกจากพนักงาน
            </span>
          ) : record.source === "expenses" ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-normal bg-sky-50 text-sky-800 border border-sky-200">
              จากทริป
            </span>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

export default function MaintenancePage() {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [records, setRecords] = useState([]);
  const [maintenanceExpenses, setMaintenanceExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [receiveData, setReceiveData] = useState({ finalCost: "", finalMileage: "", notes: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Alert State
  const [alertState, setAlertState] = useState({ show: false, message: "", type: "success" });
  const showAlert = (message, type = "success") => {
    setAlertState({ show: true, message, type });
  };

  useEffect(() => {
    if (!vehicleId) return;
    const docRef = doc(db, "vehicles", vehicleId);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        setVehicle({ id: docSnap.id, ...docSnap.data() });
      }
    });
  }, [vehicleId]);

  useEffect(() => {
    if (!vehicleId) return;
    const q = query(
      collection(db, "maintenances"),
      where("vehicleId", "==", vehicleId),
      orderBy("date", "desc")
    );
    const unsubscribeMaint = onSnapshot(q, (snapshot) => {
      const recordsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), source: "maintenances" }));
      setRecords(recordsData);
    });

    const expQ = query(
      collection(db, "expenses"),
      where("vehicleId", "==", vehicleId),
      where("type", "==", "other")
    );
    const unsubscribeExp = onSnapshot(expQ, (snapshot) => {
      const maintExps = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        source: "expenses",
      }));
      setMaintenanceExpenses(maintExps);
      setLoading(false);
    });

    return () => {
      unsubscribeMaint();
      unsubscribeExp();
    };
  }, [vehicleId]);

  const allRecords = [
    ...records,
    ...maintenanceExpenses.map((exp) => {
      let date = exp.timestamp || exp.createdAt;
      if (date && typeof date === "string") date = new Date(date);
      let source = exp.source;
      if (exp.source === "admin" || exp.userId) {
        source = "admin";
      } else if (!exp.source) {
        source = "expenses";
      }
      return {
        id: exp.id,
        date,
        finalMileage: exp.mileage || null,
        type: "cost-only",
        vendor: "ค่าใช้จ่ายอื่นๆ",
        details: exp.note || "-",
        finalCost: exp.amount || 0,
        maintenanceStatus: "recorded",
        source,
      };
    }),
  ].sort((a, b) => {
    const at = a.date?.seconds
      ? a.date.seconds * 1000
      : a.date
      ? new Date(a.date).getTime()
      : a.createdAt?.seconds
      ? a.createdAt.seconds * 1000
      : 0;
    const bt = b.date?.seconds
      ? b.date.seconds * 1000
      : b.date
      ? new Date(b.date).getTime()
      : b.createdAt?.seconds
      ? b.createdAt.seconds * 1000
      : 0;
    return bt - at;
  });

  const handleReceiveSubmit = useCallback(async () => {
    if (!currentRecord) return;
    try {
      await updateDoc(doc(db, "maintenances", currentRecord.id), {
        maintenanceStatus: "completed",
        finalCost: Number(receiveData.finalCost),
        finalMileage: Number(receiveData.finalMileage),
        completionNotes: receiveData.notes || "",
        receivedAt: serverTimestamp(),
      });

      const vehicleRef = doc(db, "vehicles", vehicleId);
      const updateData = { status: "available" };
      if (receiveData.finalMileage) updateData.currentMileage = Number(receiveData.finalMileage);
      await updateDoc(vehicleRef, updateData);

      setShowReceiveModal(false);
      setCurrentRecord(null);
      showAlert("บันทึกรับรถเข้าคลังสำเร็จ", "success");
    } catch (err) {
      console.error("Error completing receive flow:", err);
      showAlert("เกิดข้อผิดพลาดในการบันทึกรับรถ", "error");
    }
  }, [currentRecord, receiveData, vehicleId]);

  const totalCost = allRecords.reduce((sum, rec) => sum + (rec.finalCost ?? rec.cost ?? 0), 0);

  const handleDeleteSelected = async () => {
    setIsClearing(true);
    setShowDeleteConfirm(false);
    try {
      const { deleteDoc, doc: docRef } = await import("firebase/firestore");
      const idsToDelete = itemToDelete ? [itemToDelete] : selectedItems;
      const deletePromises = idsToDelete.map((id) => {
        const found = allRecords.find((r) => r.id === id);
        if (found && found.source === "expenses") {
          return deleteDoc(docRef(db, "expenses", id));
        } else if (found && found.source === "maintenances") {
          return deleteDoc(docRef(db, "maintenances", id));
        }
        return Promise.resolve();
      });
      await Promise.all(deletePromises);
      setRecords((prev) => prev.filter((r) => !idsToDelete.includes(r.id)));
      setMaintenanceExpenses((prev) => prev.filter((r) => !idsToDelete.includes(r.id)));
      setSelectedItems([]);
      setItemToDelete(null);
      showAlert("ลบประวัติซ่อมบำรุงสำเร็จ", "success");
    } catch {
      showAlert("เกิดข้อผิดพลาดในการลบประวัติ", "error");
    }
    setIsClearing(false);
  };

  const handleSelectAll = () => {
    const ids = allRecords.map((r) => r.id);
    if (selectedItems.length === ids.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(ids);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const navTabs = [
    { label: "แก้ไขข้อมูล", href: `/vehicles/${vehicleId}/edit`, active: false },
    { label: "ประวัติน้ำมัน", href: `/vehicles/${vehicleId}/fuel`, active: false },
    { label: "ประวัติของเหลว", href: `/vehicles/${vehicleId}/fluid`, active: false },
    { label: "ประวัติส่งซ่อม", href: `/vehicles/${vehicleId}/garage`, active: false },
    { label: "ประวัติซ่อมบำรุง", href: `/vehicles/${vehicleId}/maintenance`, active: true },
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
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">ประวัติการซ่อมบำรุง</h1>
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
              <span>บันทึกค่าใช้จ่าย</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">ราคารวมทั้งหมด</p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(totalCost)}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Icons.Wrench className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">จำนวนบันทึกทั้งหมด</p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {allRecords.length} รายการ
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <Icons.Car className="w-4 h-4" />
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
                    checked={selectedItems.length === allRecords.length && allRecords.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  วันที่/เวลา
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  หมวดค่าใช้จ่าย
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  ชื่ออู่/ผู้ให้บริการ
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  รายละเอียด
                </th>
                <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  จำนวนเงิน
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {allRecords.length > 0 ? (
                allRecords.map((record) => (
                  <MaintenanceRecord
                    key={record.id}
                    record={record}
                    onSelect={handleSelectItem}
                    isSelected={selectedItems.includes(record.id)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs font-normal text-slate-500">
                    ยังไม่มีประวัติการซ่อมบำรุง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <AddMaintenanceForm
          vehicleId={vehicleId}
          onClose={() => setShowForm(false)}
          onlyCost={true}
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
                  ? "คุณแน่ใจหรือไม่ที่จะลบรายการนี้?"
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
                disabled={isClearing}
                className="h-9 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-normal transition-colors cursor-pointer disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={isClearing}
                className="h-9 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-normal transition-colors cursor-pointer disabled:opacity-50"
              >
                {isClearing ? "กำลังลบ..." : "ยืนยันลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}