"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from 'next/image';

// --- Icons ---
const Icons = {
  Car: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  Plus: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  PencilSquare: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
  ),
  Wrench: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  BuildingStorefront: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72L4.318 3.44A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72m-13.5 8.65h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .415.336.75.75.75Z" />
    </svg>
  ),
  Beaker: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  Drop: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.048 8.287 8.287 0 0 0 9 9.6a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
    </svg>
  ),
  User: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  Search: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  Table: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  Grid: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  ),
  CheckCircle: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
};

// --- Helper Functions ---
const getStatusConfig = (status) => {
  switch (status) {
    case "available":
      return { label: "ว่างพร้อมใช้", bg: "bg-emerald-50 text-emerald-900 border border-emerald-200", dot: "bg-emerald-500" };
    case "pending":
      return { label: "รออนุมัติ", bg: "bg-amber-50 text-amber-900 border border-amber-200", dot: "bg-amber-500" };
    case "in_use":
    case "in-use":
      return { label: "กำลังใช้งาน", bg: "bg-blue-50 text-blue-900 border border-blue-200", dot: "bg-blue-500" };
    case "on_trip":
    case "on-trip":
      return { label: "กำลังเดินทาง", bg: "bg-indigo-50 text-indigo-900 border border-indigo-200", dot: "bg-indigo-500" };
    case "maintenance":
      return { label: "ซ่อมบำรุง", bg: "bg-rose-50 text-rose-900 border border-rose-200", dot: "bg-rose-500" };
    case "retired":
      return { label: "เลิกใช้งาน", bg: "bg-slate-100 text-slate-800 border border-slate-200", dot: "bg-slate-400" };
    default:
      return { label: status || "-", bg: "bg-slate-100 text-slate-800 border border-slate-200", dot: "bg-slate-400" };
  }
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State (Height h-9 controls)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  useEffect(() => {
    const q = query(collection(db, "vehicles"));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const vehiclesData = [];
      querySnapshot.forEach((doc) => {
        vehiclesData.push({ id: doc.id, ...doc.data() });
      });

      // enrich vehicles with driver name and latest fuel/fluid/maintenance log
      const enriched = await Promise.all(vehiclesData.map(async v => {
        // Driver info
        if (v.driverId) {
          try {
            const { doc, getDoc } = await import('firebase/firestore');
            const userRef = doc(db, 'users', v.driverId);
            const snap = await getDoc(userRef);
            if (snap.exists()) v.driver = { id: snap.id, ...snap.data() };
          } catch (e) { console.error('driver lookup failed', e); }
        }
        if (!v.driver && !v.driverName) {
          try {
            const fr = await import('firebase/firestore');
            const { collection: col, query: qfn, where, orderBy, limit, getDocs } = fr;
            const bookingsRef = col(db, 'bookings');
            const bq = qfn(bookingsRef, where('vehicleId', '==', v.id), where('status', 'in', ['approved', 'in_use', 'on_trip', 'completed', 'finished', 'returned']), orderBy('createdAt', 'desc'), limit(1));
            const bSnap = await getDocs(bq);
            if (!bSnap.empty) {
              const bd = bSnap.docs[0].data();
              v.latestBookingStatus = bd.status;

              if (bd.driverId) {
                try {
                  const { doc: docFn, getDoc: getDocFn } = await import('firebase/firestore');
                  const userRef2 = docFn(db, 'users', bd.driverId);
                  const uSnap = await getDocFn(userRef2);
                  if (uSnap.exists()) v.driver = { id: uSnap.id, ...uSnap.data() };
                  else v.driverName = bd.driverName || bd.requesterName || '-';
                } catch (e) { v.driverName = bd.driverName || bd.requesterName || '-'; }
              } else { v.driverName = bd.driverName || bd.requesterName || '-'; }
            }
          } catch (e) { console.error('latest booking lookup failed', e); }
        }

        // Latest fuel/fluid/maintenance expense
        try {
          const fr = await import('firebase/firestore');
          const { collection: col, query: qfn, where, getDocs } = fr;
          const expensesRef = col(db, 'expenses');

          // Fuel
          try {
            const fuelQ = qfn(expensesRef, where('vehicleId', '==', v.id), where('type', '==', 'fuel'));
            const fuelSnap = await getDocs(fuelQ);
            if (!fuelSnap.empty) {
              const fuelDocs = fuelSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
                const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                return bTime - aTime;
              });
              v.latestFuel = fuelDocs[0];
            }
          } catch (e) {}

          // Fluid
          try {
            const fluidQ = qfn(expensesRef, where('vehicleId', '==', v.id), where('type', '==', 'fluid'));
            const fluidSnap = await getDocs(fluidQ);
            if (!fluidSnap.empty) {
              const fluidDocs = fluidSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
                const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                return bTime - aTime;
              });
              v.latestFluid = fluidDocs[0];
            }
          } catch (e) {}

          // Maintenance
          try {
            const maintenancesRef = col(db, 'maintenances');
            const maintenanceQ = qfn(maintenancesRef, where('vehicleId', '==', v.id));
            const maintenanceSnap = await getDocs(maintenanceQ);
            if (!maintenanceSnap.empty) {
              const maintenanceDocs = maintenanceSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
                const aTime = a.receivedAt?.toDate ? a.receivedAt.toDate() : (a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0));
                const bTime = b.receivedAt?.toDate ? b.receivedAt.toDate() : (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0));
                return bTime - aTime;
              });
              const latest = maintenanceDocs[0];
              v.latestMaintenance = { mileage: latest.finalMileage || latest.odometerAtDropOff || null, amount: latest.finalCost || null, note: latest.type || latest.details || null };
            }
          } catch (e) {}
        } catch (e) {}

        return v;
      }));

      setVehicles(enriched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      if (statusFilter) {
        if (statusFilter === 'in_use' && !['in_use', 'in-use', 'on_trip', 'on-trip', 'pending'].includes(vehicle.status)) return false;
        else if (statusFilter !== 'in_use' && vehicle.status !== statusFilter) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const plate = (vehicle.licensePlate || '').toLowerCase();
        const brand = (vehicle.brand || '').toLowerCase();
        const model = (vehicle.model || '').toLowerCase();
        const type = (vehicle.type || '').toLowerCase();
        const driverName = (vehicle.driver?.displayName || vehicle.driver?.name || vehicle.driverName || '').toLowerCase();

        return plate.includes(q) || brand.includes(q) || model.includes(q) || type.includes(q) || driverName.includes(q);
      }

      return true;
    });
  }, [vehicles, statusFilter, searchQuery]);

  // Summary counts
  const availableCount = useMemo(() => vehicles.filter(v => v.status === 'available').length, [vehicles]);
  const inUseCount = useMemo(() => vehicles.filter(v => ['in_use', 'in-use', 'on_trip', 'on-trip', 'pending'].includes(v.status)).length, [vehicles]);
  const maintenanceCount = useMemo(() => vehicles.filter(v => v.status === 'maintenance').length, [vehicles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header (Compact) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ยานพาหนะ</h1>
          <p className="text-slate-600 text-xs mt-0.5 font-normal">
            จัดการข้อมูลรถ ทะเบียน ประวัติการเติมน้ำมัน และการส่งซ่อมบำรุง
          </p>
        </div>
        <Link
          href="/vehicles/add"
          className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-normal shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Icons.Plus className="w-3.5 h-3.5" />
          <span>เพิ่มรถใหม่</span>
        </Link>
      </div>

      {/* Summary Stats (Mini-Compact 4-grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">รถทั้งหมดในระบบ</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5 font-mono">{vehicles.length}</p>
          </div>
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
            <Icons.Car className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">ว่างพร้อมใช้งาน</p>
            <p className="text-xl font-bold text-emerald-900 mt-0.5 font-mono">{availableCount}</p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60">
            <Icons.CheckCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">กำลังใช้งาน / ทริป</p>
            <p className="text-xl font-bold text-blue-900 mt-0.5 font-mono">{inUseCount}</p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
            <Icons.Car className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">ซ่อมบำรุง / อู่</p>
            <p className="text-xl font-bold text-rose-900 mt-0.5 font-mono">{maintenanceCount}</p>
          </div>
          <div className="p-2 bg-rose-50 text-rose-700 rounded-lg border border-rose-200/60">
            <Icons.Wrench className="w-4 h-4 text-rose-600" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        
        {/* Controls Bar (Search, Status Filter, View Mode Toggle: Height h-9) */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">รายชื่อยานพาหนะ</h2>
            <span className="text-xs font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-mono">
              {filteredVehicles.length} คัน
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
                placeholder="ค้นหาทะเบียน, ยี่ห้อ, รุ่น, คนขับ..."
                className="h-9 w-48 sm:w-60 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal"
              />
            </div>

            {/* Status Filter h-9 */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
            >
              <option value="">ทุกสถานะ</option>
              <option value="available">ว่างพร้อมใช้</option>
              <option value="in_use">กำลังใช้งาน</option>
              <option value="maintenance">ซ่อมบำรุง</option>
              <option value="retired">เลิกใช้งาน</option>
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

            {/* Clear Filter */}
            {(searchQuery || statusFilter) && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                className="h-9 px-2.5 text-xs font-normal text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Content: Empty / Table / Cards */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <Icons.Car className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">ไม่พบข้อมูลยานพาหนะ</h3>
            <p className="text-xs font-normal text-slate-500 mt-0.5">
              {searchQuery || statusFilter 
                ? 'ไม่พบรถที่ตรงกับเงื่อนไขการค้นหา' 
                : 'ยังไม่มีข้อมูลยานพาหนะในระบบ'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View: Compact & High Contrast */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ยานพาหนะ / ทะเบียน</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">สถานะ</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ผู้ใช้งานล่าสุด</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">บันทึกล่าสุด</th>
                  <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800 tracking-normal">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredVehicles.map(vehicle => {
                  const status = getStatusConfig(vehicle.status);
                  const isReturned = vehicle.latestBookingStatus && ['completed', 'finished', 'returned'].includes(vehicle.latestBookingStatus);

                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Vehicle & Plate */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-12 h-9 rounded bg-slate-100 relative overflow-hidden shrink-0 border border-slate-200">
                            {vehicle.imageUrl ? (
                              <Image 
                                src={vehicle.imageUrl} 
                                alt={vehicle.model || 'Car'} 
                                fill 
                                className="object-cover" 
                                unoptimized 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                                <Icons.Car className="w-4 h-4 opacity-40" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 font-mono">
                              {vehicle.licensePlate}
                            </div>
                            <div className="text-[11px] font-normal text-slate-600">
                              {vehicle.brand} {vehicle.model}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-normal ${status.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                          {status.label}
                        </span>
                      </td>

                      {/* User */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        {vehicle.driver || vehicle.driverName ? (
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${isReturned ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-700 font-bold'}`}>
                              <Icons.User className="w-3 h-3" />
                            </div>
                            <div className="text-xs">
                              <span className={`font-normal ${isReturned ? 'text-slate-500' : 'text-slate-900 font-semibold'}`}>
                                {isReturned ? 'ล่าสุด: ' : ''}
                                {vehicle.driver?.displayName || vehicle.driver?.name || vehicle.driverName}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-normal italic">ว่าง</span>
                        )}
                      </td>

                      {/* Latest Logs */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5 text-xs text-slate-700 font-normal">
                          {vehicle.latestFuel ? (
                            <span className="flex items-center gap-1 text-[11px]">
                              <Icons.Drop className="w-3 h-3 text-blue-600" />
                              <span>น้ำมัน: {new Date(vehicle.latestFuel.timestamp?.seconds * 1000).toLocaleDateString('th-TH')}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Icons.Drop className="w-3 h-3 opacity-30" /> -
                            </span>
                          )}

                          {vehicle.latestMaintenance ? (
                            <span className="flex items-center gap-1 text-[11px]">
                              <Icons.Wrench className="w-3 h-3 text-rose-600" />
                              <span>ซ่อม: {new Date(vehicle.latestMaintenance.amount ? Date.now() : 0).toLocaleDateString('th-TH')}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Icons.Wrench className="w-3 h-3 opacity-30" /> -
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quick Action Buttons (Compact h-7) */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Link 
                            href={`/vehicles/${vehicle.id}/edit`} 
                            className="h-7 px-2 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors flex items-center gap-1 cursor-pointer" 
                            title="แก้ไขข้อมูลรถ"
                          >
                            <Icons.PencilSquare className="w-3 h-3" />
                            <span className="hidden xl:inline">แก้ไข</span>
                          </Link>

                          <Link 
                            href={`/vehicles/${vehicle.id}/garage`} 
                            className="h-7 px-2 text-xs font-normal text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer" 
                            title="ส่งซ่อม (อู่)"
                          >
                            <Icons.BuildingStorefront className="w-3 h-3" />
                            <span className="hidden xl:inline">อู่</span>
                          </Link>

                          <Link 
                            href={`/vehicles/${vehicle.id}/fuel`} 
                            className="h-7 px-2 text-xs font-normal text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer" 
                            title="บันทึกเติมน้ำมัน"
                          >
                            <Icons.Drop className="w-3 h-3" />
                            <span className="hidden xl:inline">น้ำมัน</span>
                          </Link>

                          <Link 
                            href={`/vehicles/${vehicle.id}/fluid`} 
                            className="h-7 px-2 text-xs font-normal text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer" 
                            title="เปลี่ยนของเหลว"
                          >
                            <Icons.Beaker className="w-3 h-3" />
                            <span className="hidden xl:inline">ของเหลว</span>
                          </Link>

                          <Link 
                            href={`/vehicles/${vehicle.id}/maintenance`} 
                            className="h-7 px-2 text-xs font-normal text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer" 
                            title="ประวัติซ่อมบำรุง"
                          >
                            <Icons.Wrench className="w-3 h-3" />
                            <span className="hidden xl:inline">ซ่อมบำรุง</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View: Compact & High Contrast */
          <div className="p-3.5 sm:p-4 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredVehicles.map(vehicle => {
                const status = getStatusConfig(vehicle.status);
                const isReturned = vehicle.latestBookingStatus && ['completed', 'finished', 'returned'].includes(vehicle.latestBookingStatus);

                return (
                  <div key={vehicle.id} className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                        <div>
                          <div className="text-xs font-bold text-slate-900 font-mono">
                            {vehicle.licensePlate}
                          </div>
                          <div className="text-[11px] font-normal text-slate-600">
                            {vehicle.brand} {vehicle.model}
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-normal ${status.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                          {status.label}
                        </span>
                      </div>

                      {/* Image & User Details */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-16 h-12 relative rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {vehicle.imageUrl ? (
                            <Image 
                              src={vehicle.imageUrl} 
                              alt={vehicle.model || 'Car'} 
                              fill 
                              className="object-cover" 
                              unoptimized 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                              <Icons.Car className="w-5 h-5 opacity-40" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 text-xs text-slate-700 font-normal space-y-0.5">
                          <div className="flex items-center gap-1 truncate">
                            <span className="text-slate-500 text-[11px]">ผู้ใช้:</span>
                            <span className={`truncate text-[11px] ${isReturned ? 'text-slate-500' : 'text-slate-900 font-semibold'}`}>
                              {vehicle.driver?.displayName || vehicle.driver?.name || vehicle.driverName || 'ว่าง'}
                            </span>
                          </div>

                          {vehicle.latestFuel && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Icons.Drop className="w-2.5 h-2.5 text-blue-600" />
                              <span>น้ำมัน: {new Date(vehicle.latestFuel.timestamp?.seconds * 1000).toLocaleDateString('th-TH')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                      <Link 
                        href={`/vehicles/${vehicle.id}/edit`} 
                        className="h-7 px-2 text-[11px] font-normal text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded flex items-center gap-1"
                      >
                        <Icons.PencilSquare className="w-3 h-3" />
                        <span>แก้ไข</span>
                      </Link>

                      <div className="flex items-center gap-1">
                        <Link 
                          href={`/vehicles/${vehicle.id}/garage`} 
                          className="h-7 px-2 text-[11px] font-normal text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded flex items-center gap-0.5" 
                          title="อู่ซ่อม"
                        >
                          <Icons.BuildingStorefront className="w-3 h-3" />
                          <span>อู่</span>
                        </Link>
                        <Link 
                          href={`/vehicles/${vehicle.id}/fuel`} 
                          className="h-7 px-2 text-[11px] font-normal text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded flex items-center gap-0.5" 
                          title="น้ำมัน"
                        >
                          <Icons.Drop className="w-3 h-3" />
                          <span>น้ำมัน</span>
                        </Link>
                        <Link 
                          href={`/vehicles/${vehicle.id}/fluid`} 
                          className="h-7 px-2 text-[11px] font-normal text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded flex items-center gap-0.5" 
                          title="ของเหลว"
                        >
                          <Icons.Beaker className="w-3 h-3" />
                          <span>ของเหลว</span>
                        </Link>
                        <Link 
                          href={`/vehicles/${vehicle.id}/maintenance`} 
                          className="h-7 px-2 text-[11px] font-normal text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded flex items-center gap-0.5" 
                          title="ซ่อมบำรุง"
                        >
                          <Icons.Wrench className="w-3 h-3" />
                          <span>ซ่อม</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}