export type Gender = 'L' | 'P';

export type ClassName = 'Pelangi' | 'Bintang' | 'Matahari A' | 'Matahari B';

export type AgeGroup = 'PG / 3-4 Tahun' | 'TK A / 4-5 Tahun' | 'TK B / 5-6 Tahun';

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface Student {
  student_id: string;
  nama_anak: string;
  tanggal_lahir: string;
  jenis_kelamin: Gender;
  kelas: ClassName;
  kelompok_usia: AgeGroup;
  status_aktif: boolean;
  catatan_kesehatan?: string;
  persetujuan_publikasi: boolean;
  // Manual prior attendance adjustment for mid-year setup
  manual_hadir?: number;
  manual_sakit?: number;
  manual_izin?: number;
  manual_alpa?: number;
}

export interface Teacher {
  id: string;
  nip_atau_nik: string;
  nama: string;
  jenis_kelamin: Gender;
  jabatan: string;
  kontak: string;
  email: string;
  is_active: boolean;
  tampil_publik: boolean;
}

export interface ClassStructure {
  id: string;
  name: ClassName;
  kelompok_usia: AgeGroup;
  urutan: number; // 1: Pelangi, 2: Bintang, 3: Matahari A, 4: Matahari B
  wali_kelas_id: string;
  wali_kelas_nama: string;
  guru_pendamping_id: string;
  guru_pendamping_nama: string;
}

export interface TeacherAttendance {
  id: string;
  guru_id: string;
  guru_nama: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:mm WIB
  status: AttendanceStatus;
  catatan?: string;
  dicatat_oleh: string;
}

export interface StudentAttendance {
  id: string;
  student_id: string;
  nama_anak: string;
  kelas: ClassName;
  tanggal: string; // YYYY-MM-DD
  status: AttendanceStatus;
  dicatat_oleh_id: string;
  dicatat_oleh_nama: string;
  waktu_simpan: string;
  guru_bantu_nama?: string;
  guru_bantu_hadir?: boolean;
}

export interface SchoolSettings {
  nama_sekolah: string;
  npsn: string;
  alamat: string;
  kota: string;
  telepon: string;
  whatsapp: string;
  email: string;
  website: string;
  kepala_sekolah_nama: string;
  tahun_ajaran_aktif: string;
  semester_aktif: string;
  jam_belajar_murid: string; // 08.00 - 10.30 WIB
  jam_kerja_guru: string; // 07.30 - 13.00 WIB
  biaya_pendaftaran: string;
}
