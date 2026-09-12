"use client";

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageHelpers';
import AlertToast from '@/components/ui/AlertToast';

// Icons
const Icons = {
  Clock: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  Car: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  Users: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
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
  Check: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  ),
  XMark: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
};

export default function PendingApprovalsPage() {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState(null);
  const [alertState, setAlertState] = useState({ show: false, message: '', type: 'success' });

  // Filters state (Compact h-9)
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const showAlert = (message, type = 'success') => {
    setAlertState({ show: true, message, type });
  };

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vehicle-usage/approve');
      const data = await res.json();
      setPendingList(data.pending || []);
    } catch (e) {
      console.error('Error fetching pending:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (usageId, action, note = '') => {
    setProcessing(usageId);
    try {
      const res = await fetch('/api/vehicle-usage/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageId, action, adminNote: note }),
      });
      const data = await res.json();

      if (res.ok) {
        showAlert(data.message, 'success');
        setPendingList(prev => prev.filter(item => item.id !== usageId));
      } else {
        showAlert(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch (e) {
      showAlert('เกิดข้อผิดพลาดในการดำเนินการ', 'error');
    }
    setProcessing(null);
    setShowNoteModal(false);
    setAdminNote('');
    setSelectedUsage(null);
  };

  const openNoteModal = (usage) => {
    setSelectedUsage(usage);
    setShowNoteModal(true);
  };

  const formatDate = (ts) => {
    if (!ts) return '-';
    let date;
    if (ts.seconds) date = new Date(ts.seconds * 1000);
    else if (ts._seconds) date = new Date(ts._seconds * 1000);
    else date = new Date(ts);

    return date.toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Filter pending items
  const filteredList = useMemo(() => {
    return pendingList.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const userName = (item.userName || item.user?.name || '').toLowerCase();
      const plate = (item.vehicleLicensePlate || item.vehicle?.licensePlate || '').toLowerCase();
      const brand = (item.vehicle?.brand || '').toLowerCase();
      const destination = (item.destination || '').toLowerCase();
      const purpose = (item.purpose || '').toLowerCase();

      return userName.includes(q) || plate.includes(q) || brand.includes(q) || destination.includes(q) || purpose.includes(q);
    });
  }, [pendingList, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">รอการอนุมัติการใช้งาน</h1>
          <p className="text-slate-600 text-xs mt-0.5 font-normal">
            รายการคำขอเบิกใช้ยานพาหนะที่รอการตรวจสอบและอนุมัติจากผู้ดูแลระบบ
          </p>
        </div>
      </div>

      {/* Summary Stats (Mini-Compact 3-grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">คำขอรออนุมัติทั้งหมด</p>
            <p className="text-2xl font-bold text-amber-700 mt-0.5 font-mono">{pendingList.length}</p>
          </div>
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200/60">
            <Icons.Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">รถที่ถูกขอใช้งาน</p>
            <p className="text-2xl font-bold text-blue-700 mt-0.5 font-mono">
              {new Set(pendingList.map(item => item.vehicleLicensePlate || item.vehicle?.licensePlate).filter(Boolean)).size}
            </p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
            <Icons.Car className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">ผู้ขอเบิกใช้งาน</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">
              {new Set(pendingList.map(item => item.userName || item.user?.name).filter(Boolean)).size}
            </p>
          </div>
          <div className="p-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200/60">
            <Icons.Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        
        {/* Controls Bar (Search / View mode with height h-9) */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">รายการขอใช้รถ</h2>
            <span className="text-xs font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-mono">
              {filteredList.length} รายการ
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
                placeholder="ค้นหาชื่อผู้ขอ, ทะเบียน, ปลายทาง..."
                className="h-9 w-48 sm:w-60 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal"
              />
            </div>

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

            {/* Reset Filter */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="h-9 px-2.5 text-xs font-normal text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                ล้างการค้นหา
              </button>
            )}
          </div>
        </div>

        {/* Content Body: Empty / Table / Cards */}
        {filteredList.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <Icons.Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">ไม่มีรายการรออนุมัติ</h3>
            <p className="text-xs font-normal text-slate-500 mt-0.5">
              {searchQuery 
                ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา' 
                : 'คุณได้จัดการคำขอเบิกใช้รถทั้งหมดเรียบร้อยแล้ว'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW: Compact & High Contrast */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ผู้ขอใช้งาน</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ยานพาหนะ / ทะเบียน</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">จุดหมายปลายทาง</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">วัตถุประสงค์</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">เวลายื่นขอ</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">สถานะ</th>
                  <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800 tracking-normal">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ผู้ขอใช้งาน */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {(item.userName || item.user?.name || '?')[0]}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900">
                            {item.userName || item.user?.name || 'ไม่ระบุชื่อ'}
                          </div>
                          <div className="text-[11px] font-normal text-slate-500">
                            {item.user?.position || 'พนักงาน'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ยานพาหนะ */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-900 font-mono">
                        {item.vehicleLicensePlate || item.vehicle?.licensePlate || '-'}
                      </div>
                      <div className="text-[11px] font-normal text-slate-600">
                        {item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : '-'}
                      </div>
                    </td>

                    {/* จุดหมายปลายทาง */}
                    <td className="px-3.5 py-2.5">
                      <div className="text-xs font-normal text-slate-800 truncate max-w-[180px]">
                        {item.destination || '-'}
                      </div>
                    </td>

                    {/* วัตถุประสงค์ */}
                    <td className="px-3.5 py-2.5">
                      <div className="text-xs font-normal text-slate-600 truncate max-w-[200px]" title={item.purpose}>
                        {item.purpose || '-'}
                      </div>
                    </td>

                    {/* เวลายื่นขอ */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-xs text-slate-700 font-normal">
                      {formatDate(item.createdAt || item.requestTime)}
                    </td>

                    {/* สถานะ */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-normal bg-amber-50 text-amber-900 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        รออนุมัติ
                      </span>
                    </td>

                    {/* การดำเนินการ */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAction(item.id, 'approve')}
                          disabled={processing === item.id}
                          className="h-7 px-2.5 text-xs font-normal text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                        >
                          {processing === item.id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Icons.Check className="w-3.5 h-3.5" />
                          )}
                          <span>อนุมัติ</span>
                        </button>

                        <button
                          onClick={() => openNoteModal(item)}
                          disabled={processing === item.id}
                          className="h-7 px-2 text-xs font-normal text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                        >
                          <Icons.XMark className="w-3.5 h-3.5" />
                          <span>ปฏิเสธ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARDS VIEW: Mini-Compact Grid */
          <div className="p-3.5 sm:p-4 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredList.map((item) => (
                <div key={item.id} className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {(item.userName || item.user?.name || '?')[0]}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900">
                            {item.userName || item.user?.name || 'ไม่ระบุชื่อ'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {item.user?.position || 'พนักงาน'}
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-normal bg-amber-50 text-amber-900 border border-amber-200">
                        รออนุมัติ
                      </span>
                    </div>

                    {/* Vehicle & Info */}
                    <div className="flex items-start gap-3 mb-2.5">
                      <div className="w-16 h-12 relative rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {getImageUrl(item.vehicle) ? (
                          <Image src={getImageUrl(item.vehicle)} alt="Vehicle" fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">ไม่มีรูป</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 font-mono">
                          {item.vehicleLicensePlate || item.vehicle?.licensePlate || '-'}
                        </div>
                        <div className="text-[11px] font-normal text-slate-600">
                          {item.vehicle?.brand} {item.vehicle?.model}
                        </div>
                        <div className="text-[10px] font-normal text-slate-500">
                          ยื่นขอ: {formatDate(item.createdAt || item.requestTime)}
                        </div>
                      </div>
                    </div>

                    {/* Route & Purpose */}
                    <div className="p-2 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700 font-normal mb-3 border border-slate-100">
                      <div className="flex items-start gap-1">
                        <span className="text-slate-500 text-[11px] shrink-0">ปลายทาง:</span>
                        <span className="text-slate-800 text-[11px] font-normal truncate">{item.destination || '-'}</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-slate-500 text-[11px] shrink-0">วัตถุประสงค์:</span>
                        <span className="text-slate-600 text-[11px] font-normal truncate">{item.purpose || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openNoteModal(item)}
                      disabled={processing === item.id}
                      className="h-8 px-2.5 text-xs font-normal text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition disabled:opacity-50 cursor-pointer"
                    >
                      ปฏิเสธ
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'approve')}
                      disabled={processing === item.id}
                      className="h-8 px-3 text-xs font-normal text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      {processing === item.id ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Icons.Check className="w-3.5 h-3.5" />
                      )}
                      <span>อนุมัติ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Reason Modal (Compact & High Contrast) */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-bold text-slate-900">ระบุเหตุผลการปฏิเสธคำขอ</h3>
              <button 
                onClick={() => { setShowNoteModal(false); setAdminNote(''); }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-xs font-normal text-slate-600">
                ข้อความนี้จะถูกส่งแจ้งเตือนไปยังผู้ขอใช้งาน เพื่อชี้แจงสาเหตุที่ไม่อนุมัติ
              </p>

              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="เช่น รถคันนี้มีคิวส่งซ่อมบำรุง, ข้อมูลเส้นทางไม่ชัดเจน..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 font-normal min-h-[100px] resize-none"
                autoFocus
              />
            </div>

            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/80 flex justify-end gap-2">
              <button
                onClick={() => { setShowNoteModal(false); setAdminNote(''); }}
                className="h-9 px-3.5 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleAction(selectedUsage.id, 'reject', adminNote)}
                disabled={processing === selectedUsage?.id}
                className="h-9 px-4 text-xs font-normal text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {processing === selectedUsage?.id && (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>ยืนยันปฏิเสธ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
