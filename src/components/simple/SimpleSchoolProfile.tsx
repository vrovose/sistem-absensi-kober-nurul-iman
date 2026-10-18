import React, { useState } from 'react';
import { Teacher, SchoolSettings, ClassStructure } from '../../types';
import { storage } from '../../services/storage';
import {
  School,
  Clock,
  Edit2,
  Lock,
  X,
  Check,
  AlertCircle,
  CalendarCheck,
  ShieldCheck
} from 'lucide-react';

interface SimpleSchoolProfileProps {
  teachers: Teacher[];
  settings: SchoolSettings;
  classes: ClassStructure[];
}

export const SimpleSchoolProfile: React.FC<SimpleSchoolProfileProps> = ({
  teachers,
  settings,
  classes,
}) => {
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formName, setFormName] = useState('');
  const [formJabatan, setFormJabatan] = useState('');
  const [formKontak, setFormKontak] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormName(t.nama);
    setFormJabatan(t.jabatan);
    setFormKontak(t.kontak);
    setFormEmail(t.email);
    setPinInput('');
    setPinError('');
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    const res = storage.updateTeacherWithPin(
      editingTeacher.id,
      {
        nama: formName.trim(),
        jabatan: formJabatan.trim(),
        kontak: formKontak.trim(),
        email: formEmail.trim(),
      },
      pinInput.trim()
    );

    if (res.success) {
      setSuccessToast(res.message);
      setEditingTeacher(null);
      setTimeout(() => setSuccessToast(''), 3500);
    } else {
      setPinError(res.message);
    }
  };

  return (
    <div className="space-y-4">
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. Profil Lembaga */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {settings.nama_sekolah}
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              NPSN: {settings.npsn} · T.A {settings.tahun_ajaran_aktif}
            </p>
          </div>
        </div>

        {/* Info Lembaga */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Alamat</span>
            <p className="text-slate-900 font-semibold mt-0.5 leading-snug">
              {settings.alamat}, {settings.kota}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Kontak / WhatsApp</span>
            <p className="text-slate-900 font-mono font-bold text-sm mt-0.5">
              {settings.whatsapp}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Kepala Sekolah: {settings.kepala_sekolah_nama}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Tahun Ajaran</span>
            <p className="text-slate-900 font-bold mt-0.5">
              {settings.tahun_ajaran_aktif} · {settings.semester_aktif}
            </p>
          </div>
        </div>

        {/* Dua Kartu Jam Operasional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-sky-800 uppercase block">Jam Belajar Murid</span>
              <p className="text-base font-extrabold text-slate-900">{settings.jam_belajar_murid}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Jam Kerja Tenaga Pendidik</span>
              <p className="text-base font-extrabold text-slate-900">{settings.jam_kerja_guru}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Susunan 6 Tenaga Pendidik */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <h3 className="font-extrabold text-slate-900">
            Susunan 6 Tenaga Pendidik & Kependidikan
          </h3>
          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md font-mono text-[11px]">
            Kunci: 123456
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          {teachers.map((t, idx) => (
            <div
              key={t.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-sky-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{t.nama}</h4>
                  <p className="text-xs text-sky-800 font-semibold">{t.jabatan}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{t.kontak}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenEdit(t)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                title="Edit data guru"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 4 Ruang Kelas & Penanggung Jawab */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm">
          4 Ruang Kelas & Penanggung Jawab
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {classes.map((cls) => (
            <div key={cls.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Kelas {cls.name}</span>
                <span className="text-sky-800 font-medium text-xs block">{cls.kelompok_usia}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1">
                <p className="text-slate-700">Wali: <strong>{cls.wali_kelas_nama}</strong></p>
                <p className="text-slate-600">Bantu: <strong>Guru Bantu A / B</strong> (Nunung M. / Mia S.)</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL EDIT GURU DENGAN PIN 123456 */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Edit Data Guru</h3>
              <button onClick={() => setEditingTeacher(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jabatan</label>
                <input
                  type="text"
                  required
                  value={formJabatan}
                  onChange={(e) => setFormJabatan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Kontak / WA</label>
                <input
                  type="text"
                  value={formKontak}
                  onChange={(e) => setFormKontak(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                <label className="block font-bold text-slate-800 text-[11px]">Kunci Konfirmasi (PIN):</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="123456"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-2xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
