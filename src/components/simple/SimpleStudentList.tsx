import React, { useState } from 'react';
import { Student, ClassStructure, ClassName, Gender, AgeGroup } from '../../types';
import { storage, MASTER_PIN } from '../../services/storage';
import { Plus, Search, Edit2, Trash2, X, Check, Lock, AlertCircle } from 'lucide-react';

interface SimpleStudentListProps {
  students: Student[];
  classes: ClassStructure[];
}

export const SimpleStudentList: React.FC<SimpleStudentListProps> = ({ students, classes }) => {
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [search, setSearch] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Delete with PIN state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deletePin, setDeletePin] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');
  const [successBanner, setSuccessBanner] = useState<string>('');

  const [formName, setFormName] = useState('');
  const [formBirth, setFormBirth] = useState('2022-01-01');
  const [formGender, setFormGender] = useState<Gender>('L');
  const [formClass, setFormClass] = useState<ClassName>('Pelangi');

  const filtered = students.filter((s) => {
    const matchClass = selectedClass === 'Semua' || s.kelas === selectedClass;
    const matchSearch =
      s.nama_anak.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormName('');
    setFormBirth('2022-01-01');
    setFormGender('L');
    setFormClass('Pelangi');
    setShowAddModal(true);
  };

  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setFormName(st.nama_anak);
    setFormBirth(st.tanggal_lahir);
    setFormGender(st.jenis_kelamin);
    setFormClass(st.kelas);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let age: AgeGroup = 'PG / 3-4 Tahun';
    if (formClass === 'Bintang') age = 'TK A / 4-5 Tahun';
    else if (formClass === 'Matahari A' || formClass === 'Matahari B') age = 'TK B / 5-6 Tahun';

    if (editingStudent) {
      storage.updateStudent(editingStudent.student_id, {
        nama_anak: formName.trim(),
        tanggal_lahir: formBirth,
        jenis_kelamin: formGender,
        kelas: formClass,
        kelompok_usia: age,
      });
      setSuccessBanner(`Data murid ${formName} berhasil diperbarui.`);
    } else {
      const nextId = 'ANK' + String(students.length + 1).padStart(3, '0');
      storage.addStudent({
        student_id: nextId,
        nama_anak: formName.trim(),
        tanggal_lahir: formBirth,
        jenis_kelamin: formGender,
        kelas: formClass,
        kelompok_usia: age,
        status_aktif: true,
      });
      setSuccessBanner(`Murid baru ${formName} berhasil ditambahkan.`);
    }
    setShowAddModal(false);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  // Open delete PIN modal
  const handleOpenDelete = (st: Student) => {
    setStudentToDelete(st);
    setDeletePin('');
    setDeleteError('');
  };

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToDelete) return;

    const res = storage.deleteStudentWithPin(studentToDelete.student_id, deletePin);
    if (res.success) {
      setSuccessBanner(res.message);
      setStudentToDelete(null);
      setTimeout(() => setSuccessBanner(''), 4000);
    } else {
      setDeleteError(res.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">
          Data Murid ({students.length})
        </h2>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-sky-300" />
          <span>Tambah Siswa</span>
        </button>
      </div>

      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <Check className="w-5 h-5 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Filter & Cari */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {['Semua', 'Pelangi', 'Bintang', 'Matahari A', 'Matahari B'].map((cls) => {
            const count = cls === 'Semua' ? students.length : students.filter((s) => s.kelas === cls).length;
            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedClass === cls
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cls} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama murid..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">ID Siswa</th>
                <th className="py-3 px-4">Nama Lengkap Murid</th>
                <th className="py-3 px-4 text-center">L/P</th>
                <th className="py-3 px-4">Tanggal Lahir</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Kelompok Usia</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((st, i) => (
                <tr key={st.student_id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-center text-slate-400">{i + 1}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{st.student_id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 text-sm">{st.nama_anak}</td>
                  <td className="py-3 px-4 text-center font-bold">
                    <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                      {st.jenis_kelamin}
                    </span>
                  </td>
                  <td className="py-3 px-4 tabular-nums text-slate-600">{st.tanggal_lahir}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{st.kelas}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">{st.kelompok_usia}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(st)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        title="Ubah Nama/Data"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>

                      {/* Tombol Hapus dengan PIN */}
                      <button
                        onClick={() => handleOpenDelete(st)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        title="Hapus Murid (Perlu Kode 123456)"
                      >
                        <Trash2 className="w-3 h-3 text-rose-500" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStudent ? 'Edit Data Murid' : 'Tambah Murid Baru'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Anak</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rayyan"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    required
                    value={formBirth}
                    onChange={(e) => setFormBirth(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilihan Kelas</label>
                <select
                  value={formClass}
                  onChange={(e) => setFormClass(e.target.value as ClassName)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      Kelas {c.name} ({c.kelompok_usia})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Siswa dengan PIN 123456 */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-700">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Hapus Data Murid</h3>
              </div>
              <button
                onClick={() => setStudentToDelete(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl text-xs text-rose-900 space-y-1">
              <p>
                Anda akan menghapus data murid: <strong>{studentToDelete.nama_anak}</strong> ({studentToDelete.student_id}).
              </p>
              <p className="text-[11px] text-rose-700">
                Untuk mencegah ketidaksengajaan, masukkan kode kunci keamanan di bawah ini.
              </p>
            </div>

            {deleteError && (
              <div className="p-2.5 bg-rose-100 text-rose-900 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmDelete} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Masukkan Kode Kunci:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="123456"
                    value={deletePin}
                    onChange={(e) => setDeletePin(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono tracking-widest focus:outline-hidden focus:border-rose-500 focus:bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  *Kunci pengamanan resmi: 123456
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStudentToDelete(null)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Konfirmasi Hapus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
