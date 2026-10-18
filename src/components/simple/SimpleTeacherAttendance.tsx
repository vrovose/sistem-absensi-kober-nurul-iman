import React, { useState } from 'react';
import { Teacher, TeacherAttendance, AttendanceStatus } from '../../types';
import { storage } from '../../services/storage';
import { Check, Calendar, UserCheck, Save, FileSpreadsheet, Sparkles } from 'lucide-react';

interface SimpleTeacherAttendanceProps {
  teachers: Teacher[];
  teacherAtt: TeacherAttendance[];
}

export const SimpleTeacherAttendance: React.FC<SimpleTeacherAttendanceProps> = ({
  teachers,
  teacherAtt,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'harian' | 'rekap'>('harian');

  // Read existing presence for date
  React.useEffect(() => {
    const existing = teacherAtt.filter((t) => t.tanggal === selectedDate);
    const newMap: Record<string, AttendanceStatus> = {};

    teachers.forEach((t) => {
      const rec = existing.find((e) => e.guru_id === t.id);
      newMap[t.id] = rec ? rec.status : 'Hadir';
    });

    setStatusMap(newMap);
    setSuccessMsg('');
  }, [selectedDate, teacherAtt, teachers]);

  const handleSetStatus = (guruId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({
      ...prev,
      [guruId]: status,
    }));
  };

  const handleSaveAll = () => {
    teachers.forEach((t) => {
      const st = statusMap[t.id] || 'Hadir';
      storage.recordTeacherAttendance(t.id, t.nama, selectedDate, st);
    });

    setSuccessMsg(`Presensi 6 dewan guru untuk tanggal ${selectedDate} berhasil disimpan!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const statusConfigs: Array<{ status: AttendanceStatus; label: string; active: string; inactive: string }> = [
    { status: 'Hadir', label: 'Hadir', active: 'bg-emerald-600 text-white font-bold', inactive: 'bg-emerald-50 text-emerald-800 border border-emerald-200' },
    { status: 'Sakit', label: 'Sakit', active: 'bg-sky-600 text-white font-bold', inactive: 'bg-sky-50 text-sky-800 border border-sky-200' },
    { status: 'Izin', label: 'Izin', active: 'bg-amber-600 text-white font-bold', inactive: 'bg-amber-50 text-amber-800 border border-amber-200' },
    { status: 'Alpa', label: 'Alpa', active: 'bg-rose-600 text-white font-bold', inactive: 'bg-rose-50 text-rose-800 border border-rose-200' },
  ];

  return (
    <div className="space-y-5">
      {/* Header & Sub-tab switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Presensi & Rekap Dewan Guru</h2>

        {/* Sub-tabs: Harian vs Rekap */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveSubTab('harian')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
              activeSubTab === 'harian'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Presensi Harian
          </button>
          <button
            onClick={() => setActiveSubTab('rekap')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
              activeSubTab === 'rekap'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rekapitulasi
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <Check className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* VIEW 1: PRESENSI HARIAN GURU */}
      {activeSubTab === 'harian' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-700">Daftar Kehadiran 6 Tenaga Pendidik</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Tanggal:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {teachers.map((teacher, idx) => {
              const currentStatus = statusMap[teacher.id] || 'Hadir';
              const rec = teacherAtt.find((t) => t.guru_id === teacher.id && t.tanggal === selectedDate);

              return (
                <div
                  key={teacher.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-900 text-sky-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{teacher.nama}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-sky-800 font-semibold">{teacher.jabatan}</span>
                        {rec?.catatan && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {rec.catatan}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {statusConfigs.map((cfg) => {
                      const isSelected = currentStatus === cfg.status;
                      return (
                        <button
                          key={cfg.status}
                          onClick={() => handleSetStatus(teacher.id, cfg.status)}
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl transition-all ${
                            isSelected ? cfg.active : cfg.inactive
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleSaveAll}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4 text-sky-300" />
              <span>Simpan Presensi Dewan Guru</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: REKAPITULASI KEHADIRAN DEWAN GURU */}
      {activeSubTab === 'rekap' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Rekapitulasi Total Kehadiran 6 Guru (Tahun Ajaran 2026/2027)</span>
            <span className="text-slate-500 font-normal">Data otomatis terhitung</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Tenaga Pendidik</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4 text-center">Hadir (H)</th>
                  <th className="py-3 px-4 text-center">Sakit (S)</th>
                  <th className="py-3 px-4 text-center">Izin (I)</th>
                  <th className="py-3 px-4 text-center">Alpa (A)</th>
                  <th className="py-3 px-4 text-center font-bold">Total Hari Masuk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {teachers.map((t, idx) => {
                  const recs = teacherAtt.filter((a) => a.guru_id === t.id);
                  const h = recs.filter((a) => a.status === 'Hadir').length;
                  const s = recs.filter((a) => a.status === 'Sakit').length;
                  const iz = recs.filter((a) => a.status === 'Izin').length;
                  const a = recs.filter((a) => a.status === 'Alpa').length;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{t.nama}</td>
                      <td className="py-3.5 px-4 text-sky-800 font-semibold">{t.jabatan}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700 tabular-nums text-sm">{h}</td>
                      <td className="py-3.5 px-4 text-center text-sky-700 tabular-nums">{s}</td>
                      <td className="py-3.5 px-4 text-center text-amber-700 tabular-nums">{iz}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-700 tabular-nums">{a}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 tabular-nums">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100">
                          {h} Hari
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
