"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  getDoc, 
  doc, 
  getDocs, 
  updateDoc, 
  writeBatch, 
  deleteDoc 
} from "firebase/firestore";
import ApprovalCard, { ApprovalRow } from "@/components/admin/ApprovalCard";

// Icons
const Icons = {
  Search: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  Table: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  Grid: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V18ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-13.5 18v-2.25Z" />
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  Clock: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  Shield: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  )
};

export default function ApprovalsPage() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state (Compact h-9)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'ready' | 'issues' | 'admin'
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'

  useEffect(() => {
    // Query bookings with status 'pending'
    const q = query(
      collection(db, "bookings"),
      where("status", "==", "pending"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const bookings = [];
      querySnapshot.forEach((docSnap) => {
        bookings.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Fetch admin users for role check
      const adminQuery = query(collection(db, "users"), where("role", "==", "admin"));
      const adminSnaps = await getDocs(adminQuery);
      const adminIds = adminSnaps.docs.map(d => d.id);
      const adminEmails = adminSnaps.docs.map(d => d.data().email).filter(Boolean);

      // Validate each booking and attach issues array
      const enhanced = await Promise.all(bookings.map(async b => {
        const issues = [];

        if (!b.requesterName && !b.requesterId && !b.userId && !b.userEmail) issues.push('ไม่มีข้อมูลผู้ขอ');
        if (!b.vehicleId) issues.push('ไม่ได้เลือกรถ');
        if (!b.startDate && !b.startCalendarDate && !b.startDateTime) issues.push('ไม่มีวันที่เริ่มต้น');

        // Date sanity
        try {
          const s = b.startDate?.seconds ? new Date(b.startDate.seconds*1000) : b.startDate ? new Date(b.startDate) : null;
          const e = b.endDate?.seconds ? new Date(b.endDate.seconds*1000) : b.endDate ? new Date(b.endDate) : null;
          if (s && e && s > e) issues.push('วันที่เริ่มต้น มากกว่าวันที่สิ้นสุด');
        } catch (e) {
          issues.push('รูปแบบวันที่ไม่ถูกต้อง');
        }

        // Vehicle existence and status
        if (b.vehicleId) {
          try {
            const vRef = doc(db, 'vehicles', b.vehicleId);
            const vSnap = await getDoc(vRef);
            if (!vSnap.exists()) {
              issues.push('ไม่พบข้อมูลรถในระบบ');
            } else {
              const v = vSnap.data();
              if (v.status === 'maintenance') issues.push('รถอยู่ระหว่างซ่อมบำรุง');
            }
          } catch (e) {
            issues.push('ไม่สามารถตรวจสอบสถานะรถ');
          }
        }

        // Overlapping approved bookings
        if (b.vehicleId && (b.startDate || b.startCalendarDate || b.startDateTime) && (b.endDate || b.endCalendarDate || b.endDateTime)) {
          try {
            const colRef = collection(db, 'bookings');
            const q2 = query(colRef, where('vehicleId','==',b.vehicleId), where('status','in',['approved','in_use','on_trip']));
            const snap2 = await getDocs(q2);
            const s = b.startDate?.seconds ? b.startDate.seconds*1000 : b.startCalendarDate ? new Date(b.startCalendarDate).getTime() : b.startDateTime ? (b.startDateTime.seconds ? b.startDateTime.seconds*1000 : new Date(b.startDateTime).getTime()) : new Date(b.startDate).getTime();
            const e = b.endDate?.seconds ? b.endDate.seconds*1000 : b.endCalendarDate ? new Date(b.endCalendarDate).getTime() : b.endDateTime ? (b.endDateTime.seconds ? b.endDateTime.seconds*1000 : new Date(b.endDateTime).getTime()) : new Date(b.endDate).getTime();
            snap2.forEach(d2 => {
              const other = d2.data();
              const os = other.startDate?.seconds ? other.startDate.seconds*1000 : other.startDate ? new Date(other.startDate).getTime() : null;
              const oe = other.endDate?.seconds ? other.endDate.seconds*1000 : other.endDate ? new Date(other.endDate).getTime() : null;
              if (os && oe && !(e < os || s > oe)) {
                issues.push(`ชนกับการจองที่อนุมัติแล้ว (#${d2.id.substring(0, 6)})`);
              }
            });
          } catch (e) {}
        }

        // Mark as admin booking
        b.isAdminBooking = false;
        if (
          (b.userId && adminIds.includes(b.userId)) ||
          (b.userEmail && adminEmails.includes(b.userEmail)) ||
          (b.requesterId && adminIds.includes(b.requesterId)) ||
          (b.requesterEmail && adminEmails.includes(b.requesterEmail))
        ) {
          b.isAdminBooking = true;
        }

        return { ...b, issues };
      }));

      setPendingBookings(enhanced);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return pendingBookings.filter(booking => {
      const q = searchQuery.toLowerCase().trim();
      const requester = (booking.requesterName || booking.userEmail || '').toLowerCase();
      const plate = (booking.vehicleLicensePlate || booking.vehicleId || '').toLowerCase();
      const destination = (booking.destination || '').toLowerCase();
      const id = (booking.id || '').toLowerCase();

      const matchesQuery = !q || requester.includes(q) || plate.includes(q) || destination.includes(q) || id.includes(q);

      if (!matchesQuery) return false;

      if (statusFilter === 'ready') return !booking.issues || booking.issues.length === 0;
      if (statusFilter === 'issues') return booking.issues && booking.issues.length > 0;
      if (statusFilter === 'admin') return booking.isAdminBooking;

      return true;
    });
  }, [pendingBookings, searchQuery, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = pendingBookings.length;
    const ready = pendingBookings.filter(b => !b.issues || b.issues.length === 0).length;
    const issues = pendingBookings.filter(b => b.issues && b.issues.length > 0).length;
    const admin = pendingBookings.filter(b => b.isAdminBooking).length;
    return { total, ready, issues, admin };
  }, [pendingBookings]);

  // Handlers for approval operations
  const handleApproveBooking = async (booking, vehicle, driver) => {
    try {
      const batch = writeBatch(db);
      const bookingRef = doc(db, "bookings", booking.id);
      batch.update(bookingRef, {
        status: "approved",
        vehicleId: vehicle.id,
        vehicleLicensePlate: vehicle.licensePlate,
        driverId: driver.id,
        driverName: driver.name,
      });

      const vehicleRef = doc(db, "vehicles", vehicle.id);
      batch.update(vehicleRef, {
        status: "in_use"
      });

      await batch.commit();

      // Send notification
      try {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'booking_approved',
            booking: {
              id: booking.id,
              userId: booking.userId || booking.requesterId,
              requesterName: booking.requesterName || booking.userEmail,
              userEmail: booking.userEmail,
              vehicleLicensePlate: vehicle.licensePlate,
              vehicleId: vehicle.id,
              driverId: driver.id,
              driverName: driver.name,
              startDateTime: booking.startDateTime,
              startCalendarDate: booking.startCalendarDate || booking.startDate,
              endDateTime: booking.endDateTime,
              endCalendarDate: booking.endCalendarDate || booking.endDate
            }
          })
        });
      } catch (err) {
        console.warn('ส่งแจ้งเตือน Flex ไม่สำเร็จ', err);
      }
    } catch (error) {
      console.error("Error approving booking: ", error);
      alert("เกิดข้อผิดพลาดในการอนุมัติคำขอ");
    }
  };

  const handleRejectBooking = async (bookingId, vehicleId) => {
    if (!confirm("คุณต้องการปฏิเสธคำขอนี้ใช่หรือไม่?")) return;
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status: "rejected" });
      if (vehicleId) {
        const vehicleRef = doc(db, "vehicles", vehicleId);
        await updateDoc(vehicleRef, { status: "available" });
      }

      try {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'booking_rejected',
            booking: { id: bookingId }
          })
        });
      } catch (err) {}
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert("เกิดข้อผิดพลาดในการปฏิเสธคำขอ");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm("⚠️ ต้องการลบคำขอนี้ออกจากระบบอย่างถาวรหรือไม่?")) return;
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await deleteDoc(bookingRef);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("เกิดข้อผิดพลาดในการลบคำขอ");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header (Compact) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">อนุมัติการจองรถยนต์</h1>
          <p className="text-slate-600 text-xs mt-0.5 font-normal">
            ตรวจสอบข้อมูลคำขอ มอบหมายยานพาหนะ และจัดสรรคนขับก่อนเริ่มเดินทาง
          </p>
        </div>
      </div>

      {/* Stats Summary Cards (Mini-Compact 4-grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">คำขอรออนุมัติ</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">{stats.total}</p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
            <Icons.Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">พร้อมอนุมัติทันที</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5 font-mono">{stats.ready}</p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60">
            <Icons.CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">มีข้อผิดพลาด/ชนกัน</p>
            <p className="text-2xl font-bold text-rose-700 mt-0.5 font-mono">{stats.issues}</p>
          </div>
          <div className="p-2 bg-rose-50 text-rose-700 rounded-lg border border-rose-200/60">
            <Icons.AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">จองโดยแอดมิน</p>
            <p className="text-2xl font-bold text-amber-700 mt-0.5 font-mono">{stats.admin}</p>
          </div>
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200/60">
            <Icons.Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        
        {/* Filter / Search Bar (Height h-9) */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">รายการคำขอ</h2>
            <span className="text-xs font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-mono">
              {filteredBookings.length} รายการ
            </span>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search Input h-9 */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                <Icons.Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อ, ทะเบียน, ปลายทาง..."
                className="h-9 w-44 sm:w-56 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal"
              />
            </div>

            {/* Filter Dropdown h-9 */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
            >
              <option value="all">ทุกสถานะคำขอ</option>
              <option value="ready">✓ พร้อมอนุมัติ</option>
              <option value="issues">⚠️ ตรวจพบปัญหา</option>
              <option value="admin">⭐ โดยแอดมิน</option>
            </select>

            {/* View Mode Toggle h-9 */}
            <div className="h-9 p-0.5 bg-slate-100 rounded-lg border border-slate-300 flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`h-full px-2.5 rounded-md text-xs font-normal flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="มุมมองตาราง"
              >
                <Icons.Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ตาราง</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`h-full px-2.5 rounded-md text-xs font-normal flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="มุมมองการ์ด"
              >
                <Icons.Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">การ์ด</span>
              </button>
            </div>

            {/* Reset Filters */}
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="h-9 px-2.5 text-xs font-normal text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Content Body: Loading / Empty / Table / Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <Icons.Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">ไม่มีคำขอที่รอดำเนินการ</h3>
            <p className="text-xs font-normal text-slate-500 mt-0.5">
              {searchQuery || statusFilter !== 'all' 
                ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา' 
                : 'คำขอทั้งหมดได้รับการจัดการเรียบร้อยแล้ว'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW: Compact & High Contrast */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">รหัส / วันที่ยื่น</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ผู้ขอจอง</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">รถยนต์ / ทะเบียน</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">วันที่ต้องการใช้</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ปลายทาง & วัตถุประสงค์</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">สถานะความพร้อม</th>
                  <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800 tracking-normal">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <ApprovalRow
                    key={booking.id}
                    booking={booking}
                    onApprove={handleApproveBooking}
                    onReject={handleRejectBooking}
                    onDelete={handleDeleteBooking}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARDS VIEW: Mini-Compact Grid */
          <div className="p-3.5 sm:p-4 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredBookings.map((booking) => (
                <ApprovalCard
                  key={booking.id}
                  booking={booking}
                  onApprove={handleApproveBooking}
                  onReject={handleRejectBooking}
                  onDelete={handleDeleteBooking}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}