"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

// --- Icons ---
const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  ),
  Car: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  TruckInUse: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  AlertClock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  Wrench: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.07-3.05.856l-7.22 7.22a2.25 2.25 0 0 1-3.182-3.182l7.22-7.22c.786-.786.947-1.974.856-3.05A4.5 4.5 0 0 1 18.75 2.25c.345 0 .684.039 1.011.113a.75.75 0 0 1 .576.883l-.707 2.828a.75.75 0 0 0 .93.93l2.828-.707a.75.75 0 0 1 .883.576c.074.327.113.666.113 1.011Z" />
    </svg>
  ),
  TripHistory: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.281a1.875 1.875 0 0 0-1.683 0l-4.947 2.474c-.381.19-.623.579-.623 1.006v12.443c0 .837.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    </svg>
  ),
  Analytics: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  UserGroup: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  ChevronDown: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  )
};

export default function AdminSidebar({ isOpen = false, onClose = () => { } }) {
  const router = useRouter();
  const pathname = usePathname();
  const { userProfile, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  // Check if current route belongs to vehicle submenus (excluding /vehicles-analysis)
  const isVehiclePath = 
    ((pathname === '/vehicles' || pathname?.startsWith('/vehicles/')) && !pathname?.startsWith('/vehicles-analysis')) 
    || pathname === '/pending';
  const [openVehicles, setOpenVehicles] = useState(isVehiclePath);

  // Sync vehicle submenu expansion with current route
  useEffect(() => {
    setOpenVehicles(isVehiclePath);
  }, [pathname, isVehiclePath]);

  const handleLogout = async () => {
    if (confirm("คุณต้องการออกจากระบบหรือไม่?")) {
      setLoggingOut(true);
      try {
        await logout();
        router.push("/");
      } catch (err) {
        console.error("Logout failed", err);
      } finally {
        setLoggingOut(false);
      }
    }
  };

  if (!userProfile) return null;
  const role = userProfile.role;
  if (role !== 'admin' && role !== 'employee') return null;

  const NavContent = ({ mobile = false }) => {
    const handleItemClick = () => {
      if (mobile) onClose();
    };

    return (
      <div className="flex flex-col h-full select-none">
        {/* Brand Header */}
        <div className="pb-4 pt-1 px-2 border-b border-emerald-500/20 mb-4 shrink-0">
          <Link 
            href="/dashboard" 
            onClick={handleItemClick}
            className="block group px-1 transition-opacity duration-200 hover:opacity-90"
          >
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-xl text-white font-mono">POWERTEC</span>
              <span className="text-[11px] text-teal-200/70 tracking-tight mt-0.5">Fleet Management</span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu List - 2 MAIN CATEGORIES */}
        <nav className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-6 custom-scrollbar">
          
          {/* หมวดหลักที่ 1: งานยานพาหนะ (FLEET OPERATIONS) */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-emerald-300/70 uppercase flex items-center justify-between">
              <span>งานยานพาหนะ</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">FLEET</span>
            </div>

            <ul className="space-y-1">
              {/* ภาพรวมระบบ */}
              <li>
                <Link
                  href="/dashboard"
                  onClick={handleItemClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    pathname === '/dashboard'
                      ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/10 text-emerald-300 border-l-[3px] border-emerald-400 shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icons.Dashboard />
                  <span>ภาพรวมระบบ</span>
                </Link>
              </li>

              {/* จัดการรถ (พร้อมเมนูย่อย) */}
              <li>
                <div className="flex items-center justify-between rounded-xl transition-all duration-200">
                  <Link
                    href="/vehicles"
                    onClick={handleItemClick}
                    className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pathname === '/vehicles'
                        ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/10 text-emerald-300 border-l-[3px] border-emerald-400 shadow-sm font-semibold'
                        : isVehiclePath
                        ? 'text-emerald-200 font-medium'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icons.Car />
                    <span>จัดการรถยนต์</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setOpenVehicles(!openVehicles)}
                    title={openVehicles ? "ย่อเมนู" : "ขยายเมนู"}
                    className="p-2 text-emerald-300/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Icons.ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openVehicles ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* เมนูย่อยของจัดการรถ */}
                {openVehicles && (
                  <div className="pl-3 pr-1 mt-1 space-y-1 border-l-2 border-emerald-500/25 ml-5 py-1">
                    <Link
                      href="/vehicles/in-use"
                      onClick={handleItemClick}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        pathname === '/vehicles/in-use'
                          ? 'bg-emerald-400/20 text-white font-semibold shadow-xs'
                          : 'text-slate-300/90 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icons.TruckInUse />
                        <span>รถกำลังใช้งาน</span>
                      </div>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                      </span>
                    </Link>

                    <Link
                      href="/pending"
                      onClick={handleItemClick}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        pathname === '/pending'
                          ? 'bg-emerald-400/20 text-white font-semibold shadow-xs'
                          : 'text-slate-300/90 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icons.Clock />
                        <span>รอการอนุมัติ</span>
                      </div>
                    </Link>

                    <Link
                      href="/vehicles/orphaned"
                      onClick={handleItemClick}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        pathname === '/vehicles/orphaned'
                          ? 'bg-emerald-400/20 text-white font-semibold shadow-xs'
                          : 'text-slate-300/90 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icons.AlertClock />
                        <span>ตรวจสอบการลืมคืน</span>
                      </div>
                    </Link>
                  </div>
                )}
              </li>

              {/* ส่งซ่อมบำรุง */}
              <li>
                <Link
                  href="/maintenance"
                  onClick={handleItemClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    pathname === '/maintenance'
                      ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/10 text-emerald-300 border-l-[3px] border-emerald-400 shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icons.Wrench />
                  <span>ส่งซ่อมบำรุง</span>
                </Link>
              </li>

              {/* ประวัติการใช้รถ */}
              <li>
                <Link
                  href="/trip-history"
                  onClick={handleItemClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    pathname === '/trip-history'
                      ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/10 text-emerald-300 border-l-[3px] border-emerald-400 shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icons.TripHistory />
                  <span>ประวัติการใช้รถ</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* หมวดหลักที่ 2: ระบบและรายงาน (SYSTEM & REPORTS) */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-emerald-300/70 uppercase flex items-center justify-between">
              <span>ระบบและรายงาน</span>
              <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono">ADMIN</span>
            </div>

            <ul className="space-y-1">
              {/* วิเคราะห์การใช้งานรถ */}
              <li>
                <Link
                  href="/vehicles-analysis"
                  onClick={handleItemClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    pathname === '/vehicles-analysis'
                      ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/10 text-emerald-300 border-l-[3px] border-emerald-400 shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icons.Analytics />
                  <span>วิเคราะห์การใช้งานรถ</span>
                </Link>
              </li>

              {/* จัดการผู้ใช้งาน */}
              <li>
                <Link
                  href="/users"
                  onClick={handleItemClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    pathname === '/users'
                      ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/10 text-emerald-300 border-l-[3px] border-emerald-400 shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icons.UserGroup />
                  <span>จัดการผู้ใช้งาน</span>
                </Link>
              </li>

              {/* การตั้งค่าระบบ */}
              <li>
                <Link
                  href="/settings"
                  onClick={handleItemClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    pathname === '/settings'
                      ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/10 text-emerald-300 border-l-[3px] border-emerald-400 shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icons.Settings />
                  <span>การตั้งค่าระบบ</span>
                </Link>
              </li>
            </ul>
          </div>

        </nav>

        {/* User Profile Card & Footer Actions */}
        <div className="pt-3 border-t border-emerald-500/20 mt-3 shrink-0">
          <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {userProfile?.imageUrl ? (
                <Image
                  src={userProfile.imageUrl}
                  alt="avatar"
                  width={36}
                  height={36}
                  className="rounded-full object-cover shrink-0 ring-2 ring-emerald-500/40"
                  unoptimized
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {userProfile?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-semibold text-white truncate">
                  {userProfile?.name || 'ไม่ระบุชื่อ'}
                </span>
                <span className="text-[10px] text-emerald-300/80 uppercase font-mono tracking-wider">
                  {role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'พนักงาน (Staff)'}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="ออกจากระบบ"
              className="p-2 text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors shrink-0 cursor-pointer"
              aria-label="Logout"
            >
              <Icons.Logout />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const desktop = (
    <aside className="hidden md:flex w-64 lg:w-68 p-4 text-white bg-gradient-to-b from-[#074e44] via-[#053730] to-[#021f1b] shrink-0 flex-col justify-between h-screen sticky top-0 overflow-hidden shadow-xl border-r border-emerald-900/30">
      <NavContent />
    </aside>
  );

  const mobile = (
    <div className={`fixed inset-0 z-50 md:hidden ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside className={`fixed left-0 top-0 w-72 h-[100dvh] p-4 bg-gradient-to-b from-[#074e44] via-[#053730] to-[#021f1b] text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl flex flex-col border-r border-emerald-800/40`}>
        <NavContent mobile={true} />
      </aside>
    </div>
  );

  return (
    <>
      {desktop}
      {mobile}
    </>
  );
}
