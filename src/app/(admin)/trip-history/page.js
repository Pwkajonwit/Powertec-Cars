"use client";

import { useEffect, useState, Fragment, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageHelpers';
import AlertToast from '@/components/ui/AlertToast';

// Icons
const Icons = {
  Truck: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  Users: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Calendar: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.253M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
    </svg>
  ),
  Banknotes: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Search: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  Trash: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  ChevronDown: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  ChevronUp: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  ),
  XMark: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

export default function TripHistoryPage() {
  function formatDateTime(ts) {
    if (!ts) return '-';
    try {
      let d;
      if (ts.seconds && typeof ts.seconds === 'number') d = new Date(ts.seconds * 1000);
      else if (typeof ts === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ts)) {
        const parts = ts.split('-');
        d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0);
      } else d = new Date(ts);
      return d.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '-';
    }
  }

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states (Height h-9 controls)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // For single delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTrip, setDeletingTrip] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Alert State
  const [alertState, setAlertState] = useState({ show: false, message: '', type: 'success' });
  const showAlert = (message, type = 'success') => {
    setAlertState({ show: true, message, type });
  };

  // For bulk delete
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeletePeriod, setBulkDeletePeriod] = useState('');
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteCount, setBulkDeleteCount] = useState(0);

  const [limitCount, setLimitCount] = useState(50);
  const [vehiclesMap, setVehiclesMap] = useState({});

  // 1. Fetch all vehicles once for caching
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'vehicles'), (snap) => {
      const map = {};
      snap.forEach(d => {
        map[d.id] = { id: d.id, ...d.data() };
      });
      setVehiclesMap(map);
    });
    return () => unsub();
  }, []);

  // 2. Optimized Trip Fetching
  useEffect(() => {
    const q = query(
      collection(db, 'vehicle-usage'),
      where('status', '==', 'completed'),
      orderBy('endTime', 'desc'),
      limit(limitCount)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const rawList = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const enrichedList = await Promise.all(rawList.map(async (trip) => {
        let expenses = [];
        try {
          const expQ = query(collection(db, 'expenses'), where('usageId', '==', trip.id));
          const expSnap = await (await import('firebase/firestore')).getDocs(expQ);
          expenses = expSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
          // ignore
        }

        return {
          ...trip,
          expenses
        };
      }));

      setTrips(enrichedList);
      setLoading(false);
    });

    return () => unsub();
  }, [limitCount]);

  const loadExpensesFor = async (usage) => {
    try {
      const expQ = query(collection(db, 'expenses'), where('usageId', '==', usage.id));
      const snapshot = await (await import('firebase/firestore')).getDocs(expQ);
      const exps = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTrips(prev => prev.map(t => t.id === usage.id ? { ...t, expenses: exps } : t));
    } catch (e) {
      console.warn('loadExpensesFor failed', e);
    }
  };

  // Delete single trip logic
  const handleDeleteTrip = async () => {
    if (!deletingTrip) return;
    setIsDeleting(true);
    try {
      const { getDocs, query: fbQuery, collection: fbCollection, where: fbWhere, deleteDoc, doc: docRef } = await import('firebase/firestore');
      const expQ = fbQuery(fbCollection(db, 'expenses'), fbWhere('usageId', '==', deletingTrip.id));
      const expSnap = await getDocs(expQ);
      for (const expDoc of expSnap.docs) {
        await deleteDoc(expDoc.ref);
      }
      await deleteDoc(docRef(db, 'vehicle-usage', deletingTrip.id));
      setShowDeleteModal(false);
      setDeletingTrip(null);
      showAlert('ลบประวัติการเดินทางเรียบร้อยแล้ว', 'success');
    } catch (e) {
      showAlert('เกิดข้อผิดพลาดในการลบ', 'error');
    }
    setIsDeleting(false);
  };

  // คำนวณจำนวนที่จะลบตาม period
  const calculateTripsToDelete = (period) => {
    if (!period) return 0;
    const now = new Date();
    let cutoffDate;

    if (period === 'all') return trips.length;
    if (period === '3months') cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    else if (period === '6months') cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    else if (period === '1year') cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    return trips.filter(t => {
      const tripDate = t.endTime?.seconds ? new Date(t.endTime.seconds * 1000) : new Date(t.endTime);
      return tripDate < cutoffDate;
    }).length;
  };

  // Bulk delete logic
  const handleBulkDelete = async () => {
    if (!bulkDeletePeriod) return;
    setIsBulkDeleting(true);

    const { getDocs, query: fbQuery, collection: fbCollection, where: fbWhere, deleteDoc } = await import('firebase/firestore');

    try {
      const now = new Date();
      let cutoffDate;

      if (bulkDeletePeriod === 'all') cutoffDate = null;
      else if (bulkDeletePeriod === '3months') cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      else if (bulkDeletePeriod === '6months') cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      else if (bulkDeletePeriod === '1year') cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

      const tripsToDelete = cutoffDate === null
        ? trips
        : trips.filter(t => {
          const tripDate = t.endTime?.seconds ? new Date(t.endTime.seconds * 1000) : new Date(t.endTime);
          return tripDate < cutoffDate;
        });

      let deletedCount = 0;
      for (const trip of tripsToDelete) {
        const expQ = fbQuery(fbCollection(db, 'expenses'), fbWhere('usageId', '==', trip.id));
        const expSnap = await getDocs(expQ);
        for (const expDoc of expSnap.docs) {
          await deleteDoc(expDoc.ref);
        }

        const { doc: docRef } = await import('firebase/firestore');
        await deleteDoc(docRef(db, 'vehicle-usage', trip.id));
        deletedCount++;
        setBulkDeleteCount(deletedCount);
      }

      showAlert(`ลบข้อมูลสำเร็จ ${deletedCount} รายการ`, 'success');
      setShowBulkDeleteModal(false);
      setBulkDeletePeriod('');
      setBulkDeleteCount(0);
    } catch (e) {
      console.error('Bulk delete error:', e);
      showAlert('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
    }

    setIsBulkDeleting(false);
  };

  // Filter trips
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const tripVehicle = vehiclesMap[trip.vehicleId] || {};

      if (searchTerm) {
        const search = searchTerm.toLowerCase().trim();
        const matchesSearch =
          (trip.vehicleLicensePlate?.toLowerCase().includes(search)) ||
          (tripVehicle.licensePlate?.toLowerCase().includes(search)) ||
          (tripVehicle.brand?.toLowerCase().includes(search)) ||
          (tripVehicle.model?.toLowerCase().includes(search)) ||
          (trip.userName?.toLowerCase().includes(search)) ||
          (trip.userId?.toLowerCase().includes(search)) ||
          (trip.destination?.toLowerCase().includes(search)) ||
          (trip.purpose?.toLowerCase().includes(search));

        if (!matchesSearch) return false;
      }

      if (filterVehicle && trip.vehicleLicensePlate !== filterVehicle) return false;
      if (filterUser && trip.userName !== filterUser) return false;

      if (filterDateFrom || filterDateTo) {
        const tripDate = trip.startTime?.seconds ? new Date(trip.startTime.seconds * 1000) : new Date(trip.startTime);
        if (filterDateFrom) {
          const fromDate = new Date(filterDateFrom);
          if (tripDate < fromDate) return false;
        }
        if (filterDateTo) {
          const toDate = new Date(filterDateTo);
          toDate.setHours(23, 59, 59, 999);
          if (tripDate > toDate) return false;
        }
      }

      return true;
    });
  }, [trips, vehiclesMap, searchTerm, filterVehicle, filterUser, filterDateFrom, filterDateTo]);

  // Unique lists for dropdowns
  const uniqueVehicles = useMemo(() => {
    return [...new Set(trips.map(t => t.vehicleLicensePlate).filter(Boolean))];
  }, [trips]);

  const uniqueUsers = useMemo(() => {
    return [...new Set(trips.map(t => t.userName).filter(Boolean))];
  }, [trips]);

  // Total expenses sum
  const totalExpensesSum = useMemo(() => {
    return filteredTrips.reduce((sum, t) => {
      const tSum = t.expenses ? t.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0) : 0;
      return sum + tSum;
    }, 0);
  }, [filteredTrips]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrips = filteredTrips.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterVehicle('');
    setFilterUser('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(searchTerm || filterVehicle || filterUser || filterDateFrom || filterDateTo);

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
        onClose={() => setAlertState(prev => ({ ...prev, show: false }))} 
      />

      {/* Header (Compact) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ประวัติการเดินทาง</h1>
          <p className="text-slate-600 text-xs mt-0.5 font-normal">
            ประวัติการใช้งานยานพาหนะที่เสร็จสมบูรณ์ บันทึกระยะทาง และค่าใช้จ่ายทั้งหมด
          </p>
        </div>
        <button
          onClick={() => setShowBulkDeleteModal(true)}
          className="h-9 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-normal shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Icons.Trash className="w-3.5 h-3.5" />
          <span>ล้างข้อมูลเก่า</span>
        </button>
      </div>

      {/* Summary Stats (Mini-Compact 4-grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">การเดินทางทั้งหมด</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5 font-mono">{filteredTrips.length}</p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60">
            <Icons.Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">รถที่ถูกใช้งาน</p>
            <p className="text-xl font-bold text-blue-900 mt-0.5 font-mono">{uniqueVehicles.length}</p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
            <Icons.Truck className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">ผู้ใช้งานทั้งหมด</p>
            <p className="text-xl font-bold text-purple-900 mt-0.5 font-mono">{uniqueUsers.length}</p>
          </div>
          <div className="p-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200/60">
            <Icons.Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">ค่าใช้จ่ายรวม</p>
            <p className="text-xl font-bold text-amber-900 mt-0.5 font-mono">
              {totalExpensesSum.toLocaleString()} ฿
            </p>
          </div>
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200/60">
            <Icons.Banknotes className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        
        {/* Filters Bar (Compact h-9 Controls) */}
        <div className="p-3 sm:p-3.5 border-b border-slate-200/80 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            
            {/* Search Input h-9 */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                <Icons.Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="ค้นหาทะเบียน, ผู้ใช้, จุดหมาย..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal"
              />
            </div>

            {/* Vehicle Select h-9 */}
            <div>
              <select
                value={filterVehicle}
                onChange={(e) => {
                  setFilterVehicle(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
              >
                <option value="">รถทั้งหมด ({uniqueVehicles.length})</option>
                {uniqueVehicles.map((vehicle) => (
                  <option key={vehicle} value={vehicle}>{vehicle}</option>
                ))}
              </select>
            </div>

            {/* User Select h-9 */}
            <div>
              <select
                value={filterUser}
                onChange={(e) => {
                  setFilterUser(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
              >
                <option value="">ผู้ใช้งานทั้งหมด ({uniqueUsers.length})</option>
                {uniqueUsers.map((user) => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            {/* Date From h-9 */}
            <div>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => {
                  setFilterDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
                title="ตั้งแต่วันที่"
              />
            </div>

            {/* Date To h-9 */}
            <div>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => {
                  setFilterDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
                title="ถึงวันที่"
              />
            </div>
          </div>

          {/* Active Filter Clear & Count */}
          {hasActiveFilters && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs text-slate-700 font-normal">
                พบ <strong className="text-slate-900 font-mono font-bold">{filteredTrips.length}</strong> รายการ จากเงื่อนไขที่เลือก
              </span>
              <button
                onClick={clearFilters}
                className="h-7 px-2 text-xs font-normal text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          )}
        </div>

        {/* Content Table / Empty state */}
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <Icons.Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">ไม่พบประวัติการเดินทาง</h3>
            <p className="text-xs font-normal text-slate-500 mt-0.5">
              {hasActiveFilters 
                ? 'ไม่พบข้อมูลที่ตรงกับตัวกรอง กรุณาลองเปลี่ยนคำค้นหาหรือช่วงเวลา' 
                : 'ยังไม่มีประวัติการใช้งานยานพาหนะที่เสร็จสิ้นในระบบ'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ยานพาหนะ</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ผู้ใช้งาน</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">วัน-เวลาเดินทาง</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">จุดหมาย / วัตถุประสงค์</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ค่าใช้จ่าย</th>
                  <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800 tracking-normal">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {currentTrips.map(t => {
                  const tVehicle = vehiclesMap[t.vehicleId] || {};
                  const isExpanded = expandedId === t.id;
                  const totalTripCost = (t.expenses && t.expenses.length > 0)
                    ? t.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)
                    : 0;

                  return (
                    <Fragment key={t.id}>
                      <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-slate-50/60' : ''}`}>
                        {/* Vehicle & Plate */}
                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-8 rounded bg-slate-100 relative overflow-hidden shrink-0 border border-slate-200">
                              {getImageUrl(tVehicle) ? (
                                <Image 
                                  src={getImageUrl(tVehicle)} 
                                  alt="Vehicle" 
                                  fill 
                                  className="object-cover" 
                                  unoptimized 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">N/A</div>
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 font-mono">
                                {t.vehicleLicensePlate || tVehicle.licensePlate || '-'}
                              </div>
                              <div className="text-[11px] font-normal text-slate-600">
                                {tVehicle.brand ? `${tVehicle.brand} ${tVehicle.model}` : '-'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* User Name */}
                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                              {(t.userName || t.userId || '?')[0]}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-900">
                                {t.userName || 'ไม่ระบุชื่อ'}
                              </div>
                              {t.userId && t.userId !== t.userName && (
                                <div className="text-[10px] font-normal text-slate-500 font-mono truncate max-w-[120px]">
                                  {t.userId}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          <div className="text-xs text-slate-800 font-normal">
                            {formatDateTime(t.startTime)}
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal">
                            ถึง: {formatDateTime(t.endTime)}
                          </div>
                        </td>

                        {/* Route & Purpose */}
                        <td className="px-3.5 py-2.5">
                          <div className="text-xs font-normal text-slate-900 truncate max-w-[180px]">
                            {t.destination || '-'}
                          </div>
                          <div className="text-[11px] font-normal text-slate-500 truncate max-w-[200px]" title={t.purpose}>
                            {t.purpose || '-'}
                          </div>
                        </td>

                        {/* Expenses */}
                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          {totalTripCost > 0 ? (
                            <div>
                              <div className="text-xs font-bold text-emerald-800 font-mono">
                                {totalTripCost.toLocaleString()} ฿
                              </div>
                              <div className="text-[10px] font-normal text-slate-500">
                                {t.expenses.length} รายการ
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-normal">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={async () => {
                                setExpandedId(isExpanded ? null : t.id);
                                if (!t.expenses || t.expenses.length === 0) await loadExpensesFor(t);
                              }}
                              className={`h-7 px-2 text-xs font-normal rounded-md border transition-colors flex items-center gap-1 cursor-pointer ${
                                isExpanded 
                                  ? 'bg-blue-100 text-blue-900 border-blue-300' 
                                  : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                              }`}
                              title="ดูรายละเอียดค่าใช้จ่าย"
                            >
                              <span>{isExpanded ? 'ย่อ' : 'รายละเอียด'}</span>
                              {isExpanded ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />}
                            </button>

                            <button
                              onClick={() => { setShowDeleteModal(true); setDeletingTrip(t); }}
                              className="h-7 px-2 text-xs font-normal text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors flex items-center gap-0.5 cursor-pointer"
                              title="ลบรายการนี้"
                            >
                              <Icons.Trash className="w-3 h-3" />
                              <span className="hidden sm:inline">ลบ</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Expense Details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="px-4 py-3 bg-slate-50/90 border-y border-slate-200/80">
                            <div className="max-w-2xl bg-white rounded-lg border border-slate-200 p-3 shadow-xs">
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                <span className="text-xs font-semibold text-slate-900">
                                  บันทึกค่าใช้จ่ายการเดินทาง ({t.expenses?.length || 0} รายการ)
                                </span>
                                <span className="text-xs font-bold text-emerald-800 font-mono">
                                  รวม: {totalTripCost.toLocaleString()} ฿
                                </span>
                              </div>

                              {t.expenses && t.expenses.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                  {t.expenses.map(exp => {
                                    const typeMap = {
                                      'fuel': '⛽ เติมน้ำมัน',
                                      'fluid': '🛢️ เปลี่ยนของเหลว',
                                      'toll': '🛣️ ค่าทางด่วน',
                                      'parking': '🅿️ ค่าจอดรถ',
                                      'maintenance': '🔧 ค่าซ่อมบำรุง',
                                      'other': '💰 อื่นๆ'
                                    };
                                    const displayType = typeMap[exp.type] || exp.type || 'อื่นๆ';
                                    return (
                                      <div key={exp.id} className="py-1.5 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-800 font-normal">{displayType}</span>
                                          {exp.note && <span className="text-slate-500 font-normal">- {exp.note}</span>}
                                          {exp.mileage && <span className="text-[11px] text-slate-400 font-mono">(ไมล์: {exp.mileage} กม.)</span>}
                                        </div>
                                        <span className="font-bold text-emerald-800 font-mono">
                                          {(Number(exp.amount) || 0).toLocaleString()} ฿
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 font-normal py-1">ไม่มีบันทึกค่าใช้จ่ายในทริปนี้</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Load More Button (Firestore pagination) */}
        {trips.length >= limitCount && (
          <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 flex justify-center">
            <button
              onClick={() => setLimitCount(prev => prev + 50)}
              className="h-8 px-4 text-xs font-normal text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              โหลดข้อมูลเก่ากว่านี้ (+50 รายการ)
            </button>
          </div>
        )}

        {/* Bottom Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-3.5 py-2.5 bg-white border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-xs text-slate-600 font-normal">
              แสดง <span className="font-mono font-semibold text-slate-900">{startIndex + 1}</span> ถึง{' '}
              <span className="font-mono font-semibold text-slate-900">{Math.min(endIndex, filteredTrips.length)}</span> จาก{' '}
              <span className="font-mono font-bold text-slate-900">{filteredTrips.length}</span> รายการ
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 px-2 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="หน้าแรก"
              >
                «
              </button>
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="h-8 px-2.5 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>

              {/* Compact page buttons */}
              {(() => {
                let pages = [];
                let startPage = Math.max(1, currentPage - 1);
                let endPage = Math.min(totalPages, startPage + 2);
                if (endPage - startPage < 2) {
                  startPage = Math.max(1, endPage - 2);
                }
                for (let i = startPage; i <= endPage; i++) {
                  if (i > 0) pages.push(i);
                }

                return pages.map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 text-xs rounded transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-normal'
                    }`}
                  >
                    {pageNum}
                  </button>
                ));
              })()}

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-8 px-2.5 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 px-2 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="หน้าสุดท้าย"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Single Delete Modal (Compact & High Contrast) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-xl shadow-xl p-4 max-w-sm w-full border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">ยืนยันการลบประวัติการเดินทาง</h3>
            <p className="text-xs text-slate-600 font-normal mt-1.5">
              คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? ข้อมูลค่าใช้จ่ายที่เกี่ยวข้องจะถูกลบออกด้วย และไม่สามารถกู้คืนได้
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                disabled={isDeleting} 
                className="h-8 px-3 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleDeleteTrip} 
                disabled={isDeleting} 
                className="h-8 px-3 text-xs font-normal text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer"
              >
                {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal (Compact & High Contrast) */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-rose-50 text-rose-700 rounded border border-rose-200">
                  <Icons.Trash className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">ล้างข้อมูลประวัติการเดินทางเก่า</h3>
              </div>
              <button 
                onClick={() => setShowBulkDeleteModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <Icons.XMark className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2.5">
              <p className="text-xs text-slate-600 font-normal">
                เลือกช่วงเวลาที่ต้องการลบประวัติการเดินทางเพื่อประหยัดพื้นที่ฐานข้อมูล
              </p>

              <div className="space-y-2 pt-1">
                <label className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="bulkDelete"
                      value="3months"
                      checked={bulkDeletePeriod === '3months'}
                      onChange={(e) => setBulkDeletePeriod(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">ข้อมูลเก่ากว่า 3 เดือน</div>
                      <div className="text-[10px] text-slate-500 font-normal">ก่อนวันที่ {new Date(new Date().getFullYear(), new Date().getMonth() - 3, new Date().getDate()).toLocaleDateString('th-TH')}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-700 font-mono">{calculateTripsToDelete('3months')} รายการ</span>
                </label>

                <label className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="bulkDelete"
                      value="6months"
                      checked={bulkDeletePeriod === '6months'}
                      onChange={(e) => setBulkDeletePeriod(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">ข้อมูลเก่ากว่า 6 เดือน</div>
                      <div className="text-[10px] text-slate-500 font-normal">ก่อนวันที่ {new Date(new Date().getFullYear(), new Date().getMonth() - 6, new Date().getDate()).toLocaleDateString('th-TH')}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-700 font-mono">{calculateTripsToDelete('6months')} รายการ</span>
                </label>

                <label className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="bulkDelete"
                      value="1year"
                      checked={bulkDeletePeriod === '1year'}
                      onChange={(e) => setBulkDeletePeriod(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">ข้อมูลเก่ากว่า 1 ปี</div>
                      <div className="text-[10px] text-slate-500 font-normal">ก่อนวันที่ {new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()).toLocaleDateString('th-TH')}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-700 font-mono">{calculateTripsToDelete('1year')} รายการ</span>
                </label>

                <label className="flex items-center justify-between p-2.5 border border-rose-300 bg-rose-50/50 rounded-lg cursor-pointer hover:bg-rose-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="bulkDelete"
                      value="all"
                      checked={bulkDeletePeriod === 'all'}
                      onChange={(e) => setBulkDeletePeriod(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-rose-900">ลบทั้งหมด ({trips.length} รายการ)</div>
                      <div className="text-[10px] text-rose-700 font-normal">⚠️ ข้อมูลประวัติการเดินทางและค่าใช้จ่ายทั้งหมดจะถูกลบ</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-900 font-mono">{calculateTripsToDelete('all')} รายการ</span>
                </label>
              </div>

              {isBulkDeleting && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-xs text-blue-800">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังดำเนินการลบ... ({bulkDeleteCount} รายการ)</span>
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => { setShowBulkDeleteModal(false); setBulkDeletePeriod(''); }}
                disabled={isBulkDeleting}
                className="h-8 px-3 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting || !bulkDeletePeriod || calculateTripsToDelete(bulkDeletePeriod) === 0}
                className="h-8 px-3 text-xs font-normal text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isBulkDeleting ? 'กำลังลบ...' : `ยืนยันลบ (${calculateTripsToDelete(bulkDeletePeriod) || 0} รายการ)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
