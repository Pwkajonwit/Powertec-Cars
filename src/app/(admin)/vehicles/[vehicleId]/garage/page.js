"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc, deleteDoc } from "firebase/firestore";
import AlertToast from "@/components/ui/AlertToast";
import AddMaintenanceForm from "@/components/admin/AddMaintenanceForm";

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
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.398-3.003 1.137l-6.49 6.49a2.25 2.25 0 01-3.182-3.182l6.49-6.49c.739-.739 1.228-1.927 1.137-3.003A4.5 4.5 0 0116.32 1.32a.75.75 0 01.884.884 3 3 0 004.243 4.243.75.75 0 01.884.884z" />
    </svg>
  ),
  Car: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H6.128c-.643 0-1.238.328-1.58.86A17.9 17.9 0 001.335 17.626c-.039.62.469 1.124 1.09 1.124H3.75" />
    </svg>
  ),
};

function GarageRecord({ record, selected, onSelect, onDelete }) {
  const formatDateTime = (value) => {
    if (!value) return "-";
    let dateObj = value.seconds ? new Date(value.seconds * 1000) : new Date(value);
    return dateObj.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }) +
      " " + dateObj.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };

  const formatCurrency = (number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(number || 0);

  const translateStatus = (s) => {
    switch (s) {
      case "pending": return "รอดำเนินการ";
      case "in_progress": return "กำลังซ่อม";
      case "completed": return "เสร็จสิ้น";
      case "cancelled": return "ยกเลิก";
      case "recorded": return "บันทึกแล้ว";
      default: return s || "-";
    }
  };

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

  const displayCost = record.finalCost ?? record.cost ?? 0;
  const displayMileage = record.odometerAtDropOff ?? record.mileage ?? null;

  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      <td className="px-3.5 py-2.5 text-center w-10">
        {record.source === "maintenances" ? (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={(e) => onSelect(record.id, e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
        ) : (
          <span className="text-slate-300 text-xs">-</span>
        )}
      </td>
      <td className="px-3.5 py-2.5 text-xs text-slate-800 font-normal whitespace-nowrap">
        {formatDateTime(record.createdAt)}
      </td>
      <td className="px-3.5 py-2.5 text-xs text-slate-800 font-normal whitespace-nowrap">
        {record.vendor ?? "-"}
      </td>
      <td className="px-3.5 py-2.5 text-xs text-slate-800 font-normal max-w-xs truncate">
        {record.details ?? "-"}
      </td>
      <td className="px-3.5 py-2.5 text-xs text-slate-800 font-normal font-mono whitespace-nowrap">
        {displayMileage ? `${displayMileage.toLocaleString()} กม.` : "-"}
      </td>
      <td className="px-3.5 py-2.5 text-xs font-semibold text-slate-900 font-mono text-right whitespace-nowrap">
        {formatCurrency(displayCost)}
      </td>
      <td className="px-3.5 py-2.5 text-xs font-normal whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-normal ${statusBadge(record.maintenanceStatus)}`}>
            {translateStatus(record.maintenanceStatus)}
          </span>
          {record.source === "expenses" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-normal bg-sky-50 text-sky-800 border border-sky-200">
              จากทริป
            </span>
          )}
          {record.source === "maintenances" && (
            <button
              onClick={() => onDelete(record.id)}
              className="h-6 px-1.5 text-[11px] font-normal text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded transition-colors cursor-pointer"
            >
              ลบ
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function VehicleGaragePage() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Alert State
  const [alertState, setAlertState] = useState({ show: false, message: "", type: "success" });
  const showAlert = (message, type = "success") => {
    setAlertState({ show: true, message, type });
  };

  const handleSelect = (id, checked) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const handleDeleteSingle = (id) => {
    setDeleteTargetIds([id]);
    setShowDeleteModal(true);
  };

  const handleDeleteMultiple = () => {
    if (selectedIds.length === 0) return;
    setDeleteTargetIds(selectedIds);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      for (const id of deleteTargetIds) {
        await deleteDoc(doc(db, "maintenances", id));
      }
      setSelectedIds([]);
      setDeleteTargetIds([]);
      setShowDeleteModal(false);
      showAlert("ลบรายการสำเร็จ", "success");
    } catch {
      showAlert("เกิดข้อผิดพลาดในการลบ", "error");
    }
    setDeleting(false);
  };

  const params = useParams();
  const vehicleId = params?.vehicleId;
  const [vehicle, setVehicle] = useState(null);
  const [items, setItems] = useState([]);
  const [garageExpenses, setGarageExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vehicleId) return;
    const vRef = doc(db, "vehicles", vehicleId);
    getDoc(vRef).then((snap) => {
      if (snap.exists()) setVehicle({ id: snap.id, ...snap.data() });
    });

    const q = query(
      collection(db, "maintenances"),
      where("type", "==", "garage"),
      where("vehicleId", "==", vehicleId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data(), source: "maintenances" }));
      arr.sort((a, b) => {
        const at = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      });
      setItems(arr);
    });

    const fetchGarageExpenses = async () => {
      try {
        const bookingsSnap = await (await import("firebase/firestore")).getDocs(
          query(collection(db, "bookings"), where("vehicleId", "==", vehicleId))
        );
        const bookingsMap = {};
        bookingsSnap.docs.forEach((d) => {
          bookingsMap[d.id] = d.data();
        });
        const bookingIds = Object.keys(bookingsMap);

        if (bookingIds.length === 0) {
          setGarageExpenses([]);
          setLoading(false);
          return;
        }

        const expensesSnap = await (await import("firebase/firestore")).getDocs(collection(db, "expenses"));
        const garageExps = expensesSnap.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
            source: "expenses",
            bookingData: bookingsMap[d.data().bookingId],
          }))
          .filter((exp) => {
            if (!bookingIds.includes(exp.bookingId)) return false;
            const note = (exp.note || "").toLowerCase();
            const vendor = (exp.vendor || "").toLowerCase();
            return (
              note.includes("อู่") ||
              note.includes("ซ่อม") ||
              note.includes("garage") ||
              note.includes("repair") ||
              vendor.includes("อู่") ||
              vendor.includes("garage")
            );
          });

        setGarageExpenses(garageExps);
      } catch (e) {
        console.error("Error fetching garage expenses:", e);
      }
      setLoading(false);
    };

    fetchGarageExpenses();
    return () => unsub();
  }, [vehicleId]);

  const allItems = [
    ...items,
    ...garageExpenses.map((exp) => {
      let createdAt = exp.bookingData?.startDateTime;
      if (!createdAt) createdAt = exp.createdAt || exp.date;
      if (createdAt && typeof createdAt === "string") createdAt = new Date(createdAt);
      return {
        id: exp.id,
        vendor: exp.vendor || "ไม่ระบุ",
        details: exp.note || "-",
        odometerAtDropOff: exp.mileage || null,
        finalMileage: null,
        maintenanceStatus: "recorded",
        createdAt,
        cost: exp.amount || 0,
        finalCost: exp.amount || 0,
        source: "expenses",
      };
    }),
  ].sort((a, b) => {
    const at = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  });

  const totalCost = allItems.reduce((sum, it) => {
    const c = Number(it.finalCost ?? it.cost ?? 0) || 0;
    return sum + c;
  }, 0);

  const inProgressCount = allItems.filter((i) => i.maintenanceStatus === "in_progress").length;

  const navTabs = [
    { label: "แก้ไขข้อมูล", href: `/vehicles/${vehicleId}/edit`, active: false },
    { label: "ประวัติน้ำมัน", href: `/vehicles/${vehicleId}/fuel`, active: false },
    { label: "ประวัติของเหลว", href: `/vehicles/${vehicleId}/fluid`, active: false },
    { label: "ประวัติส่งซ่อม", href: `/vehicles/${vehicleId}/garage`, active: true },
    { label: "ประวัติซ่อมบำรุง", href: `/vehicles/${vehicleId}/maintenance`, active: false },
  ];

  if (!vehicleId) return <p className="p-6 text-xs text-slate-500">ไม่พบรหัสรถ</p>;

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
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">บันทึกส่งซ่อมของรถ</h1>
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
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteMultiple}
                className="h-9 px-3 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-normal transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Icons.Trash className="w-3.5 h-3.5" />
                <span>ลบที่เลือก ({selectedIds.length})</span>
              </button>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-normal transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Icons.Plus className="w-4 h-4" />
              <span>ส่งซ่อมอู่</span>
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
            <p className="text-xs font-normal text-slate-600">ค่าซ่อมรวมทั้งหมด</p>
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
            <p className="text-xs font-normal text-slate-600">จำนวนบันทึกส่งซ่อม</p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {allItems.length} รายการ
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <Icons.Car className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">กำลังซ่อมอยู่</p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {inProgressCount} รายการ
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <Icons.Wrench className="w-4 h-4" />
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
                    checked={selectedIds.length === items.length && items.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(items.map((i) => i.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    disabled={items.length === 0}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-40"
                  />
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  วันที่/เวลา
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  อู่/ผู้ให้บริการ
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  รายละเอียด
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  เลขไมล์
                </th>
                <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  ค่าใช้จ่าย
                </th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {allItems.length > 0 ? (
                allItems.map((rec) => (
                  <GarageRecord
                    key={rec.id}
                    record={rec}
                    selected={selectedIds.includes(rec.id)}
                    onSelect={handleSelect}
                    onDelete={handleDeleteSingle}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs font-normal text-slate-500">
                    ยังไม่มีบันทึกการส่งซ่อมสำหรับคันนี้
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
          onlyCost={false}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการลบรายการ</h3>
              <p className="text-xs font-normal text-slate-600 mt-1.5 leading-relaxed">
                คุณต้องการลบ {deleteTargetIds.length} รายการที่เลือกหรือไม่?
              </p>
              <p className="text-[11px] font-normal text-rose-600 mt-1">
                การดำเนินการนี้ไม่สามารถเรียกคืนได้
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="h-9 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-normal transition-colors cursor-pointer disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="h-9 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-normal transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? "กำลังลบ..." : "ยืนยันลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
