"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import Link from 'next/link';

// --- Icons ---
const Icons = {
    Car: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
    ),
    SteeringWheel: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
    ),
    Wrench: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.07a4.5 4.5 0 0 0 4.486-6.32l-3.27 3.287a1.125 1.125 0 0 1-1.59 0l-1.687-1.688a1.125 1.125 0 0 1 0-1.59l3.287-3.27a4.5 4.5 0 0 0-6.32 4.486c.118.58.094 1.193-.07 1.743" />
        </svg>
    ),
    Clipboard: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
    ),
    DocumentText: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    ShieldCheck: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
    ),
    Beaker: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    ChevronRight: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
    ),
    ChevronLeft: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
    ),
    Search: ({ className = "w-4 h-4" }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
    )
};

// Component สรุปข้อมูล (Mini-Compact, High Contrast)
function StatCard({ title, value, icon: Icon, link, bgClass, textClass }) {
    return (
        <Link 
            href={link || '#'} 
            className="block p-3.5 sm:p-4 bg-white rounded-xl shadow-xs hover:shadow-md transition-all border border-slate-200/80 hover:border-slate-300 group"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-normal text-slate-600 group-hover:text-slate-900 transition-colors">{title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-mono tracking-tight">{value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${bgClass} shrink-0`}>
                    <Icon className={`w-6 h-6 ${textClass}`} />
                </div>
            </div>
        </Link>
    );
}

// Utility functions
const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('th-TH');
    } catch (e) {
        return 'N/A';
    }
};

const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        return 'N/A';
    }
};

const getExpenseType = (type) => {
    switch (type) {
        case 'fuel': 
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-normal bg-blue-50 text-blue-900 border border-blue-200">
                    <span>⛽</span> น้ำมัน
                </span>
            );
        case 'fluid': 
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-normal bg-purple-50 text-purple-900 border border-purple-200">
                    <span>🛢️</span> ของเหลว
                </span>
            );
        case 'other': 
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-normal bg-slate-100 text-slate-800 border border-slate-200">
                    <span>💰</span> อื่นๆ
                </span>
            );
        default: 
            return <span className="text-xs font-normal text-slate-800">{type}</span>;
    }
};

// Component แสดงรายการแจ้งเตือน (Compact Layout, High Contrast)
function AlertList({ title, items, type, icon: Icon }) {
    const badgeStyle = type === 'tax' 
        ? 'text-rose-800 bg-rose-50 border border-rose-200' 
        : type === 'insurance' 
        ? 'text-amber-900 bg-amber-50 border border-amber-200' 
        : 'text-sky-900 bg-sky-50 border border-sky-200';
        
    const iconColor = type === 'tax' 
        ? 'text-rose-600' 
        : type === 'insurance' 
        ? 'text-amber-600' 
        : 'text-sky-600';

    const getHref = (itemId) => {
        if (type === 'fluidChange') return `/vehicles/${itemId}/fluid`;
        return `/vehicles/${itemId}/edit`;
    };

    return (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col h-full">
            <div className="px-3.5 py-2.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                    <h3 className="font-semibold text-xs text-slate-900">{title}</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-white rounded-full border border-slate-200 text-slate-800 font-mono">
                    {items.length}
                </span>
            </div>
            <div className="p-2.5 overflow-y-auto max-h-[260px] flex-1 custom-scrollbar">
                <ul className="space-y-1.5">
                    {items.length > 0 ? items.map(item => (
                        <li key={item.id}>
                            <Link
                                href={getHref(item.id)}
                                className="block p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-colors group"
                            >
                                <div className="flex justify-between items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                                            {item.brand} {item.model}
                                        </div>
                                        <div className="text-[11px] text-slate-600 mt-0.5 font-normal">
                                            {item.licensePlate} • {item.currentMileage?.toLocaleString?.() ?? '-'} กม.
                                        </div>
                                    </div>
                                    <span className={`text-[11px] font-normal whitespace-nowrap px-2 py-0.5 rounded-md ${
                                        type === 'fluidChange' && item.mileageSinceLastChange >= 10000
                                            ? 'bg-rose-50 text-rose-800 border border-rose-200 font-semibold'
                                            : badgeStyle
                                    }`}>
                                        {type === 'fluidChange'
                                            ? item.lastFluidMileage === undefined || item.lastFluidMileage === null
                                                ? 'ยังไม่ระบุ'
                                                : item.mileageSinceLastChange >= 10000
                                                    ? `เกิน ${(item.mileageSinceLastChange - 10000).toLocaleString()} กม.`
                                                    : `เหลือ ${(10000 - item.mileageSinceLastChange).toLocaleString()} กม.`
                                            : `${formatDate(type === 'tax' ? item.taxDueDate : item.insuranceExpireDate)}`
                                        }
                                    </span>
                                </div>
                            </Link>
                        </li>
                    )) : (
                        <div className="flex flex-col items-center justify-center h-28 text-slate-400">
                            <Icon className="w-6 h-6 mb-1 opacity-25" />
                            <p className="text-xs font-normal text-slate-500">ไม่มีรายการแจ้งเตือน</p>
                        </div>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const [vehicles, setVehicles] = useState([]);
    const [stats, setStats] = useState({ available: 0, inUse: 0, maintenance: 0, totalUsage: 0 });
    const [activeUsages, setActiveUsages] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [expenseVehicles, setExpenseVehicles] = useState({});
    const [loading, setLoading] = useState(true);
    
    // Filter & Search states (Compact h-9)
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const vehiclesQuery = query(collection(db, "vehicles"));
        const activeUsageQuery = query(collection(db, "vehicle-usage"), where("status", "==", "active"));
        const expensesQuery = query(collection(db, "expenses"));

        const unsubVehicles = onSnapshot(vehiclesQuery, (snapshot) => {
            let available = 0, inUse = 0, maintenance = 0;
            const vList = snapshot.docs.map(doc => {
                const vehicle = { id: doc.id, ...doc.data() };
                if (vehicle.status === 'available') available++;
                else if (vehicle.status === 'in-use' || vehicle.status === 'in_use') inUse++;
                else if (vehicle.status === 'maintenance') maintenance++;
                return vehicle;
            });
            setVehicles(vList);
            setStats(prev => ({ ...prev, available, inUse, maintenance }));
        });

        const unsubUsages = onSnapshot(activeUsageQuery, (snapshot) => {
            const usages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActiveUsages(usages);
        });

        const unsubExpenses = onSnapshot(expensesQuery, async (snapshot) => {
            const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            expenses.sort((a, b) => {
                const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
                const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
                return bTime - aTime;
            });
            setRecentExpenses(expenses);
            const vehicleIds = Array.from(new Set(expenses.map(e => e.vehicleId).filter(Boolean)));
            if (vehicleIds.length > 0) {
                const { getDoc, doc } = await import('firebase/firestore');
                const vehicleMap = {};
                await Promise.all(vehicleIds.map(async (vid) => {
                    try {
                        const vSnap = await getDoc(doc(db, 'vehicles', vid));
                        if (vSnap.exists()) vehicleMap[vid] = vSnap.data();
                    } catch { }
                }));
                setExpenseVehicles(vehicleMap);
            } else {
                setExpenseVehicles({});
            }
        });

        const usageQuery = query(
            collection(db, "vehicle-usage"),
            where("status", "==", "completed")
        );
        const unsubTotalUsage = onSnapshot(usageQuery, (snapshot) => {
            setStats(prev => ({ ...prev, totalUsage: snapshot.size }));
        });

        setLoading(false);

        return () => {
            unsubVehicles();
            unsubUsages();
            unsubExpenses();
            unsubTotalUsage();
        };
    }, []);

    // Calculate Alerts Reactively from vehicles & recentExpenses
    const alerts = useMemo(() => {
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const fluidExpensesByVehicle = {};
        const latestMileageByVehicle = {};

        recentExpenses.forEach(exp => {
            const vid = exp.vehicleId;
            const m = Number(exp.mileage);
            if (vid && !isNaN(m) && m > 0) {
                if (exp.type === 'fluid') {
                    const prev = fluidExpensesByVehicle[vid];
                    if (!prev || m > Number(prev.mileage)) {
                        fluidExpensesByVehicle[vid] = { ...exp, mileage: m };
                    }
                }
                if (!latestMileageByVehicle[vid] || m > latestMileageByVehicle[vid]) {
                    latestMileageByVehicle[vid] = m;
                }
            }
        });

        const taxAlerts = [];
        const insuranceAlerts = [];
        const fluidChangeAlerts = [];

        vehicles.forEach(vehicle => {
            const vMileage = Number(vehicle.currentMileage) || 0;
            const expMileage = Number(latestMileageByVehicle[vehicle.id]) || 0;
            const currentMileage = Math.max(vMileage, expMileage);

            // ภาษีใกล้หมดอายุ (30 วัน)
            if (vehicle.taxDueDate) {
                const taxDate = vehicle.taxDueDate?.toDate ? vehicle.taxDueDate.toDate() : new Date(vehicle.taxDueDate);
                if (taxDate <= thirtyDaysFromNow) {
                    taxAlerts.push({ ...vehicle, currentMileage });
                }
            }

            // ประกันใกล้หมดอายุ (30 วัน)
            if (vehicle.insuranceExpireDate) {
                const insDate = vehicle.insuranceExpireDate?.toDate ? vehicle.insuranceExpireDate.toDate() : new Date(vehicle.insuranceExpireDate);
                if (insDate <= thirtyDaysFromNow) {
                    insuranceAlerts.push({ ...vehicle, currentMileage });
                }
            }

            // ครบกำหนดเปลี่ยนของเหลว (รอบละ 10,000 กม. เตือนล่วงหน้าที่ 9,000 กม.)
            const lastFluidChange = fluidExpensesByVehicle[vehicle.id];
            if (lastFluidChange) {
                const mileageSinceLastChange = currentMileage - Number(lastFluidChange.mileage);
                if (mileageSinceLastChange >= 9000) {
                    fluidChangeAlerts.push({
                        ...vehicle,
                        lastFluidMileage: Number(lastFluidChange.mileage),
                        currentMileage,
                        mileageSinceLastChange
                    });
                }
            }
        });

        // เรียงลำดับตามความเร่งด่วน: เกินกำหนดมากที่สุดขึ้นก่อน
        fluidChangeAlerts.sort((a, b) => b.mileageSinceLastChange - a.mileageSinceLastChange);

        return {
            tax: taxAlerts,
            insurance: insuranceAlerts,
            fluidChange: fluidChangeAlerts
        };
    }, [vehicles, recentExpenses]);

    // Filter expenses by search query & type
    const filteredExpenses = useMemo(() => {
        return recentExpenses.filter(expense => {
            const vehicle = expenseVehicles[expense.vehicleId];
            const plate = vehicle?.licensePlate?.toLowerCase() || '';
            const note = expense.note?.toLowerCase() || '';
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q || plate.includes(q) || note.includes(q);
            const matchesType = selectedType === 'all' || expense.type === selectedType;
            return matchesSearch && matchesType;
        });
    }, [recentExpenses, expenseVehicles, searchQuery, selectedType]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentExpenses = filteredExpenses.slice(startIndex, endIndex);

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            
            {/* Header (Compact) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-1">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">แดชบอร์ดภาพรวม</h1>
                    <p className="text-slate-600 text-xs mt-0.5 font-normal">ภาพรวมสถานะยานพาหนะ รายการแจ้งเตือนด่วน และบันทึกค่าใช้จ่ายล่าสุด</p>
                </div>
            </div>

            {/* Stats Cards (Compact 4-grid) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard 
                    title="รถว่างพร้อมใช้" 
                    value={stats.available} 
                    icon={Icons.Car} 
                    link="/vehicles" 
                    bgClass="bg-emerald-50 border border-emerald-200/60" 
                    textClass="text-emerald-700" 
                />
                <StatCard 
                    title="กำลังใช้งาน" 
                    value={stats.inUse} 
                    icon={Icons.SteeringWheel} 
                    link="/vehicles/in-use" 
                    bgClass="bg-blue-50 border border-blue-200/60" 
                    textClass="text-blue-700" 
                />
                <StatCard 
                    title="อยู่ระหว่างซ่อมบำรุง" 
                    value={stats.maintenance} 
                    icon={Icons.Wrench} 
                    link="/maintenance" 
                    bgClass="bg-amber-50 border border-amber-200/60" 
                    textClass="text-amber-700" 
                />
                <StatCard 
                    title="ประวัติการเดินทางสะสม" 
                    value={stats.totalUsage} 
                    icon={Icons.Clipboard} 
                    link="/trip-history" 
                    bgClass="bg-purple-50 border border-purple-200/60" 
                    textClass="text-purple-700" 
                />
            </div>

            {/* Alerts Section (Compact 3-grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                <AlertList title="ภาษีใกล้หมดอายุ (30 วัน)" items={alerts.tax} type="tax" icon={Icons.DocumentText} />
                <AlertList title="ประกันใกล้หมดอายุ (30 วัน)" items={alerts.insurance} type="insurance" icon={Icons.ShieldCheck} />
                <AlertList title="ครบกำหนดเปลี่ยนของเหลว" items={alerts.fluidChange} type="fluidChange" icon={Icons.Beaker} />
            </div>

            {/* Recent Expenses (Compact Table & Filters) */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
                
                {/* Table Header & Controls (h-9 inputs) */}
                <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900">ค่าใช้จ่ายล่าสุด</h2>
                        <span className="text-xs font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-mono">
                            {filteredExpenses.length} รายการ
                        </span>
                    </div>

                    {/* Filter & Search Bar with height h-9 */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {/* Search Input h-9 */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                                <Icons.Search className="w-3.5 h-3.5" />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="ค้นหาทะเบียน, หมายเหตุ..."
                                className="h-9 w-44 sm:w-56 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal"
                            />
                        </div>

                        {/* Type Select h-9 */}
                        <select
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-9 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
                        >
                            <option value="all">ทุกประเภท</option>
                            <option value="fuel">⛽ น้ำมัน</option>
                            <option value="fluid">🛢️ ของเหลว</option>
                            <option value="other">💰 อื่นๆ</option>
                        </select>

                        {/* Reset Filters button */}
                        {(searchQuery || selectedType !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedType('all');
                                    setCurrentPage(1);
                                }}
                                className="h-9 px-2.5 text-xs font-normal text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="ล้างการค้นหา"
                            >
                                ล้างตัวกรอง
                            </button>
                        )}
                    </div>
                </div>

                {/* Desktop Table View (Compact py-2.5) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/80">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">วันที่ / เวลา</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ทะเบียนรถ</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">ประเภท</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">เลขไมล์</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">จำนวนเงิน</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-800 tracking-normal">หมายเหตุ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {currentExpenses.length > 0 ? (
                                currentExpenses.map(expense => {
                                    const vehicle = expenseVehicles[expense.vehicleId];
                                    return (
                                        <tr key={expense.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-2.5 whitespace-nowrap text-xs text-slate-700 font-normal">
                                                {formatDateTime(expense.timestamp)}
                                            </td>
                                            <td className="px-4 py-2.5 whitespace-nowrap text-xs font-semibold text-slate-900">
                                                {vehicle?.licensePlate || '-'}
                                            </td>
                                            <td className="px-4 py-2.5 whitespace-nowrap text-xs">
                                                {getExpenseType(expense.type)}
                                            </td>
                                            <td className="px-4 py-2.5 whitespace-nowrap text-xs text-slate-700 font-normal font-mono">
                                                {expense.mileage ? `${expense.mileage.toLocaleString()} กม.` : '-'}
                                            </td>
                                            <td className="px-4 py-2.5 whitespace-nowrap text-xs font-bold text-slate-900 font-mono">
                                                {expense.amount?.toLocaleString()} ฿
                                            </td>
                                            <td className="px-4 py-2.5 text-xs text-slate-600 font-normal max-w-xs truncate">
                                                {expense.note || '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-xs font-normal text-slate-500">
                                        ไม่พบข้อมูลค่าใช้จ่ายที่ตรงกับเงื่อนไข
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View (Compact) */}
                <div className="md:hidden divide-y divide-slate-100">
                    {currentExpenses.length > 0 ? (
                        currentExpenses.map(expense => {
                            const vehicle = expenseVehicles[expense.vehicleId];
                            return (
                                <div key={expense.id} className="p-3 space-y-1.5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-semibold text-slate-900">{vehicle?.licensePlate || 'ไม่ระบุทะเบียน'}</div>
                                            <div className="text-[11px] text-slate-600 mt-0.5 font-normal">{formatDateTime(expense.timestamp)}</div>
                                        </div>
                                        <div className="text-xs font-bold text-slate-900 font-mono">{expense.amount?.toLocaleString()} ฿</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        {getExpenseType(expense.type)}
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-700 font-normal font-mono">{expense.mileage ? `${expense.mileage.toLocaleString()} กม.` : '-'}</span>
                                    </div>
                                    {expense.note && (
                                        <div className="text-[11px] text-slate-700 font-normal bg-slate-50 p-2 rounded border border-slate-100">
                                            {expense.note}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-6 text-center text-xs font-normal text-slate-500">
                            ไม่พบข้อมูลค่าใช้จ่ายที่ตรงกับเงื่อนไข
                        </div>
                    )}
                </div>

                {/* Pagination (Compact) */}
                {totalPages > 1 && (
                    <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between">
                        <div className="hidden sm:block text-xs text-slate-700 font-normal">
                            แสดง {startIndex + 1}-{Math.min(endIndex, filteredExpenses.length)} จาก {filteredExpenses.length} รายการ
                        </div>
                        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
                            <button 
                                onClick={goToFirstPage} 
                                disabled={currentPage === 1} 
                                className="h-8 px-2 text-xs font-normal bg-white border border-slate-300 rounded-md hover:bg-slate-50 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                title="หน้าแรก"
                            >
                                «
                            </button>
                            <button 
                                onClick={goToPrevPage} 
                                disabled={currentPage === 1} 
                                className="h-8 px-2 text-xs font-normal bg-white border border-slate-300 rounded-md hover:bg-slate-50 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center"
                                title="ก่อนหน้า"
                            >
                                <Icons.ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 py-1 text-xs font-normal bg-white border border-slate-300 rounded-md text-slate-800 font-mono">
                                {currentPage} / {totalPages}
                            </span>
                            <button 
                                onClick={goToNextPage} 
                                disabled={currentPage === totalPages} 
                                className="h-8 px-2 text-xs font-normal bg-white border border-slate-300 rounded-md hover:bg-slate-50 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center"
                                title="ถัดไป"
                            >
                                <Icons.ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <button 
                                onClick={goToLastPage} 
                                disabled={currentPage === totalPages} 
                                className="h-8 px-2 text-xs font-normal bg-white border border-slate-300 rounded-md hover:bg-slate-50 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                title="หน้าสุดท้าย"
                            >
                                »
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}