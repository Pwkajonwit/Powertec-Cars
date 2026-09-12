"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import AlertToast from '@/components/ui/AlertToast';

// Icons
const Icons = {
  Users: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Shield: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
  SteeringWheel: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  UserCheck: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Search: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  Plus: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Table: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  Grid: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V15.75ZM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25Z" />
    </svg>
  ),
  Trash: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Pencil: ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
  )
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State (Height h-9 Controls)
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Delete Modal State
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Alert State
  const [alertState, setAlertState] = useState({ show: false, message: '', type: 'success' });
  const showAlert = (message, type = 'success') => {
    setAlertState({ show: true, message, type });
  };

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const confirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "users", deletingUser.id));
      showAlert("ลบผู้ใช้งานสำเร็จ", 'success');
      setDeletingUser(null);
    } catch (err) {
      console.error(err);
      showAlert("เกิดข้อผิดพลาดในการลบผู้ใช้", 'error');
    }
    setIsDeleting(false);
  };

  // Helper for role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-amber-50 text-amber-900 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            ผู้ดูแลระบบ
          </span>
        );
      case 'driver':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-blue-50 text-blue-900 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            พนักงานขับ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-slate-100 text-slate-800 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            พนักงานทั่วไป
          </span>
        );
    }
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (roleFilter && user.role !== roleFilter) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const phone = (user.phone || '').toLowerCase();
        const position = (user.position || '').toLowerCase();
        const lineId = (user.lineId || '').toLowerCase();

        return name.includes(q) || email.includes(q) || phone.includes(q) || position.includes(q) || lineId.includes(q);
      }

      return true;
    });
  }, [users, roleFilter, searchQuery]);

  // Summary counts
  const adminCount = useMemo(() => users.filter(u => u.role === 'admin').length, [users]);
  const driverCount = useMemo(() => users.filter(u => u.role === 'driver').length, [users]);
  const employeeCount = useMemo(() => users.filter(u => u.role !== 'admin' && u.role !== 'driver').length, [users]);

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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ผู้ใช้งานในระบบ</h1>
          <p className="text-slate-600 text-xs mt-0.5 font-normal">
            จัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และข้อมูลการติดต่อของเจ้าหน้าที่
          </p>
        </div>
        <Link
          href="/users/add"
          className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-normal shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Icons.Plus className="w-3.5 h-3.5" />
          <span>เพิ่มผู้ใช้ใหม่</span>
        </Link>
      </div>

      {/* Summary Stats (Mini-Compact 4-grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">ผู้ใช้ทั้งหมด</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5 font-mono">{users.length}</p>
          </div>
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
            <Icons.Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">ผู้ดูแลระบบ</p>
            <p className="text-xl font-bold text-amber-900 mt-0.5 font-mono">{adminCount}</p>
          </div>
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200/60">
            <Icons.Shield className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">พนักงานขับ</p>
            <p className="text-xl font-bold text-blue-900 mt-0.5 font-mono">{driverCount}</p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
            <Icons.SteeringWheel className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-normal text-slate-600">พนักงานทั่วไป</p>
            <p className="text-xl font-bold text-emerald-900 mt-0.5 font-mono">{employeeCount}</p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60">
            <Icons.UserCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        
        {/* Controls Bar (Search, Role Filter, View Mode Toggle: Height h-9) */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">รายชื่อผู้ใช้งาน</h2>
            <span className="text-xs font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-mono">
              {filteredUsers.length} คน
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
                placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..."
                className="h-9 w-48 sm:w-60 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal"
              />
            </div>

            {/* Role Filter h-9 */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
            >
              <option value="">ทุกบทบาท</option>
              <option value="admin">ผู้ดูแลระบบ</option>
              <option value="driver">พนักงานขับ</option>
              <option value="employee">พนักงานทั่วไป</option>
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
            {(searchQuery || roleFilter) && (
              <button
                onClick={() => { setSearchQuery(''); setRoleFilter(''); }}
                className="h-9 px-2.5 text-xs font-normal text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Content: Empty / Table / Cards */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <Icons.Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">ไม่พบผู้ใช้งาน</h3>
            <p className="text-xs font-normal text-slate-500 mt-0.5">
              {searchQuery || roleFilter 
                ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา' 
                : 'ยังไม่มีข้อมูลผู้ใช้งานในระบบ'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ผู้ใช้งาน</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">บทบาท</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ตำแหน่ง</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">เบอร์โทรศัพท์</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">LINE ID</th>
                  <th className="px-3.5 py-2 text-right text-xs font-semibold text-slate-800 tracking-normal">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Avatar & Name */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 relative overflow-hidden shrink-0 border border-slate-200">
                          {user.imageUrl ? (
                            <Image
                              src={user.imageUrl}
                              alt={user.name || 'User'}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                              {(user.name || user.email || 'U')[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900">
                            {user.name || 'ไม่ระบุชื่อ'}
                          </div>
                          <div className="text-[11px] font-normal text-slate-500">
                            {user.email || '-'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Position */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-xs text-slate-700 font-normal">
                      {user.position || '-'}
                    </td>

                    {/* Phone */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-xs text-slate-800 font-mono font-normal">
                      {user.phone || '-'}
                    </td>

                    {/* Line ID */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-xs text-slate-600 font-mono font-normal">
                      {user.lineId ? (
                        <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px]">
                          {user.lineId}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/users/${user.id}/edit`}
                          className="h-7 px-2.5 text-xs font-normal text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Icons.Pencil className="w-3 h-3" />
                          <span>แก้ไข</span>
                        </Link>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="h-7 px-2 text-xs font-normal text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Icons.Trash className="w-3 h-3" />
                          <span className="hidden sm:inline">ลบ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="p-3.5 sm:p-4 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredUsers.map(user => (
                <div key={user.id} className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-slate-100 relative overflow-hidden shrink-0 border border-slate-200">
                          {user.imageUrl ? (
                            <Image
                              src={user.imageUrl}
                              alt={user.name || 'User'}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                              {(user.name || user.email || 'U')[0]}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {user.name || 'ไม่ระบุชื่อ'}
                          </div>
                          <div className="text-[10px] font-normal text-slate-500 truncate">
                            {user.email || '-'}
                          </div>
                        </div>
                      </div>
                      {getRoleBadge(user.role)}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1 text-xs text-slate-700 font-normal mb-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-slate-500">ตำแหน่ง:</span>
                        <span className="text-[11px] text-slate-800">{user.position || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-slate-500">เบอร์โทร:</span>
                        <span className="text-[11px] text-slate-800 font-mono">{user.phone || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-slate-500">LINE ID:</span>
                        <span className="text-[11px] text-slate-700 font-mono">{user.lineId || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setDeletingUser(user)}
                      className="h-8 px-2.5 text-xs font-normal text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                    >
                      ลบ
                    </button>
                    <Link
                      href={`/users/${user.id}/edit`}
                      className="h-8 px-3 text-xs font-normal text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Icons.Pencil className="w-3.5 h-3.5" />
                      <span>แก้ไข</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (Compact & High Contrast) */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-xl shadow-xl p-4 max-w-sm w-full border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">ยืนยันการลบผู้ใช้งาน</h3>
            <p className="text-xs text-slate-600 font-normal mt-1.5">
              คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ <strong className="text-slate-900 font-semibold">{deletingUser.name || deletingUser.email}</strong> ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => setDeletingUser(null)} 
                disabled={isDeleting} 
                className="h-8 px-3 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={isDeleting} 
                className="h-8 px-3 text-xs font-normal text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}