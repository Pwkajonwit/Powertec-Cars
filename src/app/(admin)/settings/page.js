"use client";

import { useState, useEffect, useMemo } from 'react';
import { checkAllIndexes } from '@/lib/indexChecker';
import AlertToast from '@/components/ui/AlertToast';

// --- Icons ---
const Icons = {
  Bell: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  Truck: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  ChartBar: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  ShieldCheck: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
  Plus: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  XMark: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  PaperAirplane: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  Database: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  ),
  Search: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
};

export default function SettingsPage() {
  const [notifSettings, setNotifSettings] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [newType, setNewType] = useState('');
  const [savingTypes, setSavingTypes] = useState(false);
  const [usageLimits, setUsageLimits] = useState({ storageMB: 512, firestoreDocs: 10000 });

  // State for testing report
  const [testingReport, setTestingReport] = useState(false);

  // Index Checker State
  const [checkingIndexes, setCheckingIndexes] = useState(false);
  const [indexResults, setIndexResults] = useState([]);
  const [showIndexModal, setShowIndexModal] = useState(false);

  // Usage Stats State
  const [usageStats, setUsageStats] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState('');

  // Vehicle Approval Setting
  const [approvalRequired, setApprovalRequired] = useState(false);

  // Alert State
  const [alertState, setAlertState] = useState({ show: false, message: '', type: 'success' });
  const showAlert = (message, type = 'success') => {
    setAlertState({ show: true, message, type });
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notifications/settings');
        const data = await res.json();

        setNotifSettings({
          ...(data.roles || {}),
          dailyReport: data.dailyReport || {},
          userChatMessage: data.userChatMessage || { vehicle_borrowed: true, vehicle_returned: true }
        });

        setVehicleTypes(data.vehicleTypes || ['รถ SUV', 'รถเก๋ง', 'รถกระบะ', 'รถตู้', 'รถบรรทุก', 'มอเตอร์ไซค์', 'อื่นๆ']);
        setUsageLimits(data.usageLimits || { storageMB: 512, firestoreDocs: 10000 });
        setApprovalRequired(data.approvalRequired || false);
      } catch (err) {
        console.error('load notif settings', err);
      }
    }
    load();
  }, []);

  const handleTestReport = async () => {
    if (!notifSettings?.dailyReport?.groupId) {
      showAlert('กรุณากรอก Group ID และบันทึกการตั้งค่าก่อนทำการทดสอบ', 'error');
      return;
    }

    if (!confirm('ระบบจะส่งรายงานสรุปไปยังกลุ่ม LINE ทันที คุณต้องการดำเนินการต่อหรือไม่?')) {
      return;
    }

    setTestingReport(true);
    try {
      const res = await fetch('/api/cron/daily-report');
      const data = await res.json();

      if (res.ok) {
        showAlert('ส่งรายงานทดสอบสำเร็จ! กรุณาตรวจสอบในกลุ่ม LINE', 'success');
      } else {
        showAlert(`การส่งล้มเหลว: ${data.error || 'ไม่ทราบสาเหตุ'}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
    } finally {
      setTestingReport(false);
    }
  };

  const saveSettings = async () => {
    setSavingTypes(true);
    try {
      const payload = {
        roles: {
          admin: notifSettings.admin,
          driver: notifSettings.driver,
          employee: notifSettings.employee
        },
        userChatMessage: notifSettings.userChatMessage,
        dailyReport: notifSettings.dailyReport,
        vehicleTypes,
        usageLimits,
        approvalRequired
      };

      await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      showAlert('บันทึกการตั้งค่าเรียบร้อย', 'success');
    } catch (err) {
      console.error(err);
      showAlert('ไม่สามารถบันทึกได้', 'error');
    } finally {
      setSavingTypes(false);
    }
  };

  // โหลดข้อมูลพื้นที่ใช้งาน
  const fetchUsageStats = async () => {
    setLoadingUsage(true);
    try {
      const res = await fetch('/api/usage');
      const data = await res.json();
      setUsageStats(data);
    } catch (err) {
      console.error('Error fetching usage:', err);
    } finally {
      setLoadingUsage(false);
    }
  };

  // Filter collections in usage stats
  const filteredCollections = useMemo(() => {
    if (!usageStats?.collections) return [];
    return Object.entries(usageStats.collections).filter(([name]) => 
      name.toLowerCase().includes(collectionFilter.toLowerCase().trim())
    );
  }, [usageStats, collectionFilter]);

  if (!notifSettings) {
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ตั้งค่าระบบ</h1>
          <p className="text-slate-600 text-xs mt-0.5 font-normal">
            จัดการระบบอนุมัติ การแจ้งเตือน LINE ประเภทรถ และการดูแลฐานข้อมูล
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={savingTypes}
          className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-normal shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          {savingTypes ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>กำลังบันทึก...</span>
            </>
          ) : (
            <>
              <Icons.Check className="w-3.5 h-3.5" />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: 2 Columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column (2 Cols): System Rules & Notifications */}
        <div className="lg:col-span-2 space-y-4">

          {/* Vehicle Approval Policy */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-amber-50 text-amber-800 rounded border border-amber-200">
                  <Icons.ShieldCheck className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-semibold text-slate-900">นโยบายการอนุมัติใช้รถ</h2>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal border ${
                approvalRequired 
                  ? 'bg-amber-50 text-amber-900 border-amber-200' 
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}>
                {approvalRequired ? 'ต้องอนุมัติก่อนใช้' : 'เริ่มใช้ได้ทันที'}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-lg border border-amber-200/70">
                <div className="pr-3">
                  <div className="text-xs font-semibold text-slate-900">เปิดใช้งานระบบอนุมัติคำขอเบิกใช้รถ</div>
                  <div className="text-[11px] text-slate-700 mt-0.5 font-normal">
                    เมื่อเปิด ผู้ใช้ต้องรอผู้ดูแลระบบอนุมัติในหน้า "รอการอนุมัติ" ก่อนจึงจะเริ่มใช้งานรถได้
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={approvalRequired}
                    onChange={e => setApprovalRequired(e.target.checked)}
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {approvalRequired ? (
                <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-blue-900 font-normal flex items-start gap-2">
                  <span className="shrink-0 text-blue-700">ℹ️</span>
                  <span>ระบบเปิดใช้งานการอนุมัติ: ผู้ดูแลระบบสามารถตรวจสอบและอนุมัติที่เมนู <strong>รอการอนุมัติ</strong></span>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-normal flex items-start gap-2">
                  <span className="shrink-0 text-slate-500">⚡</span>
                  <span>ระบบอนุมัติอัตโนมัติ: ผู้ใช้สามารถเริ่มการเดินทางได้ทันทีหลังจากยื่นข้อมูล</span>
                </div>
              )}
            </div>
          </div>

          {/* LINE Chat Notifications (User direct message) */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                  <Icons.Bell className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-semibold text-slate-900">การแจ้งเตือนผู้ใช้ทาง LINE Chat</h2>
              </div>
              <span className="text-[11px] font-normal text-slate-600">Flex Message</span>
            </div>

            <div className="p-3.5 sm:p-4 space-y-3">
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-800 font-normal flex items-start gap-2">
                <span className="shrink-0 text-emerald-700 font-bold">✓</span>
                <span>เมื่อผู้ใช้ยืมหรือคืนรถ ระบบจะส่งการ์ดสรุปรายละเอียดไปยังห้องแชท LINE ส่วนตัวของผู้ใช้</span>
              </div>

              <div className="bg-white rounded-lg border border-slate-200/80 divide-y divide-slate-100">
                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">แจ้งเตือนเมื่อเริ่มใช้รถ (ยืมรถสำเร็จ)</div>
                    <div className="text-[11px] text-slate-600 font-normal">ส่งสรุปข้อมูลรถ เลขไมล์เริ่มต้น และเวลาที่เริ่มใช้งาน</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!notifSettings.userChatMessage?.vehicle_borrowed}
                      onChange={e => setNotifSettings(s => ({
                        ...s,
                        userChatMessage: { ...s.userChatMessage, vehicle_borrowed: e.target.checked }
                      }))}
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">แจ้งเตือนเมื่อบันทึกคืนรถ (คืนรถสำเร็จ)</div>
                    <div className="text-[11px] text-slate-600 font-normal">ส่งสรุปเลขไมล์สิ้นสุด ระยะทางรวม และค่าใช้จ่ายน้ำมัน</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!notifSettings.userChatMessage?.vehicle_returned}
                      onChange={e => setNotifSettings(s => ({
                        ...s,
                        userChatMessage: { ...s.userChatMessage, vehicle_returned: e.target.checked }
                      }))}
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Report Automation */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-purple-50 text-purple-800 rounded border border-purple-200">
                  <Icons.ChartBar className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-semibold text-slate-900">รายงานสรุปประจำวัน (Daily Report)</h2>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal border ${
                notifSettings.dailyReport?.enabled 
                  ? 'bg-purple-50 text-purple-900 border-purple-200' 
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}>
                {notifSettings.dailyReport?.enabled ? 'เปิดส่ง 10:00 น.' : 'ปิดรายงาน'}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-50/60 rounded-lg border border-purple-200/70">
                <div>
                  <div className="text-xs font-semibold text-slate-900">ส่งรายงานสรุปสถานะรถเข้ากลุ่ม LINE อัตโนมัติ</div>
                  <div className="text-[11px] text-slate-700 mt-0.5 font-normal">ระบบจะส่งสรุปรถที่ถูกยืม รถว่าง และคิวซ่อมบำรุงทุกวัน เวลา 10:00 น.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!notifSettings.dailyReport?.enabled}
                    onChange={e => setNotifSettings(s => ({
                      ...s,
                      dailyReport: { ...s.dailyReport, enabled: e.target.checked }
                    }))}
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  LINE Group ID สำหรับรับรายงาน
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="เช่น Cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="h-9 flex-1 px-3 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono"
                    value={notifSettings.dailyReport?.groupId || ''}
                    onChange={e => setNotifSettings(s => ({
                      ...s,
                      dailyReport: { ...s.dailyReport, groupId: e.target.value }
                    }))}
                  />
                  <button
                    onClick={handleTestReport}
                    disabled={testingReport || !notifSettings.dailyReport?.groupId}
                    className="h-9 px-3 text-xs font-normal text-white bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    {testingReport ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Icons.PaperAirplane className="w-3.5 h-3.5" />
                    )}
                    <span>ทดสอบส่ง</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-normal">
                  * ต้องเชิญ LINE OA เข้ากลุ่มก่อน และกด "บันทึกการเปลี่ยนแปลง" หลังจากแก้ไข Group ID
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Vehicle Types & System Tools */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Vehicle Types Catalog */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-teal-50 text-teal-800 rounded border border-teal-200">
                  <Icons.Truck className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-semibold text-slate-900">ประเภทรถยนต์</h2>
              </div>
              <span className="text-xs font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-mono">
                {vehicleTypes.length} ประเภท
              </span>
            </div>

            <div className="p-3.5 sm:p-4 space-y-3">
              {/* Type Tags */}
              <div className="flex flex-wrap gap-1.5 min-h-[50px] p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                {vehicleTypes.map((type, idx) => (
                  <div 
                    key={idx} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 border border-teal-200/80 rounded-md text-xs text-teal-900 font-normal"
                  >
                    <span>{type}</span>
                    {vehicleTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setVehicleTypes(vehicleTypes.filter((_, i) => i !== idx))}
                        className="text-teal-600 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                        title="ลบประเภทนี้"
                      >
                        <Icons.XMark className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Type (Height h-9) */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newType.trim()) {
                      e.preventDefault();
                      if (!vehicleTypes.includes(newType.trim())) {
                        setVehicleTypes([...vehicleTypes, newType.trim()]);
                        setNewType('');
                      }
                    }
                  }}
                  placeholder="พิมพ์ประเภทรถใหม่..."
                  className="h-9 flex-1 px-3 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-normal"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newType.trim() && !vehicleTypes.includes(newType.trim())) {
                      setVehicleTypes([...vehicleTypes, newType.trim()]);
                      setNewType('');
                    }
                  }}
                  className="h-9 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer shadow-xs shrink-0"
                  title="เพิ่มประเภทรถ"
                >
                  <Icons.Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Firestore Maintenance & Indexes */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-orange-50 text-orange-800 rounded border border-orange-200">
                  <Icons.Database className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-semibold text-slate-900">Firestore Indexes</h2>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 space-y-3">
              <p className="text-xs text-slate-600 font-normal">
                ตรวจสอบและสร้าง Composite Indexes ที่จำเป็นสำหรับระบบ รองรับการค้นหาและจัดเรียงข้อมูล
              </p>
              <button
                onClick={async () => {
                  setCheckingIndexes(true);
                  try {
                    const results = await checkAllIndexes();
                    setIndexResults(results);
                    setShowIndexModal(true);
                  } catch (error) {
                    console.error("Error checking indexes:", error);
                    showAlert("เกิดข้อผิดพลาดในการตรวจสอบ Indexes", 'error');
                  } finally {
                    setCheckingIndexes(false);
                  }
                }}
                disabled={checkingIndexes}
                className="h-9 w-full bg-orange-700 hover:bg-orange-800 text-white text-xs font-normal rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {checkingIndexes ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังตรวจสอบ...</span>
                  </>
                ) : (
                  <>
                    <Icons.Database className="w-3.5 h-3.5" />
                    <span>ตรวจสอบ Firestore Indexes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Firestore Storage & Quota Stats */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-blue-50 text-blue-800 rounded border border-blue-200">
                  <Icons.ChartBar className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-semibold text-slate-900">พื้นที่ใช้งาน Firestore</h2>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 space-y-3">
              <p className="text-xs text-slate-600 font-normal">
                ตรวจสอบจำนวนเอกสาร ขนาดข้อมูล และสัดส่วนการใช้โควตาฐานข้อมูล
              </p>

              <button
                onClick={fetchUsageStats}
                disabled={loadingUsage}
                className="h-9 w-full bg-blue-700 hover:bg-blue-800 text-white text-xs font-normal rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loadingUsage ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังคำนวณพื้นที่...</span>
                  </>
                ) : (
                  <>
                    <Icons.ChartBar className="w-3.5 h-3.5" />
                    <span>ตรวจสอบพื้นที่ใช้งาน</span>
                  </>
                )}
              </button>

              {usageStats && (
                <div className="space-y-3 pt-1">
                  {/* Summary Counters */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-2.5 text-center">
                      <div className="text-xl font-bold text-blue-900 font-mono">
                        {usageStats.totalDocuments?.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-blue-800 font-normal mt-0.5">เอกสารทั้งหมด</div>
                    </div>
                    <div className="bg-purple-50/60 border border-purple-200/80 rounded-lg p-2.5 text-center">
                      <div className="text-xl font-bold text-purple-900 font-mono">
                        {usageStats.totalSizeKB > 1024
                          ? `${(usageStats.totalSizeKB / 1024).toFixed(1)} MB`
                          : `${usageStats.totalSizeKB} KB`}
                      </div>
                      <div className="text-[11px] text-purple-800 font-normal mt-0.5">ขนาดข้อมูล</div>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  {usageStats.limits && (
                    <div className="space-y-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-700 font-normal">พื้นที่เก็บข้อมูล</span>
                          <span className={`font-semibold font-mono ${parseFloat(usageStats.limits.storageUsedPercent) > 80 ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {usageStats.limits.storageUsedPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all ${parseFloat(usageStats.limits.storageUsedPercent) > 80 ? 'bg-rose-500' : 'bg-emerald-600'}`}
                            style={{ width: `${Math.min(parseFloat(usageStats.limits.storageUsedPercent), 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-700 font-normal">จำนวนเอกสาร</span>
                          <span className={`font-semibold font-mono ${parseFloat(usageStats.limits.documentUsedPercent) > 80 ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {usageStats.limits.documentUsedPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all ${parseFloat(usageStats.limits.documentUsedPercent) > 80 ? 'bg-rose-500' : 'bg-emerald-600'}`}
                            style={{ width: `${Math.min(parseFloat(usageStats.limits.documentUsedPercent), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Collection Breakdown (Compact List with Filter) */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">แยกตาม Collection</span>
                      <span className="text-[10px] font-normal text-slate-500 font-mono">
                        {filteredCollections.length} ตาราง
                      </span>
                    </div>

                    {/* Mini Search Filter h-8 */}
                    <div className="p-1.5 bg-white border-b border-slate-100">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-slate-400">
                          <Icons.Search className="w-3 h-3" />
                        </span>
                        <input
                          type="text"
                          value={collectionFilter}
                          onChange={(e) => setCollectionFilter(e.target.value)}
                          placeholder="กรอง collection..."
                          className="w-full h-7 pl-6 pr-2 text-[11px] text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-normal"
                        />
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredCollections.map(([name, data]) => (
                        <div key={name} className="px-3 py-1.5 flex items-center justify-between text-xs hover:bg-slate-50">
                          <span className="font-semibold text-slate-800 text-[11px]">{name}</span>
                          <div className="text-right text-[11px] font-mono">
                            <span className="text-slate-700">{data.documents} docs</span>
                            <span className="text-slate-500 ml-1.5">{data.estimatedSizeKB} KB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Index Check Results Modal (Compact & High Contrast) */}
      {showIndexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-bold text-slate-900">ผลการตรวจสอบ Firestore Indexes</h3>
              <button
                onClick={() => setShowIndexModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
              >
                <Icons.XMark className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {indexResults.filter(r => r.status === "missing").length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Icons.Check className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Composite Indexes พร้อมใช้งานครบถ้วน</h4>
                  <p className="text-xs font-normal text-slate-600 mt-0.5">ไม่พบ Index ที่ต้องสร้างเพิ่มเติมใน Firebase Console</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                    <p className="font-semibold text-amber-900">
                      ⚠️ พบ {indexResults.filter(r => r.status === "missing").length} รายการที่ยังไม่ได้สร้าง Index
                    </p>
                    <p className="text-amber-800 font-normal mt-0.5">
                      คลิกปุ่มสร้าง Index เพื่อเปิดหน้า Firebase Console โดยอัตโนมัติ
                    </p>
                  </div>

                  {indexResults.filter(r => r.status === "missing").map((result, index) => (
                    <div key={index} className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-lg flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{result.queryName}</p>
                        <p className="text-[11px] font-normal text-slate-600">Collection: {result.collection}</p>
                      </div>
                      {result.indexUrl ? (
                        <a
                          href={result.indexUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 px-2.5 bg-orange-700 hover:bg-orange-800 text-white rounded text-xs font-normal transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                        >
                          <span>สร้าง Index</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-normal">ไม่มี URL</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* All Checked Indexes List */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-800 mb-2">รายการ Indexes ทั้งหมด:</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {indexResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200/70 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{result.queryName}</span>
                        <span className="text-slate-500 text-[11px] ml-1.5">({result.collection})</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-normal border ${
                        result.status === "ok"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : result.status === "missing"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {result.status === "ok" ? "✓ พร้อม" : result.status === "missing" ? "✕ ขาด Index" : "?"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/80 flex justify-end">
              <button
                onClick={() => setShowIndexModal(false)}
                className="h-8 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-normal cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
