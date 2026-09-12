"use client";

import { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  runTransaction, 
  serverTimestamp 
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Icons
const Icons = {
  Wrench: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.07a4.5 4.5 0 0 0 4.486-6.32l-3.27 3.287a1.125 1.125 0 0 1-1.59 0l-1.687-1.688a1.125 1.125 0 0 1 0-1.59l3.287-3.27a4.5 4.5 0 0 0-6.32 4.486c.118.58.094 1.193-.07 1.743" />
    </svg>
  ),
  Clock: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  Car: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  ),
  Plus: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
};

const formatDate = (dateVal) => {
  if (!dateVal) return '-';
  try {
    const d = dateVal.seconds ? new Date(dateVal.seconds * 1000) : new Date(dateVal);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('th-TH');
  } catch (e) {
    return '-';
  }
};

export default function AdminMaintenanceQueue() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [inProgressItems, setInProgressItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  // Filters & Controls (Height h-9)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'in_progress' | 'pending'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modals state
  const [editRecord, setEditRecord] = useState(null);
  const [receiveRecord, setReceiveRecord] = useState(null);
  const [receiveData, setReceiveData] = useState({ 
    finalCost: '', 
    finalMileage: '', 
    notes: '', 
    partsUsed: '', 
    invoiceNumber: '', 
    warranty: false, 
    warrantyDate: '' 
  });
  const [showSendModal, setShowSendModal] = useState(false);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [sendVehicleId, setSendVehicleId] = useState('');
  const [sendVendor, setSendVendor] = useState('');
  const [sendExpectedReturnDate, setSendExpectedReturnDate] = useState('');
  const [sendMileage, setSendMileage] = useState('');

  // 1. Subscribe to pending garage requests
  useEffect(() => {
    const q = query(
      collection(db, 'maintenances'),
      where('type', '==', 'garage'),
      where('maintenanceStatus', '==', 'pending')
    );
    const unsub = onSnapshot(q, async (snap) => {
      const data = await Promise.all(snap.docs.map(async d => {
        const rec = { id: d.id, ...d.data() };
        try {
          if (rec.vehicleId) {
            const vRef = doc(db, 'vehicles', rec.vehicleId);
            const vSnap = await getDoc(vRef);
            if (vSnap.exists()) rec.vehicle = { id: vSnap.id, ...vSnap.data() };
          }
        } catch (e) {}
        return rec;
      }));
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Subscribe to in_progress garage items
  useEffect(() => {
    const q = query(
      collection(db, 'maintenances'),
      where('type', '==', 'garage'),
      where('maintenanceStatus', '==', 'in_progress')
    );
    const unsub = onSnapshot(q, async (snap) => {
      const data = await Promise.all(snap.docs.map(async d => {
        const rec = { id: d.id, ...d.data() };
        try {
          if (rec.vehicleId) {
            const vRef = doc(db, 'vehicles', rec.vehicleId);
            const vSnap = await getDoc(vRef);
            if (vSnap.exists()) rec.vehicle = { id: vSnap.id, ...vSnap.data() };
          }
        } catch (e) {}
        return rec;
      }));
      setInProgressItems(data);
    });
    return () => unsub();
  }, []);

  // Combined records for display
  const allRecords = useMemo(() => {
    return [...inProgressItems, ...items];
  }, [inProgressItems, items]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return allRecords.filter(rec => {
      const q = searchQuery.toLowerCase().trim();
      const plate = (rec.vehicle?.licensePlate || '').toLowerCase();
      const brandModel = `${rec.vehicle?.brand || ''} ${rec.vehicle?.model || ''}`.toLowerCase();
      const vendor = (rec.vendor || '').toLowerCase();
      const details = (rec.details || '').toLowerCase();

      const matchesSearch = !q || plate.includes(q) || brandModel.includes(q) || vendor.includes(q) || details.includes(q);
      if (!matchesSearch) return false;

      if (statusFilter === 'in_progress') return rec.maintenanceStatus === 'in_progress';
      if (statusFilter === 'pending') return rec.maintenanceStatus === 'pending';

      return true;
    });
  }, [allRecords, searchQuery, statusFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const inProgress = inProgressItems.length;
    const pending = items.length;
    const now = new Date();
    const overdue = inProgressItems.filter(item => {
      if (!item.expectedReturnDate) return false;
      const expected = item.expectedReturnDate.seconds 
        ? new Date(item.expectedReturnDate.seconds * 1000) 
        : new Date(item.expectedReturnDate);
      return expected < now;
    }).length;

    return { inProgress, pending, overdue, total: inProgress + pending };
  }, [inProgressItems, items]);

  const markAsSent = async (rec) => {
    if (!rec || processing[rec.id]) return;
    setProcessing(p => ({ ...p, [rec.id]: true }));
    try {
      await updateDoc(doc(db, 'maintenances', rec.id), { maintenanceStatus: 'in_progress' });
      if (rec.vehicleId) {
        await updateDoc(doc(db, 'vehicles', rec.vehicleId), { status: 'maintenance', lastMaintenanceId: rec.id });
      }
    } catch (err) {
      console.error('markAsSent error', err);
    } finally {
      setProcessing(p => ({ ...p, [rec.id]: false }));
    }
  };

  const openSendModal = async () => {
    setShowSendModal(true);
    try {
      const snaps = await getDocs(collection(db, 'vehicles'));
      const allVehicles = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
      const notAllowedStatuses = [
        'maintenance', 'in_use', 'using', 'on_trip', 'busy', 'reserved', 'pending_approval', 'unavailable'
      ];
      const list = allVehicles.filter(v => !notAllowedStatuses.includes((v.status || '').toLowerCase()));
      setVehiclesList(list);
      if (list.length) {
        setSendVehicleId(list[0].id);
        setSendMileage(list[0].currentMileage ?? '');
      }
    } catch (e) {
      console.error('load vehicles for send modal', e);
    }
  };

  const closeSendModal = () => {
    setShowSendModal(false);
    setSendVendor('');
    setSendExpectedReturnDate('');
    setSendMileage('');
    setVehiclesList([]);
    setSendVehicleId('');
  };

  const handleSendSubmit = async () => {
    if (!sendVehicleId || processing['send']) return;
    setProcessing(p => ({ ...p, send: true }));
    try {
      const vehicleRef = doc(db, 'vehicles', sendVehicleId);
      const maintRef = doc(collection(db, 'maintenances'));

      await runTransaction(db, async (tx) => {
        const vSnap = await tx.get(vehicleRef);
        if (!vSnap.exists()) throw new Error('vehicle-not-found');
        const odometer = Number(sendMileage) || vSnap.data()?.currentMileage || null;
        tx.set(maintRef, {
          vehicleId: sendVehicleId,
          type: 'garage',
          vendor: sendVendor || null,
          expectedReturnDate: sendExpectedReturnDate ? new Date(sendExpectedReturnDate) : null,
          odometerAtDropOff: odometer,
          maintenanceStatus: 'in_progress',
          createdAt: serverTimestamp(),
        });

        tx.update(vehicleRef, { status: 'maintenance', lastMaintenanceId: maintRef.id });
      });

      closeSendModal();
    } catch (err) {
      console.error('send to maintenance error', err);
    } finally {
      setProcessing(p => ({ ...p, send: false }));
    }
  };

  const openEdit = (rec) => setEditRecord(rec);
  const closeEdit = () => setEditRecord(null);

  const handleEditSubmit = async (updates) => {
    if (!editRecord) return;
    setProcessing(p => ({ ...p, [editRecord.id]: true }));
    try {
      await updateDoc(doc(db, 'maintenances', editRecord.id), updates);
      closeEdit();
    } catch (err) {
      console.error('edit error', err);
    } finally {
      setProcessing(p => ({ ...p, [editRecord.id]: false }));
    }
  };

  const openReceive = (rec) => {
    setReceiveRecord(rec);
    setReceiveData({
      finalCost: rec.finalCost ?? rec.cost ?? '',
      finalMileage: rec.finalMileage ?? rec.odometerAtDropOff ?? rec.mileage ?? '',
      notes: rec.completionNotes ?? '',
      partsUsed: rec.partsUsed ?? '',
      invoiceNumber: rec.invoiceNumber ?? '',
      warranty: rec.warranty ?? false,
      warrantyDate: rec.warrantyDate
        ? (rec.warrantyDate.seconds
            ? new Date(rec.warrantyDate.seconds * 1000).toISOString().split('T')[0]
            : new Date(rec.warrantyDate).toISOString().split('T')[0])
        : '',
    });
  };

  const closeReceive = () => setReceiveRecord(null);

  const handleReceiveSubmit = async () => {
    const rec = receiveRecord;
    if (!rec) return;
    setProcessing(p => ({ ...p, [rec.id]: true }));
    try {
      const maintRef = doc(db, 'maintenances', rec.id);
      const vehicleRef = doc(db, 'vehicles', rec.vehicleId);

      await runTransaction(db, async (tx) => {
        const vehicleSnap = await tx.get(vehicleRef);
        const prevMileage = vehicleSnap.data()?.currentMileage ?? null;
        let newMileage = prevMileage;
        if (receiveData.finalMileage) {
          const proposed = Number(receiveData.finalMileage);
          if (prevMileage != null && proposed < prevMileage) {
            throw new Error('finalMileage-less-than-current');
          }
          newMileage = proposed;
        }

        const updateObj = {
          maintenanceStatus: 'completed',
          finalCost: Number(receiveData.finalCost) || 0,
          finalMileage: receiveData.finalMileage ? Number(receiveData.finalMileage) : null,
          completionNotes: receiveData.notes || '',
          partsUsed: receiveData.partsUsed || '',
          invoiceNumber: receiveData.invoiceNumber || '',
          warranty: !!receiveData.warranty,
          receivedAt: serverTimestamp(),
        };
        if (receiveData.warranty && receiveData.warrantyDate) {
          updateObj.warrantyDate = new Date(receiveData.warrantyDate);
        } else {
          updateObj.warrantyDate = null;
        }
        tx.update(maintRef, updateObj);
        tx.update(vehicleRef, { status: 'available', currentMileage: newMileage });
      });

      closeReceive();
    } catch (err) {
      console.error('receive error', err);
      alert('เกิดข้อผิดพลาดในการบันทึกรับรถคืน');
    } finally {
      setProcessing(p => ({ ...p, [rec.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">จัดการงานซ่อมบำรุง</h1>
          <p className="text-slate-600 text-xs mt-0.5 font-normal">
            ติดตามสถานะรถที่ส่งเข้าอู่ซ่อม ตรวจสอบกำหนดคืน และบันทึกการรับรถกลับเข้าใช้งาน
          </p>
        </div>
        <button
          onClick={openSendModal}
          className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Icons.Plus className="w-4 h-4" />
          <span>ส่งรถไปอู่</span>
        </button>
      </div>

      {/* Summary Cards (Mini-Compact 3-grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">กำลังซ่อมที่อู่</p>
            <p className="text-2xl font-bold text-amber-700 mt-0.5 font-mono">{stats.inProgress}</p>
          </div>
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200/60">
            <Icons.Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">รอคิวส่งซ่อม</p>
            <p className="text-2xl font-bold text-blue-700 mt-0.5 font-mono">{stats.pending}</p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
            <Icons.Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">เกินกำหนดส่งมอบ</p>
            <p className="text-2xl font-bold text-rose-700 mt-0.5 font-mono">{stats.overdue}</p>
          </div>
          <div className="p-2 bg-rose-50 text-rose-700 rounded-lg border border-rose-200/60">
            <Icons.AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        
        {/* Controls Bar (Search / Filters / View toggle with height h-9) */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">รายการงานซ่อม</h2>
            <span className="text-xs font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-mono">
              {filteredRecords.length} คัน
            </span>
          </div>

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
                placeholder="ค้นหาทะเบียน, ชื่ออู่..."
                className="h-9 w-44 sm:w-56 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal"
              />
            </div>

            {/* Filter Dropdown h-9 */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="in_progress">กำลังซ่อม (In Progress)</option>
              <option value="pending">รอส่งซ่อม (Pending)</option>
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

        {/* Content Body: Empty / Table / Cards */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <Icons.Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">ไม่มีรายการซ่อมบำรุง</h3>
            <p className="text-xs font-normal text-slate-500 mt-0.5">
              {searchQuery || statusFilter !== 'all' 
                ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา' 
                : 'ไม่มีรถยนต์ที่อยู่ระหว่างการส่งซ่อมบำรุงในขณะนี้'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW: Compact & High Contrast */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ยานพาหนะ / ทะเบียน</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">อู่ / ศูนย์บริการ</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">วันที่ส่ง</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">กำหนดคืน</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">เลขไมล์ตอนส่ง</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">สถานะ</th>
                  <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800 tracking-normal">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const isOverdue = rec.expectedReturnDate && (
                    (rec.expectedReturnDate.seconds ? new Date(rec.expectedReturnDate.seconds * 1000) : new Date(rec.expectedReturnDate)) < new Date()
                  );

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ยานพาหนะ */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-900 font-mono">
                          {rec.vehicle?.licensePlate || rec.vehicleId || '-'}
                        </div>
                        <div className="text-[11px] font-normal text-slate-600">
                          {rec.vehicle ? `${rec.vehicle.brand} ${rec.vehicle.model}` : '-'}
                        </div>
                      </td>

                      {/* อู่ */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <div className="text-xs font-normal text-slate-800">
                          {rec.vendor || '-'}
                        </div>
                      </td>

                      {/* วันที่ส่ง */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap text-xs text-slate-700 font-normal">
                        {formatDate(rec.createdAt)}
                      </td>

                      {/* กำหนดคืน */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <div className="text-xs text-slate-800 font-normal">
                          {formatDate(rec.expectedReturnDate)}
                        </div>
                        {isOverdue && rec.maintenanceStatus === 'in_progress' && (
                          <span className="inline-block px-1.5 py-0.2 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[9px] font-normal mt-0.5">
                            เกินกำหนด
                          </span>
                        )}
                      </td>

                      {/* เลขไมล์ */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap text-xs text-slate-700 font-normal font-mono">
                        {rec.odometerAtDropOff ? `${rec.odometerAtDropOff.toLocaleString()} กม.` : '-'}
                      </td>

                      {/* สถานะ */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        {rec.maintenanceStatus === 'in_progress' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-normal bg-amber-50 text-amber-900 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            กำลังซ่อม
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-normal bg-blue-50 text-blue-900 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            รอส่งซ่อม
                          </span>
                        )}
                      </td>

                      {/* การดำเนินการ */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => router.push(`/vehicles/${rec.vehicleId}/garage`)}
                            className="h-7 px-2 text-xs font-normal text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer"
                          >
                            ประวัติ
                          </button>
                          
                          <button
                            onClick={() => openEdit(rec)}
                            className="h-7 px-2 text-xs font-normal text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer"
                          >
                            แก้ไข
                          </button>

                          {rec.maintenanceStatus === 'pending' && (
                            <button
                              disabled={processing[rec.id]}
                              onClick={() => markAsSent(rec)}
                              className="h-7 px-2.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition cursor-pointer"
                            >
                              ส่งอู่
                            </button>
                          )}

                          {rec.maintenanceStatus === 'in_progress' && (
                            <button
                              disabled={processing[rec.id]}
                              onClick={() => openReceive(rec)}
                              className="h-7 px-2.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition cursor-pointer"
                            >
                              รับคืน
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARDS VIEW: Mini-Compact Grid */
          <div className="p-3.5 sm:p-4 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRecords.map((rec) => {
                const isOverdue = rec.expectedReturnDate && (
                  (rec.expectedReturnDate.seconds ? new Date(rec.expectedReturnDate.seconds * 1000) : new Date(rec.expectedReturnDate)) < new Date()
                );

                return (
                  <div key={rec.id} className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                      {/* Card Header: Plate & Status */}
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                        <div>
                          <span className="text-xs font-bold text-slate-900 font-mono">
                            {rec.vehicle?.licensePlate || rec.vehicleId || '-'}
                          </span>
                          <div className="text-[11px] font-normal text-slate-600">
                            {rec.vehicle ? `${rec.vehicle.brand} ${rec.vehicle.model}` : '-'}
                          </div>
                        </div>

                        <div>
                          {rec.maintenanceStatus === 'in_progress' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-normal bg-amber-50 text-amber-900 border border-amber-200">
                              กำลังซ่อม
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-normal bg-blue-50 text-blue-900 border border-blue-200">
                              รอส่งซ่อม
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Info Grid */}
                      <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700 font-normal mb-3 border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-[11px]">ชื่ออู่:</span>
                          <span className="text-slate-800 text-[11px] font-normal">{rec.vendor || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-[11px]">วันที่ส่ง:</span>
                          <span className="text-slate-800 text-[11px]">{formatDate(rec.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-[11px]">คาดว่าจะคืน:</span>
                          <span className="text-slate-800 text-[11px]">
                            {formatDate(rec.expectedReturnDate)}
                            {isOverdue && rec.maintenanceStatus === 'in_progress' && (
                              <span className="text-rose-600 ml-1 font-semibold">(เกินกำหนด)</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-[11px]">เลขไมล์ตอนส่ง:</span>
                          <span className="text-slate-800 text-[11px] font-mono">{rec.odometerAtDropOff ? `${rec.odometerAtDropOff.toLocaleString()} กม.` : '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => router.push(`/vehicles/${rec.vehicleId}/garage`)}
                        className="h-8 px-2.5 text-xs font-normal text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                      >
                        ประวัติ
                      </button>
                      <button
                        onClick={() => openEdit(rec)}
                        className="h-8 px-2.5 text-xs font-normal text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                      >
                        แก้ไข
                      </button>
                      {rec.maintenanceStatus === 'pending' && (
                        <button
                          disabled={processing[rec.id]}
                          onClick={() => markAsSent(rec)}
                          className="h-8 px-3 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition cursor-pointer"
                        >
                          ส่งอู่
                        </button>
                      )}
                      {rec.maintenanceStatus === 'in_progress' && (
                        <button
                          disabled={processing[rec.id]}
                          onClick={() => openReceive(rec)}
                          className="h-8 px-3 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs cursor-pointer"
                        >
                          รับคืน
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal: ส่งรถไปอู่ (Compact & High Contrast) */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-bold text-slate-900">ส่งรถไปอู่ซ่อมบำรุง</h3>
              <button onClick={closeSendModal} className="text-slate-400 hover:text-slate-700 p-1 rounded-md">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">เลือกยานพาหนะ</label>
                <select 
                  className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-normal"
                  value={sendVehicleId} 
                  onChange={(e) => {
                    const vid = e.target.value; 
                    setSendVehicleId(vid); 
                    const v = vehiclesList.find(x => x.id === vid); 
                    if (v) setSendMileage(v.currentMileage ?? '');
                  }}
                >
                  {vehiclesList.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} ({v.brand} {v.model})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">ชื่ออู่ / ศูนย์บริการ</label>
                <input 
                  className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-normal"
                  value={sendVendor} 
                  onChange={(e) => setSendVendor(e.target.value)} 
                  placeholder="เช่น อู่สมชายการช่าง, ศูนย์โตโยต้า" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">คาดว่าจะคืน</label>
                  <input 
                    type="date" 
                    className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-normal"
                    value={sendExpectedReturnDate} 
                    onChange={(e) => setSendExpectedReturnDate(e.target.value)} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">เลขไมล์ตอนส่ง (กม.)</label>
                  <input 
                    type="number" 
                    className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-normal"
                    value={sendMileage} 
                    onChange={(e) => setSendMileage(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/80 flex justify-end gap-2">
              <button onClick={closeSendModal} className="h-9 px-3.5 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                ยกเลิก
              </button>
              <button 
                onClick={handleSendSubmit} 
                disabled={processing['send']} 
                className="h-9 px-4 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                {processing['send'] ? 'กำลังส่ง...' : 'ยืนยันส่งรถไปอู่'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: แก้ไขคำขอซ่อม */}
      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-bold text-slate-900">แก้ไขข้อมูลงานซ่อม</h3>
              <button onClick={closeEdit} className="text-slate-400 hover:text-slate-700 p-1 rounded-md">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">ชื่ออู่</label>
                <input 
                  className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg font-normal" 
                  defaultValue={editRecord.vendor || ''} 
                  placeholder="ชื่ออู่" 
                  onChange={(e) => setEditRecord(r => ({ ...r, vendor: e.target.value }))} 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">คาดว่าจะคืน</label>
                <input 
                  className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg font-normal" 
                  defaultValue={editRecord.expectedReturnDate ? new Date(editRecord.expectedReturnDate.seconds ? editRecord.expectedReturnDate.seconds * 1000 : editRecord.expectedReturnDate).toISOString().split('T')[0] : ''} 
                  type="date" 
                  onChange={(e) => setEditRecord(r => ({ ...r, expectedReturnDate: e.target.value }))} 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">รายละเอียดงานซ่อม</label>
                <textarea 
                  className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg font-normal h-20" 
                  defaultValue={editRecord.details || ''} 
                  onChange={(e) => setEditRecord(r => ({ ...r, details: e.target.value }))} 
                />
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/80 flex justify-end gap-2">
              <button onClick={closeEdit} className="h-9 px-3.5 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                ยกเลิก
              </button>
              <button 
                onClick={() => handleEditSubmit({ 
                  vendor: editRecord.vendor, 
                  expectedReturnDate: editRecord.expectedReturnDate ? new Date(editRecord.expectedReturnDate) : null, 
                  details: editRecord.details 
                })} 
                className="h-9 px-4 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: รับคืนรถ (Compact & High Contrast) */}
      {receiveRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 max-h-[90vh]">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-bold text-slate-900">บันทึกรับคืนรถจากอู่</h3>
              <button onClick={closeReceive} className="text-slate-400 hover:text-slate-700 p-1 rounded-md">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-4 space-y-2.5 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">ค่าใช้จ่ายจริง (บาท)</label>
                  <input 
                    type="number" 
                    className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg font-normal" 
                    value={receiveData.finalCost} 
                    onChange={(e) => setReceiveData(d => ({ ...d, finalCost: e.target.value }))} 
                    placeholder="0" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">เลขไมล์ตอนรับคืน (กม.)</label>
                  <input 
                    type="number" 
                    className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg font-normal" 
                    value={receiveData.finalMileage} 
                    onChange={(e) => setReceiveData(d => ({ ...d, finalMileage: e.target.value }))} 
                    placeholder="เลขไมล์" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">เลขที่ใบเสร็จ / Invoice</label>
                <input 
                  type="text" 
                  className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg font-normal" 
                  value={receiveData.invoiceNumber} 
                  onChange={(e) => setReceiveData(d => ({ ...d, invoiceNumber: e.target.value }))} 
                  placeholder="เช่น INV-2026-001" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">อะไหล่ที่เปลี่ยน</label>
                <input 
                  type="text" 
                  className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg font-normal" 
                  value={receiveData.partsUsed} 
                  onChange={(e) => setReceiveData(d => ({ ...d, partsUsed: e.target.value }))} 
                  placeholder="เช่น ผ้าเบรกหน้า, น้ำมันเครื่อง" 
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={!!receiveData.warranty} 
                    onChange={(e) => setReceiveData(d => ({ ...d, warranty: e.target.checked }))} 
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-900">มีการรับประกันงานซ่อม</span>
                </label>
                {receiveData.warranty && (
                  <div className="mt-2">
                    <label className="block text-[11px] text-slate-600 mb-0.5">วันหมดอายุรับประกัน</label>
                    <input 
                      type="date" 
                      className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg font-normal" 
                      value={receiveData.warrantyDate} 
                      onChange={(e) => setReceiveData(d => ({ ...d, warrantyDate: e.target.value }))} 
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">หมายเหตุ / สรุปงานซ่อม</label>
                <textarea 
                  className="w-full p-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg font-normal h-16" 
                  value={receiveData.notes} 
                  onChange={(e) => setReceiveData(d => ({ ...d, notes: e.target.value }))} 
                  placeholder="รายละเอียดเพิ่มเติม..." 
                />
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/80 flex justify-end gap-2">
              <button onClick={closeReceive} className="h-9 px-3.5 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                ยกเลิก
              </button>
              <button 
                onClick={handleReceiveSubmit} 
                className="h-9 px-4 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                บันทึกและรับคืน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
