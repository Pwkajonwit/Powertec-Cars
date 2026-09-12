"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// Icons
const Icons = {
  Bell: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75v-.7V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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
  PaperAirplane: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  ),
  Cog: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
};

// Defined notification events in the system
const SYSTEM_EVENTS = [
  {
    id: 'booking_created',
    name: 'สร้างคำขอจองรถใหม่',
    description: 'ส่งแจ้งเตือนเมื่อมีผู้ใช้ทำการส่งคำขอจองรถเข้าสู่ระบบ',
    format: 'LINE Flex Message',
    targetRoles: ['admin', 'driver', 'employee'],
    defaultActive: true
  },
  {
    id: 'admin_approval_request',
    name: 'คำขอรออนุมัติสำหรับผู้ดูแลระบบ',
    description: 'แจ้งเตือนเฉพาะกลุ่ม Admin เพื่อพิจารณาอนุมัติคำขอจองหรือการใช้งานรถ',
    format: 'LINE Flex Message',
    targetRoles: ['admin'],
    defaultActive: true
  },
  {
    id: 'booking_approved',
    name: 'คำขอจองได้รับการอนุมัติ',
    description: 'แจ้งเตือนคนขับและผู้ขอเมื่อ Admin กดอนุมัติและมอบหมายรถเรียบร้อย',
    format: 'LINE Flex Message',
    targetRoles: ['admin', 'driver', 'employee'],
    defaultActive: true
  },
  {
    id: 'booking_rejected',
    name: 'คำขอจองถูกปฏิเสธ',
    description: 'แจ้งเตือนผู้ขอเมื่อคำขอจองไม่ผ่านการอนุมัติพร้อมเหตุผล',
    format: 'LINE Flex Message',
    targetRoles: ['admin', 'employee'],
    defaultActive: true
  },
  {
    id: 'vehicle_sent',
    name: 'ส่งมอบรถ / เริ่มต้นเดินทาง',
    description: 'แจ้งเตือนเมื่อคนขับหรือผู้ใช้เริ่มออกเดินทางพร้อมบันทึกเลขไมล์เริ่มต้น',
    format: 'LINE Flex Message',
    targetRoles: ['admin', 'driver', 'employee'],
    defaultActive: true
  },
  {
    id: 'vehicle_returned',
    name: 'ส่งคืนรถยนต์เข้าสู่ระบบ',
    description: 'แจ้งเตือนเมื่อมีการส่งคืนรถยนต์ บันทึกเลขไมล์สิ้นสุด และสรุปค่าใช้จ่าย',
    format: 'LINE Flex Message',
    targetRoles: ['admin', 'driver', 'employee'],
    defaultActive: true
  },
  {
    id: 'daily_report',
    name: 'รายงานสรุปประจำวัน (LINE Group)',
    description: 'ส่งข้อความสรุปสถานะรถ การใช้งาน และงานซ่อมบำรุงเข้ากลุ่ม LINE ทุกวันอัตโนมัติ',
    format: 'LINE Flex Message',
    targetRoles: ['admin'],
    defaultActive: true
  }
];

export default function NotificationsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/notifications/settings');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load notification settings', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    return SYSTEM_EVENTS.filter(ev => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || ev.name.toLowerCase().includes(q) || ev.id.toLowerCase().includes(q) || ev.description.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (roleFilter !== 'all') {
        return ev.targetRoles.includes(roleFilter);
      }
      return true;
    });
  }, [searchQuery, roleFilter]);

  const activeCount = SYSTEM_EVENTS.length;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      
      {/* Header & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ศูนย์การแจ้งเตือน (Notifications)</h1>
          <p className="text-slate-600 text-xs mt-0.5 font-normal">
            ภาพรวมการทำงานของระบบแจ้งเตือนอัตโนมัติผ่าน LINE Messaging API และประวัติเหตุการณ์
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications/test"
            className="h-9 px-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-normal flex items-center gap-1.5 shadow-xs transition"
          >
            <Icons.PaperAirplane className="w-3.5 h-3.5 text-emerald-600" />
            <span>ทดสอบส่ง Flex</span>
          </Link>
          <Link
            href="/settings"
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition"
          >
            <Icons.Cog className="w-3.5 h-3.5" />
            <span>ตั้งค่าการแจ้งเตือน</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards (Mini-Compact 3-grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">เหตุการณ์ในระบบ</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">{activeCount}</p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
            <Icons.Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">สถานะ LINE Push API</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5 font-mono">ONLINE</p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60">
            <Icons.CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">บทบาทที่รองรับ</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">3 กลุ่ม</p>
          </div>
          <div className="p-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200/60">
            <Icons.Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        
        {/* Controls Bar (Search / Filter with height h-9) */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">รายการแจ้งเตือนที่รองรับ</h2>
            <span className="text-xs font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-mono">
              {filteredEvents.length} เหตุการณ์
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
                placeholder="ค้นหาชื่อเหตุการณ์, รหัส..."
                className="h-9 w-48 sm:w-60 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal"
              />
            </div>

            {/* Filter Dropdown h-9 */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
            >
              <option value="all">ทุกกลุ่มผู้รับ</option>
              <option value="admin">ผู้ดูแลระบบ (Admin)</option>
              <option value="driver">คนขับ (Driver)</option>
              <option value="employee">พนักงาน (Employee)</option>
            </select>

            {/* Reset Filters */}
            {(searchQuery || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                }}
                className="h-9 px-2.5 text-xs font-normal text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Table View (Compact & High Contrast) */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">รหัสเหตุการณ์ (Event ID)</th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ชื่อเหตุการณ์</th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">รูปแบบข้อความ</th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">กลุ่มผู้รับ</th>
                <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">รายละเอียดเงื่อนไข</th>
                <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800 tracking-normal">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Event ID */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {ev.id}
                    </span>
                  </td>

                  {/* ชื่อเหตุการณ์ */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <span className="text-xs font-semibold text-slate-900">
                      {ev.name}
                    </span>
                  </td>

                  {/* รูปแบบข้อความ */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-normal bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {ev.format}
                    </span>
                  </td>

                  {/* กลุ่มผู้รับ */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {ev.targetRoles.map(role => (
                        <span 
                          key={role}
                          className={`px-1.5 py-0.2 rounded text-[10px] font-normal border ${
                            role === 'admin' 
                              ? 'bg-amber-50 text-amber-900 border-amber-200' 
                              : role === 'driver'
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* รายละเอียด */}
                  <td className="px-3.5 py-2.5 text-xs text-slate-600 font-normal max-w-sm">
                    {ev.description}
                  </td>

                  {/* การดำเนินการ */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap text-right">
                    <Link
                      href={`/notifications/test?event=${ev.id}`}
                      className="h-7 px-2.5 text-xs font-normal text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition inline-flex items-center gap-1"
                    >
                      <Icons.PaperAirplane className="w-3 h-3" />
                      <span>ทดสอบส่ง</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
