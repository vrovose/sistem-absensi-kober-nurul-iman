import React, { useState, useEffect } from 'react';
import { Student, ClassStructure, ClassName, AttendanceStatus, StudentAttendance, Teacher, Gender } from '../../types';
import { storage } from '../../services/storage';
import {
  Check,
  CheckCheck,
  Save,
  UserCheck,
  ArrowRight,
  RotateCcw,
  Search,
  Edit2,
  X,
  ChevronDown
} from 'lucide-react';

interface SimpleStudentAttendanceProps {
  students: Student[];
  classes: ClassStructure[];
  teachers: Teacher[];
  studentAtt: StudentAttendance[];
  currentUserName: string;
}

export const SimpleStudentAttendance: React.FC<SimpleStudentAttendanceProps> = ({
  students,
  classes,
  teachers,
  studentAtt,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Stage: 'select_class' | 'session_active'
  const [stage, setStage] = useState<'select_class' | 'session_active'>('select_class');

  // Step 1 selections
  const [selectedClass, setSelectedClass] = useState<ClassName>('Pelangi');
  const [selectedWaliName, setSelectedWaliName] = useState<string>('Wigati, S.Pd');

  // Step 2 classroom controls
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedGuruBantu, setSelectedGuruBantu] = useState<string>('none');
  const [guruBantuHadir, setGuruBantuHadir] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormGender, setEditFormGender] = useState<Gender>('L');

  const waliTeachers = teachers.filter(
    (t) =>
      t.jabatan.toLowerCase().includes('wali') ||
      t.jabatan.toLowerCase().includes('kepala') ||
      t.jabatan.toLowerCase().includes('operator')
  );

  const assistantTeachers = teachers.filter(
    (t) =>
      t.jabatan.toLowerCase().includes('bantu') ||
      t.jabatan.toLowerCase().includes('operator')
  );

  const handleClassSelectionChange = (newClass: ClassName) => {
    setSelectedClass(newClass);
    if (newClass === 'Pelangi' || newClass === 'Bintang') {
      const wigati = teachers.find((t) => t.nama.includes('Wigati'));
      setSelectedWaliName(wigati ? wigati.nama : 'Wigati, S.Pd');
    } else {
      const ratini = teachers.find((t) => t.nama.includes('Ratini'));
      setSelectedWaliName(ratini ? ratini.nama : 'Ratini, S.Pd');
    }
  };

  const classStudents = students.filter((s) => s.kelas === selectedClass && s.status_aktif);

  useEffect(() => {
    const existing = studentAtt.filter((a) => a.kelas === selectedClass && a.tanggal === selectedDate);
    const newMap: Record<string, AttendanceStatus> = {};

    if (existing.length > 0) {
      existing.forEach((r) => {
        newMap[r.student_id] = r.status;
      });
      if (existing[0].guru_bantu_nama) {
        setSelectedGuruBantu(existing[0].guru_bantu_nama);
        setGuruBantuHadir(existing[0].guru_bantu_hadir ?? true);
      }
    } else {
      classStudents.forEach((st) => {
        newMap[st.student_id] = 'Hadir';
      });
    }

    setAttendanceMap(newMap);
    setSaveSuccessMsg('');
  }, [selectedClass, selectedDate, studentAtt, stage]);

  const handleEnterClass = () => {
    setStage('session_active');
    setSaveSuccessMsg('');
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach((st) => {
      updated[st.student_id] = 'Hadir';
    });
    setAttendanceMap(updated);
    setSaveSuccessMsg('');
  };

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setSaveSuccessMsg('');
  };

  const handleSaveAttendance = () => {
    const records = classStudents.map((st) => ({
      student_id: st.student_id,
      nama_anak: st.nama_anak,
      status: attendanceMap[st.student_id] || 'Hadir',
    }));

    const bantuName = selectedGuruBantu !== 'none' ? selectedGuruBantu : null;

    const res = storage.saveClassAttendanceSession(
      selectedClass,
      selectedDate,
      selectedWaliName,
      bantuName,
      guruBantuHadir,
      records
    );

    if (res.success) {
      setSaveSuccessMsg(`Presensi kelas ${selectedClass} berhasil disimpan.`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  const handleOpenEditStudent = (st: Student) => {
    setEditingStudent(st);
    setEditFormName(st.nama_anak);
    setEditFormGender(st.jenis_kelamin);
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editFormName.trim()) return;

    storage.updateStudent(editingStudent.student_id, {
      nama_anak: editFormName.trim(),
      jenis_kelamin: editFormGender,
    });
    setEditingStudent(null);
  };

  const filteredClassStudents = classStudents.filter((st) =>
    st.nama_anak.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const statusConfigs: Array<{
    status: AttendanceStatus;
    label: string;
    activeClass: string;
    inactiveClass: string;
  }> = [
    {
      status: 'Hadir',
      label: 'Hadir',
      activeClass: 'bg-emerald-600 text-white font-bold',
      inactiveClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    },
    {
      status: 'Sakit',
      label: 'Sakit',
      activeClass: 'bg-sky-600 text-white font-bold',
      inactiveClass: 'bg-sky-50 text-sky-800 border border-sky-200',
    },
    {
      status: 'Izin',
      label: 'Izin',
      activeClass: 'bg-amber-600 text-white font-bold',
      inactiveClass: 'bg-amber-50 text-amber-800 border border-amber-200',
    },
    {
      status: 'Alpa',
      label: 'Alpa',
      activeClass: 'bg-rose-600 text-white font-bold',
      inactiveClass: 'bg-rose-50 text-rose-800 border border-rose-200',
    },
  ];

  // STEP 1: PILIH KELAS & WALI KELAS
  if (stage === 'select_class') {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <UserCheck className="w-5 h-5 text-sky-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Pilih Ruang Kelas
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Kelas
              </label>
              <div className="grid grid-cols-2 gap-2">
                {classes.map((cls) => {
                  const isSelected = selectedClass === cls.name;
                  const count = students.filter((s) => s.kelas === cls.name && s.status_aktif).length;
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => handleClassSelectionChange(cls.name)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">Kelas {cls.name}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-sky-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {count}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {cls.kelompok_usia}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Wali Kelas yang Hadir
              </label>
              <div className="relative">
                <select
                  value={selectedWaliName}
                  onChange={(e) => setSelectedWaliName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-sky-500 appearance-none pr-8"
                >
                  {waliTeachers.map((t) => (
                    <option key={t.id} value={t.nama}>
                      {t.nama} ({t.jabatan})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleEnterClass}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Saya Masuk Kelas / Saya Hadir</span>
              <ArrowRight className="w-4 h-4 text-sky-300" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: LEMBAR PRESENSI
  return (
    <div className="space-y-4">
      {/* Kontrol Kelas */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
              Kelas {selectedClass}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              Wali: <strong>{selectedWaliName}</strong>
            </span>
          </div>

          <button
            onClick={() => setStage('select_class')}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Ganti</span>
          </button>
        </div>

        {/* Toolbar: Guru Bantu, Checklist, Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs">
          <div className="sm:col-span-5">
            <label className="block text-slate-600 font-semibold mb-1">Guru Bantu:</label>
            <select
              value={selectedGuruBantu}
              onChange={(e) => setSelectedGuruBantu(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-sky-500"
            >
              <option value="none">-- Tanpa Guru Bantu --</option>
              {assistantTeachers.map((t) => (
                <option key={t.id} value={t.nama}>
                  {t.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 pt-1 sm:pt-4">
            <label
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                selectedGuruBantu === 'none'
                  ? 'opacity-40 bg-slate-50 border-slate-200 cursor-not-allowed'
                  : guruBantuHadir
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                  : 'bg-slate-50 border-slate-300 text-slate-600'
              }`}
            >
              <input
                type="checkbox"
                disabled={selectedGuruBantu === 'none'}
                checked={guruBantuHadir && selectedGuruBantu !== 'none'}
                onChange={(e) => setGuruBantuHadir(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300"
              />
              <span className="text-xs">Guru Bantu Hadir</span>
            </label>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-slate-600 font-semibold mb-1">Tanggal:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Semua Hadir</span>
            </button>

            <div className="relative flex-1 sm:w-48">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari murid..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
          </div>

          <button
            onClick={handleSaveAttendance}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-sky-300" />
            <span>Simpan Presensi</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* List Murid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Daftar Murid ({filteredClassStudents.length})</span>
          <span className="font-mono text-slate-500">{selectedDate}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredClassStudents.map((st, idx) => {
            const currentStatus = attendanceMap[st.student_id] || 'Hadir';
            return (
              <div
                key={st.student_id}
                className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/70"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">
                        {st.nama_anak}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        ({st.jenis_kelamin})
                      </span>
                      <button
                        onClick={() => handleOpenEditStudent(st)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-sm"
                        title="Edit nama"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4 Status Buttons */}
                <div className="grid grid-cols-4 sm:flex items-center gap-1">
                  {statusConfigs.map((cfg) => {
                    const isSelected = currentStatus === cfg.status;
                    return (
                      <button
                        key={cfg.status}
                        onClick={() => handleSetStatus(st.student_id, cfg.status)}
                        className={`py-1.5 px-2.5 sm:px-3 text-xs font-bold rounded-lg transition-colors text-center ${
                          isSelected ? cfg.activeClass : cfg.inactiveClass
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

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSaveAttendance}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            <Save className="w-3.5 h-3.5 text-sky-300" />
            <span>Simpan Presensi</span>
          </button>
        </div>
      </div>

      {/* Modal Edit Murid */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Ubah Data Siswa</h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editFormName}
                  onChange={(e) => setEditFormName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                <select
                  value={editFormGender}
                  onChange={(e) => setEditFormGender(e.target.value as Gender)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                >
                  <option value="L">Laki-Laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3 py-1 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-2xs"
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
