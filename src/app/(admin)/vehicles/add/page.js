"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { imageToBase64 } from "@/lib/imageUtils";
import AlertToast from "@/components/ui/AlertToast";

const Icons = {
  ArrowLeft: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  Photo: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  InformationCircle: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  DocumentText: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  Beaker: ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
};

export default function AddVehiclePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    brand: "",
    model: "",
    licensePlate: "",
    currentMileage: "",
    year: "",
    type: "",
    color: "",
    note: "",
    imageUrl: "",
    taxDueDate: "",
    insuranceExpireDate: "",
    status: "available",
  });

  // Initial fluid setup
  const [initFluidEnabled, setInitFluidEnabled] = useState(false);
  const [initFluid, setInitFluid] = useState({
    fluidType: "engine_oil",
    date: new Date().toISOString().split("T")[0],
    mileage: "",
    cost: "",
    note: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imageBroken, setImageBroken] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([
    "รถ SUV",
    "รถเก๋ง",
    "รถกระบะ",
    "รถตู้",
    "รถบรรทุก",
    "มอเตอร์ไซค์",
    "อื่นๆ",
  ]);

  // Alert State
  const [alertState, setAlertState] = useState({ show: false, message: "", type: "success" });
  const showAlert = (message, type = "success") => {
    setAlertState({ show: true, message, type });
  };

  useEffect(() => {
    async function loadVehicleTypes() {
      try {
        const res = await fetch("/api/notifications/settings");
        const data = await res.json();
        if (data.vehicleTypes && data.vehicleTypes.length > 0) {
          setVehicleTypes(data.vehicleTypes);
        }
      } catch (err) {
        console.error("Failed to load vehicle types:", err);
      }
    }
    loadVehicleTypes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setForm({ ...form, imageUrl: URL.createObjectURL(file) });
      setImageBroken(false);
    }
  };

  const applyImageUrl = () => {
    if (!imageUrlInput) return;
    setImageFile(null);
    setForm({ ...form, imageUrl: imageUrlInput });
    setImageUrlInput("");
    setImageBroken(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        imageUrl = await imageToBase64(imageFile, { maxWidth: 600, maxHeight: 400, quality: 0.7 });
      }

      const vehicleDoc = await addDoc(collection(db, "vehicles"), {
        brand: form.brand,
        model: form.model,
        licensePlate: form.licensePlate,
        currentMileage: Number(form.currentMileage) || 0,
        year: form.year,
        type: form.type,
        color: form.color,
        note: form.note,
        imageUrl: imageUrl,
        status: form.status || "available",
        taxDueDate: form.taxDueDate ? new Date(form.taxDueDate) : null,
        insuranceExpireDate: form.insuranceExpireDate ? new Date(form.insuranceExpireDate) : null,
      });

      if (initFluidEnabled) {
        const mileageNum = initFluid.mileage ? Number(initFluid.mileage) : null;
        const costNum = initFluid.cost ? Number(initFluid.cost) : 0;
        await addDoc(collection(db, "expenses"), {
          vehicleId: vehicleDoc.id,
          userId: null,
          usageId: null,
          type: "fluid",
          amount: costNum,
          mileage: mileageNum,
          note: `${initFluid.note || "ตั้งค่าเริ่มต้น"}`,
          timestamp: new Date(initFluid.date),
          createdAt: serverTimestamp(),
          fluidType: initFluid.fluidType,
        });
      }

      showAlert("เพิ่มข้อมูลรถสำเร็จ!", "success");
      setTimeout(() => router.push("/vehicles"), 1000);
    } catch (err) {
      console.error(err);
      showAlert("เกิดข้อผิดพลาดในการเพิ่มรถ", "error");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <AlertToast
        show={alertState.show}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState((prev) => ({ ...prev, show: false }))}
      />

      {/* Header Bar (Compact) */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-9 w-9 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
            title="ย้อนกลับ"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">เพิ่มข้อมูลรถใหม่</h1>
            <p className="text-xs font-normal text-slate-600 mt-0.5">
              กรอกรายละเอียดข้อมูลรถยนต์เพื่อเพิ่มเข้าสู่ระบบยานพาหนะ
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 Cols): Form Fields */}
        <div className="lg:col-span-2 space-y-4">
          {/* General Information */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3.5 sm:p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Icons.InformationCircle className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">ข้อมูลทั่วไป</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">สถานะรถ</label>
                <select
                  name="status"
                  value={form.status || "available"}
                  onChange={handleChange}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                >
                  <option value="available">พร้อมใช้งาน</option>
                  <option value="maintenance">ซ่อมบำรุง</option>
                  <option value="retired">ไม่พร้อมใช้งาน</option>
                  <option value="in_use">กำลังใช้งาน</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">ประเภท</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                >
                  <option value="">-- เลือกประเภทรถ --</option>
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  ยี่ห้อ <span className="text-rose-500">*</span>
                </label>
                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  required
                  placeholder="เช่น Toyota, Isuzu"
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  รุ่น <span className="text-rose-500">*</span>
                </label>
                <input
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  required
                  placeholder="เช่น Fortuner, Hilux Revo"
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  ทะเบียนรถ <span className="text-rose-500">*</span>
                </label>
                <input
                  name="licensePlate"
                  value={form.licensePlate}
                  onChange={handleChange}
                  required
                  placeholder="เช่น 1กข 1234 กทม."
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  เลขไมล์เริ่มต้น <span className="text-rose-500">*</span>
                </label>
                <input
                  name="currentMileage"
                  type="number"
                  value={form.currentMileage}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">ปีที่ผลิต (พ.ศ. / ค.ศ.)</label>
                <input
                  name="year"
                  type="number"
                  value={form.year}
                  onChange={handleChange}
                  placeholder="เช่น 2024"
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">สีตัวถัง</label>
                <input
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  placeholder="เช่น ขาวมุก, ดำ"
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-normal text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                rows={2}
                placeholder="ระบุข้อมูลเพิ่มเติมเกี่ยวกับรถคันนี้..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Important Documents */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3.5 sm:p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Icons.DocumentText className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">เอกสารสำคัญและวันหมดอายุ</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  ภาษีรถยนต์ (วันหมดอายุ)
                </label>
                <input
                  name="taxDueDate"
                  type="date"
                  value={form.taxDueDate}
                  onChange={handleDateChange}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  ประกันภัยรถยนต์ (วันหมดอายุ)
                </label>
                <input
                  name="insuranceExpireDate"
                  type="date"
                  value={form.insuranceExpireDate}
                  onChange={handleDateChange}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Initial Fluid Setup */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="p-3.5 sm:p-4 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.Beaker className="w-4 h-4 text-sky-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">ตั้งค่าของเหลวเริ่มต้น</h3>
                  <p className="text-[11px] font-normal text-slate-500">บันทึกประวัติการเปลี่ยนของเหลวล่าสุดสำหรับรถคันนี้</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={initFluidEnabled}
                  onChange={(e) => setInitFluidEnabled(e.target.checked)}
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {initFluidEnabled && (
              <div className="p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">ชนิดของเหลว</label>
                  <select
                    value={initFluid.fluidType}
                    onChange={(e) => setInitFluid((v) => ({ ...v, fluidType: e.target.value }))}
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="engine_oil">น้ำมันเครื่อง</option>
                    <option value="coolant">น้ำยาหม้อน้ำ</option>
                    <option value="brake_fluid">น้ำมันเบรก</option>
                    <option value="transmission_fluid">น้ำมันเกียร์</option>
                    <option value="power_steering">เพาเวอร์พวงมาลัย</option>
                    <option value="differential">ดิฟเฟอเรนเชียล</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">วันที่เปลี่ยนล่าสุด</label>
                  <input
                    type="date"
                    value={initFluid.date}
                    onChange={(e) => setInitFluid((v) => ({ ...v, date: e.target.value }))}
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">เลขไมล์ขณะเปลี่ยน</label>
                  <input
                    type="number"
                    value={initFluid.mileage}
                    onChange={(e) => setInitFluid((v) => ({ ...v, mileage: e.target.value }))}
                    placeholder="เช่น 10500"
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">ค่าใช้จ่าย (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={initFluid.cost}
                    onChange={(e) => setInitFluid((v) => ({ ...v, cost: e.target.value }))}
                    placeholder="0.00"
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-normal text-slate-700 mb-1">หมายเหตุของเหลว</label>
                  <input
                    type="text"
                    value={initFluid.note}
                    onChange={(e) => setInitFluid((v) => ({ ...v, note: e.target.value }))}
                    placeholder="เช่น เกรด 5W-30 สังเคราะห์แท้"
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Image & Action */}
        <div className="space-y-4">
          {/* Image Upload Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Icons.Photo className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">รูปภาพรถยนต์</h2>
            </div>

            <div
              className="w-full aspect-video bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all overflow-hidden relative group"
              onClick={() => document.getElementById("vehicle-image-input")?.click()}
            >
              {form.imageUrl && !imageBroken ? (
                <Image
                  src={form.imageUrl}
                  alt="Vehicle preview"
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() => setImageBroken(true)}
                />
              ) : (
                <div className="text-center p-4">
                  <Icons.Photo className="w-8 h-8 text-slate-400 mx-auto mb-1.5 group-hover:scale-105 transition-transform" />
                  <p className="text-xs font-normal text-slate-700">คลิกเพื่ออัปโหลดรูปภาพ</p>
                  <p className="text-[11px] font-normal text-slate-400 mt-0.5">PNG, JPG, WEBP</p>
                </div>
              )}
            </div>

            <input
              id="vehicle-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="relative pt-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400 font-normal">หรือระบุลิงก์ URL</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={applyImageUrl}
                className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-normal transition-colors cursor-pointer"
              >
                ใช้งาน
              </button>
            </div>
          </div>

          {/* Action Submission Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3.5 sm:p-4 space-y-3 sticky top-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              การดำเนินการ
            </h3>
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-normal shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <span>บันทึกข้อมูลรถใหม่</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full h-9 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-normal transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
