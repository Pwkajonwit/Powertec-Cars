"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AlertToast from '@/components/ui/AlertToast';

// --- Icons ---
const Icons = {
  Chart: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  Car: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  Drop: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.048 8.287 8.287 0 0 0 9 9.6a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
    </svg>
  ),
  Distance: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689A1.125 1.125 0 0 0 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    </svg>
  ),
  Coin: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  AlertTriangle: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  )
};

export default function VehiclesAnalysisPage() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState({
    totalTrips: 0,
    totalDistance: 0,
    totalExpenses: 0,
    totalFuelExpenses: 0,
    fuelRecords: [],
    averageFuelEfficiency: 0,
    costPerKm: 0,
  });

  // Threshold state
  const [threshold, setThreshold] = useState(10);

  // Alert State
  const [alertState, setAlertState] = useState({ show: false, message: '', type: 'success' });
  const showAlert = (message, type = 'success') => {
    setAlertState({ show: true, message, type });
  };

  // Pagination state for fuel records
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const unsubVehicles = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
      setVehicles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubThreshold = onSnapshot(doc(db, 'settings', 'fuelEfficiencyThreshold'), (docSnap) => {
      if (docSnap.exists()) {
        setThreshold(docSnap.data().value || 10);
      }
    });

    return () => {
      unsubVehicles();
      unsubThreshold();
    };
  }, []);

  // Fetch analysis data based on filters
  useEffect(() => {
    if (vehicles.length === 0) return;

    setLoading(true);
    const expensesQueryRef = query(collection(db, 'expenses'), orderBy('timestamp', 'desc'));
    const unsubExpenses = onSnapshot(expensesQueryRef, (expensesSnap) => {
      let allExpenses = expensesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
      }));

      if (selectedVehicle !== 'all') {
        allExpenses = allExpenses.filter(exp => exp.vehicleId === selectedVehicle);
      }

      const now = new Date();
      let startDateTime = new Date();
      let endDateTime = now;
      switch (dateRange) {
        case 'today':
          startDateTime.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDateTime.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDateTime.setMonth(now.getMonth() - 1);
          break;
        case 'custom':
          if (startDate && endDate) {
            startDateTime = new Date(startDate);
            endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
          }
          break;
      }

      allExpenses = allExpenses.filter(exp => {
        const expDate = exp.timestamp;
        return expDate >= startDateTime && expDate <= endDateTime;
      });

      const fuelExpenses = allExpenses.filter(exp => exp.type === 'fuel' && exp.mileage);

      let allFuelRecords = [];
      const targetVehicles = selectedVehicle === 'all' ? vehicles : vehicles.filter(v => v.id === selectedVehicle);

      targetVehicles.forEach(vehicle => {
        const vFuelRecords = fuelExpenses
          .filter(r => r.vehicleId === vehicle.id && r.mileage !== undefined && r.mileage !== null)
          .sort((a, b) => a.mileage - b.mileage);

        vFuelRecords.forEach((exp, index) => {
          let distanceTraveled = 0;
          let fuelEfficiency = null;
          let costPerKm = null;
          if (index > 0) {
            const prevExp = vFuelRecords[index - 1];
            distanceTraveled = exp.mileage - prevExp.mileage;

            if (distanceTraveled > 0 && prevExp.amount > 0) {
              fuelEfficiency = (distanceTraveled / prevExp.amount) * 1000;
              costPerKm = prevExp.amount / distanceTraveled;
            }
          }
          allFuelRecords.push({ ...exp, distanceTraveled, fuelEfficiency, costPerKm });
        });
      });

      const validEfficiencies = allFuelRecords.filter(r => r.fuelEfficiency !== null);
      const avgFuelEfficiency = validEfficiencies.length > 0
        ? validEfficiencies.reduce((sum, r) => sum + r.fuelEfficiency, 0) / validEfficiencies.length
        : 0;
      const totalExpenses = allExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const totalFuelExpenses = fuelExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

      let totalDistance = targetVehicles.reduce((sum, v) => {
        const vStartMileage = v.currentMileage !== undefined && v.currentMileage !== null ? Number(v.currentMileage) : null;
        const vFuelRecords = fuelExpenses.filter(r => r.vehicleId === v.id && r.mileage !== undefined && r.mileage !== null);
        if (vFuelRecords.length > 0 && vStartMileage !== null) {
          const maxMileage = Math.max(...vFuelRecords.map(r => Number(r.mileage)));
          return sum + Math.max(0, maxMileage - vStartMileage);
        }
        return sum;
      }, 0);

      const totalTrips = allFuelRecords.length;
      const costPerKm = totalDistance > 0 ? totalExpenses / totalDistance : 0;

      setAnalysisData({
        totalTrips,
        totalDistance,
        totalExpenses,
        totalFuelExpenses,
        fuelRecords: allFuelRecords.reverse(),
        averageFuelEfficiency: avgFuelEfficiency,
        costPerKm,
      });
      setLoading(false);
    });

    return () => unsubExpenses();
  }, [vehicles, selectedVehicle, dateRange, startDate, endDate]);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const saveThreshold = async () => {
    try {
      await setDoc(doc(db, 'settings', 'fuelEfficiencyThreshold'), {
        value: Number(threshold) || 10,
        updatedAt: new Date()
      });
      showAlert('บันทึกเกณฑ์ความประหยัดเรียบร้อย', 'success');
    } catch (error) {
      console.error('Error saving threshold:', error);
      showAlert('ไม่สามารถบันทึกเกณฑ์ได้', 'error');
    }
  };

  if (loading && vehicles.length === 0) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">วิเคราะห์การใช้ยานพาหนะ</h1>
          <p className="text-slate-600 text-xs mt-0.5 font-normal">
            สถิติการใช้งาน อัตราสิ้นเปลืองน้ำมัน ต้นทุนต่อกิโลเมตร และแนวโน้มประสิทธิภาพ
          </p>
        </div>
      </div>

      {/* Controls Bar (Filter Bar Height h-9) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 sm:p-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Vehicle Select h-9 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">เลือกยานพาหนะ</label>
            <select 
              value={selectedVehicle} 
              onChange={(e) => { setSelectedVehicle(e.target.value); setCurrentPage(1); }} 
              className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
            >
              <option value="all">รถทั้งหมด ({vehicles.length} คัน)</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.licensePlate} - {v.brand} {v.model}</option>
              ))}
            </select>
          </div>

          {/* Date Range Select h-9 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">ช่วงเวลา</label>
            <select 
              value={dateRange} 
              onChange={(e) => { setDateRange(e.target.value); setCurrentPage(1); }} 
              className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
            >
              <option value="today">วันนี้</option>
              <option value="week">7 วันที่ผ่านมา</option>
              <option value="month">30 วันที่ผ่านมา</option>
              <option value="custom">กำหนดช่วงวันที่เอง</option>
            </select>
          </div>

          {/* Custom Date Pickers h-9 */}
          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">ตั้งแต่วันที่</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} 
                  className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">ถึงวันที่</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} 
                  className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer" 
                />
              </div>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <>
          {/* Summary KPI Cards (Mini-Compact 4-grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-normal text-slate-600">จำนวนการเติมน้ำมัน</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5 font-mono">{analysisData.totalTrips}</p>
                <p className="text-[10px] text-slate-400 font-normal">ครั้ง</p>
              </div>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
                <Icons.Drop className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-normal text-slate-600">ระยะทางรวม</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5 font-mono">{analysisData.totalDistance.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-normal">กิโลเมตร</p>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60">
                <Icons.Distance className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-normal text-slate-600">ค่าวิ่งได้เฉลี่ย</p>
                <p className="text-xl font-bold text-emerald-800 mt-0.5 font-mono">
                  {analysisData.averageFuelEfficiency > 0 ? analysisData.averageFuelEfficiency.toFixed(1) : '-'}
                </p>
                <p className="text-[10px] text-slate-400 font-normal">กม./1000 บาท</p>
              </div>
              <div className="p-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200/60">
                <Icons.Chart className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-normal text-slate-600">ต้นทุนต่อ กม.</p>
                <p className="text-xl font-bold text-amber-800 mt-0.5 font-mono">
                  {analysisData.costPerKm.toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-400 font-normal">บาท/กม.</p>
              </div>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200/60">
                <Icons.Coin className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Threshold Warning Section (Compact) */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-rose-50 text-rose-700 rounded border border-rose-200">
                  <Icons.AlertTriangle className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">รถที่มีค่าวิ่งได้เฉลี่ยต่ำกว่าเกณฑ์</h2>
                  <p className="text-[11px] text-slate-500 font-normal">รถที่สิ้นเปลืองน้ำมันมากกว่าปกติ ควรตรวจเช็กระบบเครื่องยนต์</p>
                </div>
              </div>

              {/* Threshold Setter Controls h-9 */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <label htmlFor="threshold" className="text-xs font-normal text-slate-700 whitespace-nowrap">เกณฑ์ (กม./1000฿):</label>
                <input
                  id="threshold"
                  type="number"
                  min="1"
                  max="1000"
                  value={threshold}
                  onChange={e => setThreshold(Number(e.target.value))}
                  className="h-9 w-20 px-2 text-center text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-rose-500 font-normal"
                />
                <button
                  onClick={saveThreshold}
                  className="h-9 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-normal rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  บันทึก
                </button>
              </div>
            </div>

            <div className="p-0">
              {(() => {
                const filteredVehicles = vehicles.filter(vehicle => {
                  const vFuelRecords = analysisData.fuelRecords.filter(r => r.vehicleId === vehicle.id && r.fuelEfficiency !== null);
                  const avgEff = vFuelRecords.length > 0 ? (vFuelRecords.reduce((sum, r) => sum + r.fuelEfficiency, 0) / vFuelRecords.length) : 0;
                  return avgEff > 0 && avgEff < threshold;
                });

                if (filteredVehicles.length === 0) {
                  return (
                    <div className="text-center text-slate-500 py-6 text-xs font-normal">
                      ✓ ทุกคันมีอัตราวิ่งได้ผ่านมาตรฐานขั้นต่ำ ({threshold} กม./1000 บาท)
                    </div>
                  );
                }

                return (
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800">ทะเบียนรถ</th>
                        <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800">ยี่ห้อ / รุ่น</th>
                        <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800">ค่าวิ่งได้เฉลี่ย</th>
                        <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800">สถานะการสิ้นเปลือง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredVehicles.map(vehicle => {
                        const vFuelRecords = analysisData.fuelRecords.filter(r => r.vehicleId === vehicle.id && r.fuelEfficiency !== null);
                        const avgEff = vFuelRecords.length > 0 ? (vFuelRecords.reduce((sum, r) => sum + r.fuelEfficiency, 0) / vFuelRecords.length) : 0;

                        return (
                          <tr key={vehicle.id} className="hover:bg-rose-50/40 transition-colors">
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-xs font-bold text-slate-900 font-mono">
                              {vehicle.licensePlate}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-xs text-slate-600 font-normal">
                              {vehicle.brand} {vehicle.model}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-right text-xs font-bold text-rose-700 font-mono">
                              {avgEff.toFixed(1)} กม./1000฿
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-right">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-rose-50 text-rose-800 border border-rose-200">
                                ต่ำกว่าเกณฑ์ {threshold}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>

          {/* Fuel Efficiency Chart (Compact Card) */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">กราฟค่าวิ่งได้รายคัน (กม./1,000 บาท)</h2>
              <span className="text-[11px] text-slate-500 font-normal">เปรียบเทียบตามช่วงเวลา</span>
            </div>

            {(() => {
              const chartData = vehicles.map(vehicle => {
                const vFuelRecords = analysisData.fuelRecords
                  .filter(r => r.vehicleId === vehicle.id && r.fuelEfficiency !== null)
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                return {
                  vehicle,
                  records: vFuelRecords,
                };
              }).filter(v => v.records.length > 0);

              if (chartData.length === 0) {
                return (
                  <div className="text-center text-slate-400 py-12 text-xs font-normal">
                    ไม่มีข้อมูลการเติมน้ำมันที่เพียงพอสำหรับการสร้างกราฟในช่วงเวลานี้
                  </div>
                );
              }

              const allEfficiencies = chartData.flatMap(v => v.records.map(r => r.fuelEfficiency));
              const maxEff = Math.max(...allEfficiencies, 1000);
              const minEff = 0;
              const chartHeight = 280;
              const chartPadding = { top: 20, right: 20, bottom: 50, left: 55 };
              const svgWidth = 900;

              const yScale = (value) => {
                return chartHeight - chartPadding.bottom - ((value - minEff) / (maxEff - minEff)) * (chartHeight - chartPadding.top - chartPadding.bottom);
              };

              const allDates = [...new Set(chartData.flatMap(v =>
                v.records.map(r => new Date(r.timestamp).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }))
              ))].sort();

              const xScale = (index) => {
                return chartPadding.left + (index / (Math.max(1, allDates.length - 1))) * (svgWidth - chartPadding.left - chartPadding.right);
              };

              const colors = [
                '#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed',
                '#db2777', '#0d9488', '#ea580c', '#0891b2', '#65a30d'
              ];

              return (
                <div className="w-full">
                  <div className="overflow-x-auto">
                    <svg width="100%" height={chartHeight} viewBox={`0 0 ${svgWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" className="mx-auto select-none">
                      {/* Grid lines & Y labels */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                        const value = minEff + (maxEff - minEff) * ratio;
                        const y = yScale(value);
                        return (
                          <g key={ratio}>
                            <line
                              x1={chartPadding.left}
                              y1={y}
                              x2={svgWidth - chartPadding.right}
                              y2={y}
                              stroke="#e2e8f0"
                              strokeWidth="1"
                              strokeDasharray="3 3"
                            />
                            <text
                              x={chartPadding.left - 8}
                              y={y + 4}
                              textAnchor="end"
                              fontSize="11"
                              fill="#64748b"
                              fontFamily="monospace"
                            >
                              {value.toFixed(0)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Threshold horizontal line */}
                      {threshold > 0 && threshold <= maxEff && (
                        <g>
                          <line
                            x1={chartPadding.left}
                            y1={yScale(threshold)}
                            x2={svgWidth - chartPadding.right}
                            y2={yScale(threshold)}
                            stroke="#f43f5e"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                          />
                          <text
                            x={svgWidth - chartPadding.right}
                            y={yScale(threshold) - 5}
                            textAnchor="end"
                            fontSize="10"
                            fill="#f43f5e"
                            fontWeight="bold"
                          >
                            เกณฑ์ ({threshold})
                          </text>
                        </g>
                      )}

                      {/* X labels (Dates) */}
                      {allDates.map((date, index) => {
                        const x = xScale(index);
                        return (
                          <text
                            key={index}
                            x={x}
                            y={chartHeight - chartPadding.bottom + 18}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#64748b"
                            fontFamily="monospace"
                          >
                            {date}
                          </text>
                        );
                      })}

                      {/* Lines & Points */}
                      {chartData.map((vehicleData, vIndex) => {
                        const points = vehicleData.records.map((record) => {
                          const dateStr = new Date(record.timestamp).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
                          const dateIndex = allDates.indexOf(dateStr);
                          const x = xScale(dateIndex);
                          const y = yScale(record.fuelEfficiency);
                          return { x, y, record };
                        });

                        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                        const lineColor = colors[vIndex % colors.length];

                        return (
                          <g key={vehicleData.vehicle.id}>
                            <path
                              d={pathD}
                              fill="none"
                              stroke={lineColor}
                              strokeWidth="2"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                            />
                            {points.map((point, pIndex) => (
                              <circle
                                key={pIndex}
                                cx={point.x}
                                cy={point.y}
                                r="3.5"
                                fill={lineColor}
                                stroke="white"
                                strokeWidth="1.5"
                              >
                                <title>
                                  {vehicleData.vehicle.licensePlate}: {point.record.fuelEfficiency.toFixed(1)} กม./1000฿
                                </title>
                              </circle>
                            ))}
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Legend (Pills) */}
                  <div className="flex flex-wrap gap-1.5 justify-center mt-3 pt-2 border-t border-slate-100">
                    {chartData.map((vehicleData, vIndex) => {
                      const lineColor = colors[vIndex % colors.length];
                      const avgEff = vehicleData.records.reduce((sum, r) => sum + r.fuelEfficiency, 0) / vehicleData.records.length;

                      return (
                        <div key={vehicleData.vehicle.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-xs">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lineColor }}></div>
                          <span className="font-bold text-slate-900 font-mono text-[11px]">{vehicleData.vehicle.licensePlate}</span>
                          <span className="text-slate-600 font-mono text-[10px]">({avgEff.toFixed(1)} กม./1000฿)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Fuel History Table (Compact) */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">ประวัติการเติมน้ำมัน</h2>
                <p className="text-[11px] text-slate-500 font-normal">รายการบันทึกทั้งหมดในช่วงเวลาที่เลือก</p>
              </div>
              <span className="text-xs font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-mono">
                {analysisData.fuelRecords.length} รายการ
              </span>
            </div>

            {/* Desktop Table View */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800">ทะเบียนรถ</th>
                    <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800">วันที่เติม</th>
                    <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800">เลขไมล์</th>
                    <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800">ระยะทางที่วิ่ง</th>
                    <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800">จำนวนเงิน</th>
                    <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800">ค่าวิ่งได้</th>
                    <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800">ต้นทุน/กม.</th>
                    <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {analysisData.fuelRecords.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-xs text-slate-500 font-normal">
                        ไม่พบข้อมูลการเติมน้ำมันในช่วงเวลานี้
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const endIndex = startIndex + itemsPerPage;
                      const currentRecords = analysisData.fuelRecords.slice(startIndex, endIndex);

                      return currentRecords.map((record) => {
                        const vehicle = vehicles.find(v => v.id === record.vehicleId);
                        return (
                          <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-xs font-bold text-slate-900 font-mono">
                              {vehicle ? vehicle.licensePlate : '-'}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-xs text-slate-700 font-normal">
                              {formatDate(record.timestamp)}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-right text-xs text-slate-900 font-mono font-normal">
                              {record.mileage ? `${record.mileage.toLocaleString()} กม.` : '-'}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-right text-xs font-mono font-normal">
                              {record.distanceTraveled > 0 ? (
                                <span className="text-emerald-700 font-bold">{record.distanceTraveled.toLocaleString()} กม.</span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-right text-xs font-bold text-slate-900 font-mono">
                              {record.amount ? `${Number(record.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ฿` : '-'}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-right text-xs font-mono">
                              {record.fuelEfficiency !== null ? (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-normal border ${
                                  record.fuelEfficiency >= 500 
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                                    : record.fuelEfficiency >= 300 
                                      ? 'bg-amber-50 text-amber-900 border-amber-200' 
                                      : 'bg-rose-50 text-rose-900 border-rose-200'
                                }`}>
                                  {record.fuelEfficiency.toFixed(1)} กม./1000฿
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-right text-xs text-slate-800 font-mono font-normal">
                              {record.costPerKm !== null ? `${record.costPerKm.toFixed(2)} ฿/กม.` : '-'}
                            </td>
                            <td className="px-3.5 py-2.5 text-xs text-slate-500 font-normal truncate max-w-[150px]">
                              {record.note || '-'}
                            </td>
                          </tr>
                        );
                      });
                    })()
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {analysisData.fuelRecords.length > itemsPerPage && (
              <div className="px-3.5 py-2.5 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-xs text-slate-600 font-normal">
                  แสดง <span className="font-mono font-semibold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> ถึง{' '}
                  <span className="font-mono font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, analysisData.fuelRecords.length)}</span> จาก{' '}
                  <span className="font-mono font-bold text-slate-900">{analysisData.fuelRecords.length}</span> รายการ
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
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-2.5 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ก่อนหน้า
                  </button>

                  {/* Compact page buttons */}
                  {(() => {
                    const totalPages = Math.ceil(analysisData.fuelRecords.length / itemsPerPage);
                    let startPage = Math.max(1, currentPage - 1);
                    let endPage = Math.min(totalPages, startPage + 2);
                    if (endPage - startPage < 2) {
                      startPage = Math.max(1, endPage - 2);
                    }
                    const pages = [];
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
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(analysisData.fuelRecords.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(analysisData.fuelRecords.length / itemsPerPage)}
                    className="h-8 px-2.5 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.ceil(analysisData.fuelRecords.length / itemsPerPage))}
                    disabled={currentPage === Math.ceil(analysisData.fuelRecords.length / itemsPerPage)}
                    className="h-8 px-2 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="หน้าสุดท้าย"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
