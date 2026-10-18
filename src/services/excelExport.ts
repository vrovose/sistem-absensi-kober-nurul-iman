import * as XLSX from 'xlsx';
import { Student, StudentAttendance, TeacherAttendance, SchoolSettings, ClassStructure, Teacher } from '../types';

export interface ExportFilterParams {
  kelas?: string;
  semester?: string;
  tahunAjaran?: string;
  startDate?: string;
  endDate?: string;
  downloaderName: string;
}

export function exportFormalAttendanceExcel(
  settings: SchoolSettings,
  students: Student[],
  classes: ClassStructure[],
  teachers: Teacher[],
  studentAtt: StudentAttendance[],
  teacherAtt: TeacherAttendance[],
  filters: ExportFilterParams
) {
  const wb = XLSX.utils.book_new();
  const nowWIB = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB';

  // Apply filter to student attendance
  let filteredStudentAtt = studentAtt;
  if (filters.kelas && filters.kelas !== 'Semua Kelas') {
    filteredStudentAtt = filteredStudentAtt.filter((a) => a.kelas === filters.kelas);
  }

  // Filter students
  let filteredStudents = students;
  if (filters.kelas && filters.kelas !== 'Semua Kelas') {
    filteredStudents = filteredStudents.filter((s) => s.kelas === filters.kelas);
  }

  const uniqueLearningDates = Array.from(new Set(filteredStudentAtt.map((a) => a.tanggal))).sort();

  // -------------------------------------------------------------
  // SHEET 1: REKAP SEMESTER (DENGAN PENGGABUNGAN DATA MANUAL SEBELUMNYA)
  // -------------------------------------------------------------
  const sheet1Data: any[][] = [
    [settings.nama_sekolah.toUpperCase()],
    [`NPSN: ${settings.npsn} | Alamat: ${settings.alamat}, ${settings.kota}`],
    [`Kontak: ${settings.telepon} | WhatsApp: ${settings.whatsapp}`],
    [''],
    ['LAPORAN REKAPITULASI PRESENSI SISWA TERPADU'],
    [`Tahun Ajaran: ${settings.tahun_ajaran_aktif} | ${settings.semester_aktif}`],
    [`Kelas: ${filters.kelas || 'Semua Kelas'} | Dicetak oleh: ${filters.downloaderName} (${nowWIB})`],
    [''],
    [
      'No',
      'ID Siswa',
      'Nama Siswa',
      'L/P',
      'Kelas',
      'Hadir Sistem',
      'Hadir Manual Lalu',
      'TOTAL HADIR',
      'TOTAL SAKIT',
      'TOTAL IZIN',
      'TOTAL ALPA',
      'Total Hari Belajar',
      'Persentase Kehadiran (%)',
    ],
  ];

  filteredStudents.forEach((student, index) => {
    const studentRecords = filteredStudentAtt.filter((a) => a.student_id === student.student_id);
    const hadirSistem = studentRecords.filter((a) => a.status === 'Hadir').length;
    const sakitSistem = studentRecords.filter((a) => a.status === 'Sakit').length;
    const izinSistem = studentRecords.filter((a) => a.status === 'Izin').length;
    const alpaSistem = studentRecords.filter((a) => a.status === 'Alpa').length;

    // Combine with manual previous data
    const manualH = student.manual_hadir || 0;
    const manualS = student.manual_sakit || 0;
    const manualI = student.manual_izin || 0;
    const manualA = student.manual_alpa || 0;

    const totalHadir = hadirSistem + manualH;
    const totalSakit = sakitSistem + manualS;
    const totalIzin = izinSistem + manualI;
    const totalAlpa = alpaSistem + manualA;

    const totalHari = totalHadir + totalSakit + totalIzin + totalAlpa;
    const pct = totalHari > 0 ? ((totalHadir / totalHari) * 100).toFixed(1) + '%' : '100.0%';

    sheet1Data.push([
      index + 1,
      student.student_id,
      student.nama_anak,
      student.jenis_kelamin,
      student.kelas,
      hadirSistem,
      manualH,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpa,
      totalHari,
      pct,
    ]);
  });

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  ws1['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 32 },
    { wch: 6 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Rekap Semester');

  // -------------------------------------------------------------
  // SHEET 2: DETAIL LOG ABSENSI
  // -------------------------------------------------------------
  const sheet2Data: any[][] = [
    [settings.nama_sekolah.toUpperCase()],
    ['DETAIL LOG KEHADIRAN SISWA PER TANGGAL'],
    [`Dicetak oleh: ${filters.downloaderName} | Tanggal Cetak: ${nowWIB}`],
    [''],
    ['Tanggal', 'ID Siswa', 'Nama Siswa', 'Kelas', 'Status Kehadiran', 'Wali Kelas / Pencatat', 'Guru Bantu', 'Waktu'],
  ];

  filteredStudentAtt
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || a.nama_anak.localeCompare(b.nama_anak))
    .forEach((rec) => {
      sheet2Data.push([
        rec.tanggal,
        rec.student_id,
        rec.nama_anak,
        rec.kelas,
        rec.status,
        rec.dicatat_oleh_nama,
        rec.guru_bantu_nama ? `${rec.guru_bantu_nama} (${rec.guru_bantu_hadir ? 'Hadir' : 'Tidak'})` : '-',
        rec.waktu_simpan,
      ]);
    });

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2['!cols'] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 32 },
    { wch: 14 },
    { wch: 16 },
    { wch: 26 },
    { wch: 28 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Detail Absensi Siswa');

  // -------------------------------------------------------------
  // SHEET 3: REKAP KELAS
  // -------------------------------------------------------------
  const sheet3Data: any[][] = [
    [settings.nama_sekolah.toUpperCase()],
    ['REKAPITULASI KEHADIRAN 4 KELAS'],
    [`Tahun Ajaran: ${settings.tahun_ajaran_aktif} | ${settings.semester_aktif}`],
    [''],
    ['No', 'Nama Kelas', 'Kelompok Usia', 'Wali Kelas', 'Jumlah Siswa', 'Laki-Laki', 'Perempuan', 'Total Kehadiran (H)'],
  ];

  classes.forEach((cls, idx) => {
    const classStudents = students.filter((s) => s.kelas === cls.name && s.status_aktif);
    const countL = classStudents.filter((s) => s.jenis_kelamin === 'L').length;
    const countP = classStudents.filter((s) => s.jenis_kelamin === 'P').length;

    const classAtt = studentAtt.filter((a) => a.kelas === cls.name);
    const hadirDigital = classAtt.filter((a) => a.status === 'Hadir').length;
    const hadirManual = classStudents.reduce((acc, s) => acc + (s.manual_hadir || 0), 0);
    const totalH = hadirDigital + hadirManual;

    sheet3Data.push([
      idx + 1,
      cls.name,
      cls.kelompok_usia,
      cls.wali_kelas_nama,
      classStudents.length,
      countL,
      countP,
      totalH,
    ]);
  });

  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
  ws3['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 20 },
    { wch: 26 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Rekap Kelas');

  // -------------------------------------------------------------
  // SHEET 4: KEHADIRAN GURU
  // -------------------------------------------------------------
  const sheet4Data: any[][] = [
    [settings.nama_sekolah.toUpperCase()],
    ['REKAPITULASI PRESENSI 6 DEWAN GURU & TENAGA KEPENDIDIKAN'],
    [`Dicetak oleh: ${filters.downloaderName} | Tanggal Cetak: ${nowWIB}`],
    [''],
    ['No', 'Nama Guru', 'Jabatan', 'Total Hadir', 'Total Sakit', 'Total Izin', 'Total Alpa'],
  ];

  teachers.forEach((teacher, idx) => {
    const recs = teacherAtt.filter((a) => a.guru_id === teacher.id);
    const h = recs.filter((a) => a.status === 'Hadir').length;
    const s = recs.filter((a) => a.status === 'Sakit').length;
    const iz = recs.filter((a) => a.status === 'Izin').length;
    const al = recs.filter((a) => a.status === 'Alpa').length;

    sheet4Data.push([
      idx + 1,
      teacher.nama,
      teacher.jabatan,
      h,
      s,
      iz,
      al,
    ]);
  });

  const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
  ws4['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 32 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws4, 'Kehadiran Guru');

  const cleanClassName = filters.kelas ? filters.kelas.replace(/\s+/g, '_') : 'Semua_Kelas';
  const fileName = `Rekap_Absensi_TK_Nurul_Iman_${cleanClassName}_${new Date().toISOString().split('T')[0]}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

export function exportAttendanceCSV(
  studentAtt: StudentAttendance[],
  fileName = 'Data_Absensi_Siswa_TK_Nurul_Iman.csv'
) {
  const headers = ['Tanggal', 'ID Siswa', 'Nama Siswa', 'Kelas', 'Status Kehadiran', 'Wali Kelas / Pencatat', 'Guru Bantu', 'Waktu Simpan'];
  const rows = studentAtt.map((a) => [
    a.tanggal,
    a.student_id,
    `"${a.nama_anak.replace(/"/g, '""')}"`,
    a.kelas,
    a.status,
    `"${a.dicatat_oleh_nama.replace(/"/g, '""')}"`,
    `"${(a.guru_bantu_nama || '-').replace(/"/g, '""')}"`,
    `"${a.waktu_simpan.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
