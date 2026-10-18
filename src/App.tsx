import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import {
  Student,
  Teacher,
  ClassStructure,
  SchoolSettings,
  StudentAttendance,
  TeacherAttendance
} from './types';

// Simple Clean Components
import { SimpleLogin } from './components/simple/SimpleLogin';
import { SimpleStudentAttendance } from './components/simple/SimpleStudentAttendance';
import { SimpleTeacherAttendance } from './components/simple/SimpleTeacherAttendance';
import { SimpleRecapExport } from './components/simple/SimpleRecapExport';
import { SimpleStudentList } from './components/simple/SimpleStudentList';
import { SimpleSchoolProfile } from './components/simple/SimpleSchoolProfile';

import {
  ClipboardCheck,
  UserCheck,
  FileSpreadsheet,
  Users,
  School,
  RotateCcw,
  LogOut,
  Shield,
  Check,
  AlertTriangle,
  X,
  Menu
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(storage.checkAuth());
  const [activeTab, setActiveTab] = useState<'siswa' | 'guru' | 'profil' | 'data_siswa' | 'rekap'>('siswa');

  const [students, setStudents] = useState<Student[]>(storage.getStudents());
  const [teachers, setTeachers] = useState<Teacher[]>(storage.getTeachers());
  const [classes, setClasses] = useState<ClassStructure[]>(storage.getClasses());
  const [settings, setSettings] = useState<SchoolSettings>(storage.getSettings());
  const [studentAtt, setStudentAtt] = useState<StudentAttendance[]>(storage.getStudentAttendance());
  const [teacherAtt, setTeacherAtt] = useState<TeacherAttendance[]>(storage.getTeacherAttendance());
  const [activeUserName, setActiveUserName] = useState<string>(storage.getActiveUserName());

  // Modal Reset Presensi (Pengganti alert/confirm sandbox)
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetNotice, setResetNotice] = useState<string>('');

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setIsAuthenticated(storage.checkAuth());
      setStudents(storage.getStudents());
      setTeachers(storage.getTeachers());
      setClasses(storage.getClasses());
      setSettings(storage.getSettings());
      setStudentAtt(storage.getStudentAttendance());
      setTeacherAtt(storage.getTeacherAttendance());
      setActiveUserName(storage.getActiveUserName());
    });
    return unsub;
  }, []);

  // Jika belum login, tampilkan layar Login Admin resmi
  if (!isAuthenticated) {
    return <SimpleLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 5 Tab Utama Navigasi Sesuai Permintaan
  const tabs = [
    { id: 'siswa', label: 'Presensi Siswa', shortLabel: 'Siswa', icon: ClipboardCheck },
    { id: 'guru', label: 'Presensi Guru', shortLabel: 'Guru', icon: UserCheck },
    { id: 'profil', label: 'Info Guru & Sekolah', shortLabel: 'Sekolah', icon: School },
    { id: 'data_siswa', label: 'Data Murid', shortLabel: 'Murid', icon: Users },
    { id: 'rekap', label: 'Rekap & Unduh Data', shortLabel: 'Rekap', icon: FileSpreadsheet },
  ];

  const handleConfirmReset = () => {
    const res = storage.resetAllAttendanceToZero();
    setShowResetModal(false);
    setResetNotice(res.message);
    setTimeout(() => setResetNotice(''), 4500);
  };

  const handleLogout = () => {
    storage.logout();
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Top Header Responsif */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Baris Atas: Logo, Info Akun Admin, Logout */}
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Logo & Judul Sekolah */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-500/20 text-sky-400 font-extrabold flex items-center justify-center text-xs sm:text-sm border border-sky-500/30 shrink-0">
                NI
              </div>
              <div className="truncate">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                  {settings.nama_sekolah}
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                  Kota Bandung · T.A {settings.tahun_ajaran_aktif}
                </p>
              </div>
            </div>

            {/* Panel Pengguna Aktif & Tombol Keluar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-slate-300">
                <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-semibold text-white">AdminKOBERNurul_Iman</span>
              </div>

              {/* Tombol Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/80 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-1.5 active:scale-95"
                title="Keluar dari sesi admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Keluar</span>
              </button>
            </div>
          </div>

          {/* Baris Bawah: 5 Navbar Utama (Hanya Tampil di Tablet & Desktop / sm ke atas) */}
          <nav className="hidden sm:flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-sky-400 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Container Content (Diberikan padding bawah pb-28 di mobile agar tidak tertutup navbar mengambang) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-28 sm:pb-8">
        {/* Mobile Indicator Halaman Aktif */}
        <div className="sm:hidden flex items-center justify-between pb-2 mb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block animate-pulse" />
            <span className="text-xs font-bold text-slate-800">
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {students.length} Siswa · 6 Guru
          </span>
        </div>

        {/* Toast Notifikasi Reset */}
        {resetNotice && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <Check className="w-5 h-5 shrink-0" />
            <span>{resetNotice}</span>
          </div>
        )}

        {/* 1. Presensi Siswa */}
        {activeTab === 'siswa' && (
          <SimpleStudentAttendance
            students={students}
            classes={classes}
            teachers={teachers}
            studentAtt={studentAtt}
            currentUserName={activeUserName}
          />
        )}

        {/* 2. Presensi Guru (dengan data rekapitulasi) */}
        {activeTab === 'guru' && (
          <SimpleTeacherAttendance
            teachers={teachers}
            teacherAtt={teacherAtt}
          />
        )}

        {/* 3. Info Guru & Sekolah */}
        {activeTab === 'profil' && (
          <SimpleSchoolProfile
            teachers={teachers}
            settings={settings}
            classes={classes}
          />
        )}

        {/* 4. Data Murid (33 siswa, tambah, ubah, hapus dengan kunci 123456) */}
        {activeTab === 'data_siswa' && (
          <SimpleStudentList
            students={students}
            classes={classes}
          />
        )}

        {/* 5. Rekap & Unduh Data (Excel multi-sheet + input manual gabungan) */}
        {activeTab === 'rekap' && (
          <SimpleRecapExport
            students={students}
            classes={classes}
            teachers={teachers}
            studentAtt={studentAtt}
            teacherAtt={teacherAtt}
            settings={settings}
            currentUserName={activeUserName}
          />
        )}
      </main>

      {/* Footer Ringkas */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 mt-auto mb-20 sm:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {settings.nama_sekolah} · Gg. Sukaharja 1 No. 113, Sukapada, Bandung · WA: {settings.whatsapp}
          </span>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="text-[11px] text-slate-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg border border-transparent hover:border-rose-200 inline-flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Kehadiran ke 0</span>
          </button>
        </div>
      </footer>

      {/* FLOATING BOTTOM NAVIGATION BAR KHUSUS MOBILE (ICON & MENGAMBANG) */}
      <div className="sm:hidden fixed bottom-4 inset-x-0 z-50 pointer-events-none flex justify-center px-4">
        <nav
          aria-label="Navigasi Bawah Mobile"
          className="pointer-events-auto bg-slate-900/95 backdrop-blur-lg border border-slate-700/80 rounded-full px-3 py-2 shadow-2xl shadow-slate-950/60 flex items-center gap-1.5 ring-1 ring-white/10"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative p-2.5 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center ${
                  isActive
                    ? 'bg-sky-400 text-slate-950 shadow-md shadow-sky-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
                title={tab.label}
                aria-label={tab.label}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* MODAL KONFIRMASI RESET DATA DAFTAR HADIR KE 0 (IN-APP MODAL BEBAS SANDBOX BLOKIR) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-slate-900 text-base">
                  Reset Semua Daftar Hadir?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                Apakah Anda ingin mengosongkan seluruh riwayat presensi siswa dan dewan guru sehingga dimulai bersih dari angka <strong>0</strong>?
              </p>
              <p className="text-[11px] text-slate-400">
                *Data master siswa (33 anak) dan susunan 6 guru tetap aman dan tidak akan terhapus.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors"
              >
                Ya, Reset ke 0
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
