"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function TestNotificationsPage() {
  const searchParams = useSearchParams();
  const initialEvent = searchParams?.get('event') || 'booking_created';

  const [eventType, setEventType] = useState(initialEvent);
  const [bookingId, setBookingId] = useState('TEST-123');
  const [requesterName, setRequesterName] = useState('สมชาย ทดสอบ');
  const [userEmail, setUserEmail] = useState('somchai@example.com');
  const [vehicleLicensePlate, setVehicleLicensePlate] = useState('กข-1234');
  const [startDate, setStartDate] = useState(new Date().toISOString());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600 * 1000 * 24).toISOString());
  const [returnedAt, setReturnedAt] = useState('');
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ev = searchParams?.get('event');
    if (ev) setEventType(ev);
  }, [searchParams]);

  const buildPayload = () => ({
    event: eventType,
    booking: {
      id: bookingId,
      requesterName,
      userEmail,
      vehicleLicensePlate,
      startDate,
      endDate,
      returnedAt: returnedAt || null
    }
  });

  const handlePreview = () => {
    setPreview(buildPayload());
    setResult(null);
  };

  const handleSend = async () => {
    const payload = buildPayload();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResult({ ok: res.ok, status: res.status, data });
    } catch (err) {
      setResult({ ok: false, error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header & Back link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="text-xs font-normal text-emerald-700 hover:text-emerald-800">
              ← กลับไปศูนย์การแจ้งเตือน
            </Link>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            ทดสอบการส่ง Flex Notification (LINE)
          </h1>
          <p className="text-slate-600 text-xs mt-0.5 font-normal">
            จำลองข้อมูลคำขอเพื่อส่งข้อความทดสอบไปยังปลายทาง LINE Messaging API
          </p>
        </div>
      </div>

      {/* Form Container (Mini-Compact & High Contrast) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 sm:p-5 space-y-3.5">
        
        {/* Event Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-900 mb-1">
            ประเภทเหตุการณ์ (Event Type)
          </label>
          <select 
            value={eventType} 
            onChange={e => setEventType(e.target.value)} 
            className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-normal"
          >
            <option value="booking_created">booking_created (สร้างคำขอจองใหม่)</option>
            <option value="admin_approval_request">admin_approval_request (ส่งคำขอให้แอดมินอนุมัติ)</option>
            <option value="booking_approved">booking_approved (คำขอได้รับการอนุมัติ)</option>
            <option value="booking_rejected">booking_rejected (คำขอถูกปฏิเสธ)</option>
            <option value="vehicle_sent">vehicle_sent (ส่งมอบรถ/เริ่มเดินทาง)</option>
            <option value="vehicle_returned">vehicle_returned (ส่งคืนรถยนต์)</option>
          </select>
        </div>

        {/* Booking ID */}
        <div>
          <label className="block text-xs font-semibold text-slate-900 mb-1">
            รหัสคำขอจอง (Booking ID)
          </label>
          <input 
            className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono font-normal" 
            value={bookingId} 
            onChange={e => setBookingId(e.target.value)} 
          />
        </div>

        {/* Requester Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">
              ชื่อผู้ขอ (Requester Name)
            </label>
            <input 
              className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-normal" 
              value={requesterName} 
              onChange={e => setRequesterName(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">
              อีเมลผู้ขอ (User Email)
            </label>
            <input 
              className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-normal" 
              value={userEmail} 
              onChange={e => setUserEmail(e.target.value)} 
            />
          </div>
        </div>

        {/* Vehicle Plate */}
        <div>
          <label className="block text-xs font-semibold text-slate-900 mb-1">
            ทะเบียนรถ (Vehicle License Plate)
          </label>
          <input 
            className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono font-normal" 
            value={vehicleLicensePlate} 
            onChange={e => setVehicleLicensePlate(e.target.value)} 
          />
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">
              วันเริ่มต้น (Start Date / ISO)
            </label>
            <input 
              className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-normal" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">
              วันสิ้นสุด (End Date / ISO)
            </label>
            <input 
              className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-normal" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
            />
          </div>
        </div>

        {/* Optional returnedAt */}
        <div>
          <label className="block text-xs font-semibold text-slate-900 mb-1">
            เวลาคืนรถ (Returned At - ไม่บังคับ)
          </label>
          <input 
            className="h-9 w-full px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-normal" 
            value={returnedAt} 
            onChange={e => setReturnedAt(e.target.value)} 
            placeholder="ISO Date string..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button 
            type="button"
            onClick={handlePreview} 
            className="h-9 px-4 text-xs font-normal text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition cursor-pointer"
          >
            ดูตัวอย่าง Payload
          </button>
          <button 
            type="button"
            onClick={handleSend} 
            disabled={loading} 
            className="h-9 px-4 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'กำลังส่ง...' : 'ส่งข้อความทดสอบ'}
          </button>
        </div>
      </div>

      {/* Payload Preview */}
      {preview && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
          <h2 className="text-xs font-bold text-slate-900 mb-2">Payload Preview (JSON)</h2>
          <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-normal text-slate-800 overflow-auto max-h-56 font-mono custom-scrollbar">
            {JSON.stringify(preview, null, 2)}
          </pre>
        </div>
      )}

      {/* Response Result */}
      {result && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xs font-bold text-slate-900">ผลลัพธ์การส่ง (Result)</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-normal border ${
              result.ok 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {result.ok ? 'สำเร็จ (Success)' : 'ล้มเหลว (Failed)'}
            </span>
          </div>
          <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-normal text-slate-800 overflow-auto max-h-56 font-mono custom-scrollbar">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
