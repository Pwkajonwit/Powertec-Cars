"use client";

import { useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import useLiffAuth from '@/hooks/useLiffAuth';
import { useState, useEffect } from 'react';
import LiffQueryRouter from '@/components/main/LiffQueryRouter';

// Layout หลักสำหรับพนักงาน
export default function MainLayout({ children }) {
  const { user, userProfile, loading: authLoading, setUserProfileFromAuth } = useAuth();
  const { loading: liffLoading, needsLink, linkProfile, linkByPhone, error: liffAuthError, userProfile: liffUserProfile } = useLiffAuth();
  const [phoneInput, setPhoneInput] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkMessage, setLinkMessage] = useState('');

  // ส่ง userProfile จาก useLiffAuth ไปยัง AuthContext
  useEffect(() => {
    if (liffUserProfile && setUserProfileFromAuth) {
      console.log('Setting userProfile from LIFF auth:', liffUserProfile);
      setUserProfileFromAuth(liffUserProfile);
    }
  }, [liffUserProfile, setUserProfileFromAuth]);

  // Loading state - รอให้ทั้ง LIFF และ Auth เสร็จก่อน
  if (liffLoading || authLoading) {
    return (
      <div className="flex items-center justify-center bg-white min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังเชื่อมต่อ LINE...</p>
        </div>
      </div>
    );
  }

  // แสดง error จาก LIFF (ถ้ามี)
  if (liffAuthError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 max-w-md">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-800 font-semibold mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-gray-600">{liffAuthError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // ถ้าไม่มี user หลังจาก loading เสร็จ = ยังไม่ได้ auth
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  // ถ้าต้องผูกเบอร์โทร (needsLink)
  if (needsLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="mb-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-center mb-2">ผูกบัญชีด้วยหมายเลขโทรศัพท์</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              เราไม่พบบัญชีพนักงานที่เชื่อมกับ LINE นี้ ({linkProfile?.displayName || ''})
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเลขโทรศัพท์
            </label>
            <input 
              value={phoneInput} 
              onChange={(e) => setPhoneInput(e.target.value)} 
              placeholder="0812345678" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              type="tel"
            />
          </div>
          
          {linkMessage && (
            <div className={`mb-4 p-3 rounded ${linkMessage.includes('สำเร็จ') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <p className="text-sm">{linkMessage}</p>
            </div>
          )}
          
          <button 
            onClick={async () => {
              setLinking(true);
              setLinkMessage('');
              const res = await linkByPhone(phoneInput.trim());
              if (res.success) {
                setLinkMessage('ผูกบัญชีสำเร็จ กำลังโหลดข้อมูล...');
              } else {
                setLinkMessage(res.error || 'ไม่สามารถผูกบัญชีได้');
              }
              setLinking(false);
            }} 
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
            disabled={linking || !phoneInput.trim()}
          >
            {linking ? 'กำลังผูกบัญชี...' : 'ผูกบัญชี'}
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            ถ้าคุณยังไม่ลงทะเบียนในระบบ โปรดติดต่อผู้ดูแล
          </p>
        </div>
      </div>
    );
  }

  // ถ้ามี userProfile แล้ว (login และมี profile ในระบบ)
  if (userProfile) {
    return (
      <DataProvider userId={userProfile.uid}>
        <div className="min-h-screen bg-gray-50">
          <LiffQueryRouter />
          {children}
        </div>
      </DataProvider>
    );
  }

  // fallback: กรณี user มีแต่ยังไม่มี profile (และไม่เข้า needsLink)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังตรวจสอบข้อมูลผู้ใช้...</p>
      </div>
    </div>
  );
}
