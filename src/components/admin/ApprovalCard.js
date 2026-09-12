"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, writeBatch, deleteDoc } from "firebase/firestore";
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageHelpers';

// Helper แสดงเฉพาะวันที่
export const formatDateOnly = (value) => {
  if (!value) return '-';
  try {
    let d;
    if (value.seconds && typeof value.seconds === 'number') d = new Date(value.seconds * 1000);
    else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const parts = value.split('-');
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0);
    } else if (value.toDate) d = new Date(value.toDate());
    else d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('th-TH');
  } catch (e) {
    return '-';
  }
};

// Modal Component มอบหมายรถและคนขับ (Mini-Compact & High Contrast)
export function AssignVehicleModal({ booking, onClose, onAssign }) {
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [showVehicleList, setShowVehicleList] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [assignOther, setAssignOther] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available vehicles
        const vehicleQuery = query(collection(db, "vehicles"), where("status", "in", ["available", "pending"]));
        const vehicleSnapshot = await getDocs(vehicleQuery);
        const vehicles = vehicleSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        let ordered = vehicles;
        const bookedId = booking.vehicleId;
        const bookedPlate = booking.vehicleLicensePlate;
        if (bookedId || bookedPlate) {
          const matchIndex = vehicles.findIndex(v => (bookedId && v.id === bookedId) || (bookedPlate && v.licensePlate === bookedPlate));
          if (matchIndex > -1) {
            const [matched] = vehicles.splice(matchIndex, 1);
            ordered = [matched, ...vehicles];
          }
        }
        setAvailableVehicles(ordered);

        if (bookedId) {
          setSelectedVehicleId(bookedId);
        } else if (bookedPlate) {
          const found = ordered.find(v => v.licensePlate === bookedPlate);
          if (found) setSelectedVehicleId(found.id);
        }

        if (booking.vehicleId || booking.vehicleLicensePlate) setShowVehicleList(false);

        // Fetch drivers
        const driverQuery = query(collection(db, "users"), where("role", "==", "driver"));
        const driverSnapshot = await getDocs(driverQuery);
        const drivers = driverSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setAvailableDrivers(drivers);

        // Try pre-select requester as driver
        const requesterEmail = booking.userEmail || booking.requesterEmail || booking.requester?.email;
        if (requesterEmail) {
          const found = drivers.find(d => d.email === requesterEmail);
          if (found) {
            setSelectedDriverId(found.id);
            setAssignOther(false);
          } else {
            setAssignOther(true);
          }
        } else {
          setAssignOther(true);
        }
      } catch (err) {
        console.error("Error loading assets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [booking]);

  const handleAssign = () => {
    if (!selectedVehicleId || !selectedDriverId) {
      alert("กรุณาเลือกรถและคนขับให้ครบถ้วน");
      return;
    }
    const selectedVehicle = availableVehicles.find(v => v.id === selectedVehicleId);
    const selectedDriver = availableDrivers.find(d => d.id === selectedDriverId);
    onAssign(selectedVehicle, selectedDriver);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
        <div className="bg-white rounded-xl p-5 shadow-xl text-center text-xs font-normal text-slate-700">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          กำลังโหลดข้อมูลยานพาหนะและคนขับ...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              มอบหมายยานพาหนะและคนขับ
            </h3>
            <p className="text-xs font-normal text-slate-600 mt-0.5">
              คำขอจอง ID: <span className="font-mono text-slate-900 font-semibold">{booking.id.substring(0, 8)}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar">
          
          {/* Section: Vehicle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-900">ยานพาหนะที่เลือก</label>
              {selectedVehicleId && !showVehicleList && (
                <button
                  type="button"
                  onClick={() => setShowVehicleList(true)}
                  className="text-xs font-normal text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  เปลี่ยนรถคันอื่น
                </button>
              )}
            </div>

            {selectedVehicleId && !showVehicleList && (() => {
              const sv = availableVehicles.find(x => x.id === selectedVehicleId);
              if (!sv) return null;
              return (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-16 h-12 relative rounded bg-slate-200 overflow-hidden shrink-0">
                    {getImageUrl(sv) ? (
                      <Image src={getImageUrl(sv)} alt={sv.licensePlate} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">ไม่มีรูป</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 font-mono">{sv.licensePlate}</div>
                    <div className="text-xs font-normal text-slate-700">{sv.brand} {sv.model}</div>
                    <div className="text-[11px] font-normal text-slate-500">ไมล์ปัจจุบัน: {sv.currentMileage?.toLocaleString() ?? '-'} กม.</div>
                  </div>
                </div>
              );
            })()}

            {/* List to choose vehicle */}
            {showVehicleList && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-lg custom-scrollbar">
                {availableVehicles.map(v => (
                  <div
                    key={v.id}
                    onClick={() => { setSelectedVehicleId(v.id); setShowVehicleList(false); }}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition border ${
                      selectedVehicleId === v.id ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-12 h-9 relative rounded bg-slate-200 overflow-hidden shrink-0">
                      {getImageUrl(v) ? (
                        <Image src={getImageUrl(v)} alt={v.licensePlate} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">ไม่มีรูป</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 font-mono truncate">{v.licensePlate}</div>
                      <div className="text-[11px] font-normal text-slate-600 truncate">{v.brand} {v.model}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Driver */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-900">คนขับที่มอบหมาย</label>
              {selectedDriverId && !assignOther && (
                <button
                  type="button"
                  onClick={() => setAssignOther(true)}
                  className="text-xs font-normal text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  เลือกคนขับท่านอื่น
                </button>
              )}
            </div>

            {selectedDriverId && !assignOther && (() => {
              const d = availableDrivers.find(x => x.id === selectedDriverId);
              if (!d) return null;
              return (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {(d.name || d.email || 'U')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900">{d.name || 'ไม่ระบุชื่อ'}</div>
                    <div className="text-xs font-normal text-slate-600">{d.email}</div>
                    <div className="text-[11px] font-normal text-slate-500">{d.position || 'พนักงานขับรถ'}</div>
                  </div>
                </div>
              );
            })()}

            {/* List to choose driver */}
            {(assignOther || !selectedDriverId) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-lg custom-scrollbar">
                {availableDrivers.map(d => (
                  <div
                    key={d.id}
                    onClick={() => { setSelectedDriverId(d.id); setAssignOther(false); }}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition border ${
                      selectedDriverId === d.id ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {(d.name || d.email || 'U')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">{d.name}</div>
                      <div className="text-[11px] font-normal text-slate-600 truncate">{d.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3.5 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleAssign}
            className="h-9 px-4 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs cursor-pointer"
          >
            ยืนยันการอนุมัติ
          </button>
        </div>
      </div>
    </div>
  );
}

// Table Row Component (Compact & High Contrast)
export function ApprovalRow({ booking, onApprove, onReject, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const hasIssues = booking.issues && booking.issues.length > 0;

  return (
    <>
      <tr className="hover:bg-slate-50/80 transition-colors">
        {/* รหัส & วันที่ยื่น */}
        <td className="px-3.5 py-2.5 whitespace-nowrap">
          <div className="text-xs font-bold text-slate-900 font-mono">#{booking.id.substring(0, 6)}</div>
          <div className="text-[11px] font-normal text-slate-500">
            {booking.createdAt ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString('th-TH') : '-'}
          </div>
        </td>

        {/* ผู้ขอจอง */}
        <td className="px-3.5 py-2.5">
          <div className="flex items-center gap-2 min-w-[130px]">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {(booking.requesterName || booking.userEmail || 'U')[0]}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {booking.requesterName || booking.userEmail}
              </div>
              {booking.isAdminBooking && (
                <span className="inline-block px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[9px] font-normal">
                  แอดมิน
                </span>
              )}
            </div>
          </div>
        </td>

        {/* รถยนต์ / ทะเบียน */}
        <td className="px-3.5 py-2.5 whitespace-nowrap">
          <div className="text-xs font-bold text-slate-900 font-mono">
            {booking.vehicleLicensePlate || booking.vehicleId || '-'}
          </div>
          {booking.driverName && (
            <div className="text-[11px] font-normal text-slate-600 truncate">
              คนขับ: {booking.driverName}
            </div>
          )}
        </td>

        {/* ช่วงวันที่ใช้งาน */}
        <td className="px-3.5 py-2.5 whitespace-nowrap">
          <div className="text-xs font-normal text-slate-800">
            {formatDateOnly(booking.startDateTime || booking.startCalendarDate || booking.startDate)}
          </div>
          <div className="text-[11px] font-normal text-slate-500">
            ถึง {formatDateOnly(booking.endDateTime || booking.endCalendarDate || booking.endDate)}
          </div>
        </td>

        {/* จุดหมาย & วัตถุประสงค์ */}
        <td className="px-3.5 py-2.5">
          <div className="text-xs font-normal text-slate-800 truncate max-w-[160px]">
            {booking.destination || '-'}
          </div>
          <div className="text-[11px] font-normal text-slate-500 truncate max-w-[160px]" title={booking.purpose}>
            {booking.purpose || '-'}
          </div>
        </td>

        {/* สถานะความพร้อม */}
        <td className="px-3.5 py-2.5 whitespace-nowrap">
          {hasIssues ? (
            <div className="group relative inline-block">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-normal bg-rose-50 text-rose-800 border border-rose-200 cursor-help">
                <span>⚠️</span> มีปัญหา ({booking.issues.length})
              </span>
              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-30 w-52 p-2 bg-slate-900 text-white text-[11px] font-normal rounded-lg shadow-lg">
                <ul className="list-disc list-inside space-y-0.5">
                  {booking.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-normal bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span>✓</span> พร้อมอนุมัติ
            </span>
          )}
        </td>

        {/* การดำเนินการ */}
        <td className="px-3.5 py-2.5 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => {
                if (hasIssues) {
                  if (!confirm("คำขอนี้ตรวจพบปัญหาความขัดแย้งของข้อมูล คุณต้องการดำเนินการมอบหมายต่อไปหรือไม่?")) return;
                }
                setShowModal(true);
              }}
              className="h-7 px-2.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition cursor-pointer"
            >
              อนุมัติ
            </button>
            <button
              onClick={() => onReject(booking.id, booking.vehicleId)}
              className="h-7 px-2 text-xs font-normal text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition cursor-pointer"
            >
              ปฏิเสธ
            </button>
            <button
              onClick={() => onDelete(booking.id)}
              className="h-7 px-1.5 text-xs font-normal text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
              title="ลบคำขอ"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </td>
      </tr>

      {showModal && (
        <AssignVehicleModal
          booking={booking}
          onClose={() => setShowModal(false)}
          onAssign={(v, d) => {
            onApprove(booking, v, d);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

// Card View Component (Mini-Compact, High Contrast)
export default function ApprovalCard({ booking, onApprove, onReject, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const hasIssues = booking.issues && booking.issues.length > 0;

  return (
    <>
      <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          {/* Header row: ID & Status Badges */}
          <div className="flex items-center justify-between gap-1.5 mb-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 font-mono">
              #{booking.id.substring(0, 6)}
            </span>
            <div className="flex items-center gap-1">
              {booking.isAdminBooking && (
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-normal">
                  แอดมิน
                </span>
              )}
              {hasIssues ? (
                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10px] font-normal">
                  มีปัญหา ({booking.issues.length})
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-normal">
                  พร้อมอนุมัติ
                </span>
              )}
            </div>
          </div>

          {/* Requester Info */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {(booking.requesterName || booking.userEmail || 'U')[0]}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {booking.requesterName || booking.userEmail}
              </div>
              <div className="text-[11px] font-normal text-slate-500">
                ยื่นเมื่อ {booking.createdAt ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString('th-TH') : '-'}
              </div>
            </div>
          </div>

          {/* Booking Details (Compact grid) */}
          <div className="p-2.5 bg-slate-50 rounded-lg space-y-1.5 text-xs text-slate-700 font-normal mb-3 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">ทะเบียนรถ:</span>
              <span className="font-bold text-slate-900 font-mono">{booking.vehicleLicensePlate || booking.vehicleId || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">ช่วงเวลา:</span>
              <span className="text-slate-800 text-[11px]">
                {formatDateOnly(booking.startDateTime || booking.startCalendarDate || booking.startDate)} - {formatDateOnly(booking.endDateTime || booking.endCalendarDate || booking.endDate)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 text-[11px] shrink-0">ปลายทาง:</span>
              <span className="text-slate-800 text-[11px] truncate">{booking.destination || '-'}</span>
            </div>
            {booking.purpose && (
              <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 text-[11px] shrink-0">วัตถุประสงค์:</span>
                <span className="text-slate-600 text-[11px] truncate">{booking.purpose}</span>
              </div>
            )}
          </div>

          {/* Validation Issues list if any */}
          {hasIssues && (
            <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 font-normal">
              <span className="font-semibold text-rose-900">ตรวจพบข้อผิดพลาด:</span>
              <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                {booking.issues.map((it, idx) => <li key={idx}>{it}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Card Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
          <button
            onClick={() => onDelete(booking.id)}
            className="h-8 px-2 text-xs font-normal text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="ลบคำขอ"
          >
            ลบ
          </button>
          <button
            onClick={() => onReject(booking.id, booking.vehicleId)}
            className="h-8 px-2.5 text-xs font-normal text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer"
          >
            ปฏิเสธ
          </button>
          <button
            onClick={() => {
              if (hasIssues) {
                if (!confirm("คำขอนี้ตรวจพบปัญหาความขัดแย้งของข้อมูล คุณต้องการดำเนินการมอบหมายต่อไปหรือไม่?")) return;
              }
              setShowModal(true);
            }}
            className="h-8 px-3 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs cursor-pointer"
          >
            อนุมัติ
          </button>
        </div>
      </div>

      {showModal && (
        <AssignVehicleModal
          booking={booking}
          onClose={() => setShowModal(false)}
          onAssign={(v, d) => {
            onApprove(booking, v, d);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}