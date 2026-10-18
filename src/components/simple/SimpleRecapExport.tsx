import React, { useState } from 'react';
import { Student, ClassStructure, StudentAttendance, TeacherAttendance, SchoolSettings, Teacher } from '../../types';
import { exportFormalAttendanceExcel, exportAttendanceCSV } from '../../services/excelExport';
import { storage } from '../../services/storage';
import { FileSpreadsheet, Download, Filter, CheckCircle2, Edit3, X, Save, Plus } from 'lucide-react';

interface SimpleRecapExportProps {
  students: Student[];
  classes: ClassStructure[];
  teachers: Teacher[];
  studentAtt: StudentAttendance[];
  teacherAtt: TeacherAttendance[];
  settings: SchoolSettings;
  currentUserName: string;
}

export const SimpleRecapExport: React.FC<SimpleRecapExportProps> = ({
  students,
  classes,
  teachers,
  studentAtt,
  teacherAtt,
  settings,
  currentUserName,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('Semua Kelas');
  const [downloadNotice, setDownloadNotice] = useState<string>('');

  // Manual Adjustment Modal state
  const [manualModalStudent, setManualModalStudent] = useState<Student | null>(null);
  const [manualForm, setManualForm] = useState({
    hadir: 0,
    sakit: 0,
    izin: 0,
    alpa: 0,
  });

  const filteredStudents = selectedClass === 'Semua Kelas'
    ? students
    : students.filter((s) => s.kelas === selectedClass);

  // Totals calculation
  let totalHadirSemua = 0;
  let totalSakitSemua = 0;
  let totalIzinSemua = 0;
  let totalAlpaSemua = 0;

  filteredStudents.forEach((st) => {
    const recs = studentAtt.filter((a) => a.student_id === st.student_id);
    const hDig = recs.filter((a) => a.status === 'Hadir').length;
    const sDig = recs.filter((a) => a.status === 'Sakit').length;
    const iDig = recs.filter((a) => a.status === 'Izin').length;
    const aDig = recs.filter((a) => a.status === 'Alpa').length;

    totalHadirSemua += hDig + (st.manual_hadir || 0);
    totalSakitSemua += sDig + (st.manual_sakit || 0);
    totalIzinSemua += iDig + (st.manual_izin || 0);
    totalAlpaSemua += aDig + (st.manual_alpa || 0);
  });

  const handleOpenManualModal = (st: Student) => {
    setManualModalStudent(st);
    setManualForm({
      hadir: st.manual_hadir || 0,
      sakit: st.manual_sakit || 0,
      izin: st.manual_izin || 0,
      alpa: st.manual_alpa || 0,
    });
  };

  const handleSaveManualAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualModalStudent) return;

    storage.updateStudentManualAttendance(manualModalStudent.student_id, {
      hadir: Number(manualForm.hadir) || 0,
      sakit: Number(manualForm.sakit) || 0,
      izin: Number(manualForm.izin) || 0,
      alpa: Number(manualForm.alpa) || 0,
    });

    setManualModalStudent(null);
    setDownloadNotice(`Data kehadiran manual sebelumnya untuk ${manualModalStudent.nama_anak} berhasil diperbarui.`);
    setTimeout(() => setDownloadNotice(''), 4000);
  };

  const handleDownloadExcel = () => {
    exportFormalAttendanceExcel(settings, students, classes, teachers, studentAtt, teacherAtt, {
      kelas: selectedClass,
      downloaderName: currentUserName,
    });
    setDownloadNotice('File Excel resmi (.xlsx 4-Sheet) berhasil diunduh ke perangkat Anda.');
    setTimeout(() => setDownloadNotice(''), 4000);
  };

  const handleDownloadCSV = () => {
    exportAttendanceCSV(studentAtt);
    setDownloadNotice('File CSV detail presensi berhasil diunduh.');
    setTimeout(() => setDownloadNotice(''), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Kartu Ringkasan & Tombol Download */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Rekap Kehadiran</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Unduh CSV
          </button>

          <button
            onClick={handleDownloadExcel}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* 4 Angka Ringkas Tergabung */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-xs text-slate-500 font-semibold block">Total Hadir (H)</span>
          <span className="text-2xl font-extrabold text-emerald-600 tabular-nums">{totalHadirSemua}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-xs text-slate-500 font-semibold block">Total Sakit (S)</span>
          <span className="text-2xl font-extrabold text-sky-600 tabular-nums">{totalSakitSemua}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-xs text-slate-500 font-semibold block">Total Izin (I)</span>
          <span className="text-2xl font-extrabold text-amber-600 tabular-nums">{totalIzinSemua}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-xs text-slate-500 font-semibold block">Total Alpa (A)</span>
          <span className="text-2xl font-extrabold text-rose-600 tabular-nums">{totalAlpaSemua}</span>
        </div>
      </div>

      {/* Filter Kelas */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-700">Filter Tampilan Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
          >
            <option value="Semua Kelas">Semua Kelas ({students.length} Siswa)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                Kelas {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Rekapitulasi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4 w-10 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4 text-center">Hadir (Sistem)</th>
                <th className="py-3 px-4 text-center bg-sky-50/50">Hadir (Manual Lalu)</th>
                <th className="py-3 px-4 text-center font-bold text-emerald-700">TOTAL HADIR</th>
                <th className="py-3 px-4 text-center text-sky-700">Sakit</th>
                <th className="py-3 px-4 text-center text-amber-700">Izin</th>
                <th className="py-3 px-4 text-center text-rose-700">Alpa</th>
                <th className="py-3 px-4 text-center font-bold">Persentase</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredStudents.map((st, i) => {
                const recs = studentAtt.filter((a) => a.student_id === st.student_id);
                const hDig = recs.filter((a) => a.status === 'Hadir').length;
                const sDig = recs.filter((a) => a.status === 'Sakit').length;
                const iDig = recs.filter((a) => a.status === 'Izin').length;
                const aDig = recs.filter((a) => a.status === 'Alpa').length;

                const manH = st.manual_hadir || 0;
                const manS = st.manual_sakit || 0;
                const manI = st.manual_izin || 0;
                const manA = st.manual_alpa || 0;

                const totH = hDig + manH;
                const totS = sDig + manS;
                const totI = iDig + manI;
                const totA = aDig + manA;
                const totHari = totH + totS + totI + totA;
                const pct = totHari > 0 ? ((totH / totHari) * 100).toFixed(0) + '%' : '100%';

                return (
                  <tr key={st.student_id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-center text-slate-400">{i + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{st.nama_anak}</td>
                    <td className="py-3 px-4">{st.kelas}</td>
                    <td className="py-3 px-4 text-center tabular-nums">{hDig}</td>
                    <td className="py-3 px-4 text-center tabular-nums bg-sky-50/40 font-semibold text-sky-900">
                      {manH > 0 ? `+${manH}` : '0'}
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-emerald-700 tabular-nums text-sm">
                      {totH}
                    </td>
                    <td className="py-3 px-4 text-center text-sky-700 tabular-nums">{totS}</td>
                    <td className="py-3 px-4 text-center text-amber-700 tabular-nums">{totI}</td>
                    <td className="py-3 px-4 text-center font-bold text-rose-700 tabular-nums">{totA}</td>
                    <td className="py-3 px-4 text-center font-bold tabular-nums">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                        {pct}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenManualModal(st)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        <span>Input Manual</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Manual Tambahan */}
      {manualModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Input Kehadiran Sebelumnya</h3>
                <p className="text-xs text-slate-500">{manualModalStudent.nama_anak} ({manualModalStudent.kelas})</p>
              </div>
              <button
                onClick={() => setManualModalStudent(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Gunakan form ini untuk memasukkan akumulasi absensi fisik sebelum sistem ini digunakan:
            </p>

            <form onSubmit={handleSaveManualAttendance} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-emerald-800 mb-1">Hadir Lalu (Hari)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualForm.hadir}
                    onChange={(e) => setManualForm({ ...manualForm, hadir: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-lg font-bold text-emerald-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sky-800 mb-1">Sakit Lalu (Hari)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualForm.sakit}
                    onChange={(e) => setManualForm({ ...manualForm, sakit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-sky-200 rounded-lg font-bold text-sky-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-amber-800 mb-1">Izin Lalu (Hari)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualForm.izin}
                    onChange={(e) => setManualForm({ ...manualForm, izin: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200 rounded-lg font-bold text-amber-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-rose-800 mb-1">Alpa Lalu (Hari)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualForm.alpa}
                    onChange={(e) => setManualForm({ ...manualForm, alpa: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-lg font-bold text-rose-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManualModalStudent(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-sky-300" />
                  <span>Simpan Data Lalu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
