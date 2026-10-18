import {
  Student,
  Teacher,
  ClassStructure,
  SchoolSettings,
  StudentAttendance,
  TeacherAttendance,
  AttendanceStatus,
  ClassName
} from '../types';

import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_SETTINGS,
  generateEmptyAttendance
} from '../data/initialData';

const STORAGE_KEYS = {
  STUDENTS: 'tknuruliman_students_v3',
  TEACHERS: 'tknuruliman_teachers_v3',
  CLASSES: 'tknuruliman_classes_v3',
  SETTINGS: 'tknuruliman_settings_v3',
  STUDENT_ATT: 'tknuruliman_student_att_v3',
  TEACHER_ATT: 'tknuruliman_teacher_att_v3',
  AUTH: 'tknuruliman_auth_v3',
  ACTIVE_USER: 'tknuruliman_active_name_v3',
};

export const MASTER_PIN = '123456';
export const ADMIN_CREDENTIALS = {
  username: 'AdminKOBERNurul_Iman',
  password: 'TK_Nurul_Iman_Admin#123',
};

class StorageService {
  private students: Student[] = [];
  private teachers: Teacher[] = [];
  private classes: ClassStructure[] = [];
  private settings: SchoolSettings = INITIAL_SETTINGS;
  private studentAtt: StudentAttendance[] = [];
  private teacherAtt: TeacherAttendance[] = [];
  private isAuthenticated: boolean = false;
  private activeUserName: string = 'Salma Ghaida (Operator)';
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      this.isAuthenticated = storedAuth === 'true';

      const storedUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      this.activeUserName = storedUser || 'Salma Ghaida (Operator)';

      const storedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      this.students = storedStudents ? JSON.parse(storedStudents) : [...INITIAL_STUDENTS];
      this.persist(STORAGE_KEYS.STUDENTS, this.students);

      const storedTeachers = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      this.teachers = storedTeachers ? JSON.parse(storedTeachers) : [...INITIAL_TEACHERS];
      this.persist(STORAGE_KEYS.TEACHERS, this.teachers);

      const storedClasses = localStorage.getItem(STORAGE_KEYS.CLASSES);
      this.classes = storedClasses ? JSON.parse(storedClasses) : [...INITIAL_CLASSES];
      this.persist(STORAGE_KEYS.CLASSES, this.classes);

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.alamat?.includes('Bekasi') || parsed.nama_sekolah?.includes('TK')) {
          this.settings = { ...INITIAL_SETTINGS };
          this.persist(STORAGE_KEYS.SETTINGS, this.settings);
        } else {
          this.settings = parsed;
        }
      } else {
        this.settings = { ...INITIAL_SETTINGS };
        this.persist(STORAGE_KEYS.SETTINGS, this.settings);
      }

      // Attendance begins at 0 as requested by user
      const storedStudentAtt = localStorage.getItem(STORAGE_KEYS.STUDENT_ATT);
      const storedTeacherAtt = localStorage.getItem(STORAGE_KEYS.TEACHER_ATT);
      if (storedStudentAtt && storedTeacherAtt) {
        this.studentAtt = JSON.parse(storedStudentAtt);
        this.teacherAtt = JSON.parse(storedTeacherAtt);
      } else {
        const { studentsAtt, teachersAtt } = generateEmptyAttendance();
        this.studentAtt = studentsAtt;
        this.teacherAtt = teachersAtt;
        this.persist(STORAGE_KEYS.STUDENT_ATT, this.studentAtt);
        this.persist(STORAGE_KEYS.TEACHER_ATT, this.teacherAtt);
      }
    } catch (e) {
      console.error('Storage initialization error:', e);
    }
  }

  private persist(key: string, data: any) {
    try {
      localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to persist key ${key}:`, e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- AUTH ---
  public checkAuth(): boolean {
    return this.isAuthenticated;
  }

  public login(username: string, password: string): { success: boolean; message: string } {
    const validUsernames = ['adminkobernurul_iman', 'admintknurul_iman', 'admin'];
    const validPasswords = ['TK_Nurul_Iman_Admin#123', 'KOBER_Nurul_Iman_Admin#123', 'ADMIN#123_KOBER'];
    
    if (
      validUsernames.includes(username.trim().toLowerCase()) &&
      (validPasswords.includes(password) || password === ADMIN_CREDENTIALS.password)
    ) {
      this.isAuthenticated = true;
      this.persist(STORAGE_KEYS.AUTH, 'true');
      this.notify();
      return { success: true, message: 'Login berhasil.' };
    }
    return { success: false, message: 'Username atau kata sandi salah.' };
  }

  public logout() {
    this.isAuthenticated = false;
    this.persist(STORAGE_KEYS.AUTH, 'false');
    this.notify();
  }

  public getActiveUserName(): string {
    return this.activeUserName;
  }

  public setActiveUserName(name: string) {
    this.activeUserName = name;
    this.persist(STORAGE_KEYS.ACTIVE_USER, name);
    this.notify();
  }

  // --- STUDENTS ---
  public getStudents(): Student[] {
    return [...this.students];
  }

  public getActiveStudentsByClass(kelas: ClassName): Student[] {
    return this.students.filter((s) => s.kelas === kelas && s.status_aktif);
  }

  public addStudent(studentData: Omit<Student, 'persetujuan_publikasi'> & { persetujuan_publikasi?: boolean }): { success: boolean; message: string } {
    if (this.students.some((s) => s.student_id.toLowerCase() === studentData.student_id.toLowerCase())) {
      return { success: false, message: `ID Siswa ${studentData.student_id} sudah terdaftar.` };
    }
    const newStudent: Student = {
      ...studentData,
      persetujuan_publikasi: true,
      manual_hadir: studentData.manual_hadir || 0,
      manual_sakit: studentData.manual_sakit || 0,
      manual_izin: studentData.manual_izin || 0,
      manual_alpa: studentData.manual_alpa || 0,
    };
    this.students.push(newStudent);
    this.persist(STORAGE_KEYS.STUDENTS, this.students);
    this.notify();
    return { success: true, message: `Siswa ${newStudent.nama_anak} berhasil ditambahkan.` };
  }

  public updateStudent(student_id: string, updates: Partial<Student>): { success: boolean; message: string } {
    const index = this.students.findIndex((s) => s.student_id === student_id);
    if (index === -1) return { success: false, message: 'Siswa tidak ditemukan.' };

    this.students[index] = {
      ...this.students[index],
      ...updates,
    };
    this.persist(STORAGE_KEYS.STUDENTS, this.students);
    this.notify();
    return { success: true, message: 'Data siswa berhasil diperbarui.' };
  }

  public deleteStudentWithPin(student_id: string, pin: string): { success: boolean; message: string } {
    if (pin !== MASTER_PIN) {
      return { success: false, message: 'Kode kunci salah. Masukkan kode 123456 untuk menghapus siswa.' };
    }
    const target = this.students.find((s) => s.student_id === student_id);
    if (!target) return { success: false, message: 'Siswa tidak ditemukan.' };

    this.students = this.students.filter((s) => s.student_id !== student_id);
    // Also remove attendance records for this student
    this.studentAtt = this.studentAtt.filter((a) => a.student_id !== student_id);

    this.persist(STORAGE_KEYS.STUDENTS, this.students);
    this.persist(STORAGE_KEYS.STUDENT_ATT, this.studentAtt);
    this.notify();
    return { success: true, message: `Siswa ${target.nama_anak} (${target.student_id}) berhasil dihapus.` };
  }

  public updateStudentManualAttendance(
    student_id: string,
    manual: { hadir: number; sakit: number; izin: number; alpa: number }
  ) {
    const index = this.students.findIndex((s) => s.student_id === student_id);
    if (index !== -1) {
      this.students[index] = {
        ...this.students[index],
        manual_hadir: manual.hadir,
        manual_sakit: manual.sakit,
        manual_izin: manual.izin,
        manual_alpa: manual.alpa,
      };
      this.persist(STORAGE_KEYS.STUDENTS, this.students);
      this.notify();
    }
  }

  // --- CLASSES ---
  public getClasses(): ClassStructure[] {
    return [...this.classes].sort((a, b) => a.urutan - b.urutan);
  }

  // --- TEACHERS ---
  public getTeachers(): Teacher[] {
    return [...this.teachers];
  }

  public updateTeacherWithPin(
    teacherId: string,
    updates: Partial<Teacher>,
    pin: string
  ): { success: boolean; message: string } {
    if (pin !== MASTER_PIN) {
      return { success: false, message: 'Kode kunci salah. Masukkan kode 123456 untuk mengonfirmasi perubahan.' };
    }

    const idx = this.teachers.findIndex((t) => t.id === teacherId);
    if (idx === -1) return { success: false, message: 'Data guru tidak ditemukan.' };

    this.teachers[idx] = {
      ...this.teachers[idx],
      ...updates,
    };
    this.persist(STORAGE_KEYS.TEACHERS, this.teachers);
    this.notify();
    return { success: true, message: `Data ${this.teachers[idx].nama} berhasil diperbarui.` };
  }

  // --- TEACHER ATTENDANCE ---
  public getTeacherAttendance(): TeacherAttendance[] {
    return [...this.teacherAtt];
  }

  public recordTeacherAttendance(
    guru_id: string,
    guru_nama: string,
    tanggal: string,
    status: AttendanceStatus,
    catatan?: string
  ): { success: boolean; message: string } {
    const existingIndex = this.teacherAtt.findIndex((t) => t.guru_id === guru_id && t.tanggal === tanggal);
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB';

    if (existingIndex !== -1) {
      this.teacherAtt[existingIndex] = {
        ...this.teacherAtt[existingIndex],
        waktu: nowTime,
        status,
        catatan,
        dicatat_oleh: this.activeUserName,
      };
    } else {
      this.teacherAtt.push({
        id: `TATT_${guru_id}_${tanggal}`,
        guru_id,
        guru_nama,
        tanggal,
        waktu: nowTime,
        status,
        catatan,
        dicatat_oleh: this.activeUserName,
      });
    }

    this.persist(STORAGE_KEYS.TEACHER_ATT, this.teacherAtt);
    this.notify();
    return { success: true, message: `Presensi ${guru_nama} tercatat: ${status}.` };
  }

  // --- STUDENT ATTENDANCE (AND CONNECTED TEACHER ATTENDANCE) ---
  public getStudentAttendance(): StudentAttendance[] {
    return [...this.studentAtt];
  }

  public saveClassAttendanceSession(
    kelas: ClassName,
    tanggal: string,
    waliKelasNama: string,
    guruBantuNama: string | null,
    guruBantuHadir: boolean,
    records: Array<{ student_id: string; nama_anak: string; status: AttendanceStatus }>
  ): { success: boolean; message: string } {
    const nowTimeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB';

    // 1. Save all student attendance records
    records.forEach((rec) => {
      const existingIdx = this.studentAtt.findIndex((a) => a.student_id === rec.student_id && a.tanggal === tanggal);
      if (existingIdx !== -1) {
        this.studentAtt[existingIdx] = {
          ...this.studentAtt[existingIdx],
          status: rec.status,
          waktu_simpan: nowTimeStr,
          dicatat_oleh_nama: waliKelasNama,
          guru_bantu_nama: guruBantuNama || undefined,
          guru_bantu_hadir: guruBantuHadir,
        };
      } else {
        this.studentAtt.push({
          id: `SATT_${rec.student_id}_${tanggal}`,
          student_id: rec.student_id,
          nama_anak: rec.nama_anak,
          kelas,
          tanggal,
          status: rec.status,
          dicatat_oleh_id: 'USR_GURU',
          dicatat_oleh_nama: waliKelasNama,
          waktu_simpan: nowTimeStr,
          guru_bantu_nama: guruBantuNama || undefined,
          guru_bantu_hadir: guruBantuHadir,
        });
      }
    });

    // 2. CONNECT TO TEACHER ATTENDANCE:
    // Mark Wali Kelas as "Hadir" on this date
    const waliTeacher = this.teachers.find((t) => t.nama.toLowerCase().includes(waliKelasNama.toLowerCase().split(',')[0]));
    if (waliTeacher) {
      this.recordTeacherAttendance(waliTeacher.id, waliTeacher.nama, tanggal, 'Hadir', `Masuk Mengajar Kelas ${kelas}`);
    }

    // If guru bantu is selected and checked present, mark Guru Bantu as "Hadir" on this date too!
    if (guruBantuNama && guruBantuHadir) {
      const bantuTeacher = this.teachers.find((t) => t.nama.toLowerCase().includes(guruBantuNama.toLowerCase().split(',')[0]));
      if (bantuTeacher) {
        this.recordTeacherAttendance(bantuTeacher.id, bantuTeacher.nama, tanggal, 'Hadir', `Mendampingi Kelas ${kelas}`);
      }
    }

    this.persist(STORAGE_KEYS.STUDENT_ATT, this.studentAtt);
    this.notify();

    return {
      success: true,
      message: `Presensi ${records.length} murid kelas ${kelas} & kehadiran guru (${waliKelasNama}${guruBantuNama && guruBantuHadir ? ' & ' + guruBantuNama : ''}) berhasil disimpan!`,
    };
  }

  // --- SETTINGS ---
  public getSettings(): SchoolSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<SchoolSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.persist(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();
  }

  // --- RESET ALL DATA TO ZERO ---
  public resetAllAttendanceToZero() {
    this.studentAtt = [];
    this.teacherAtt = [];
    this.persist(STORAGE_KEYS.STUDENT_ATT, this.studentAtt);
    this.persist(STORAGE_KEYS.TEACHER_ATT, this.teacherAtt);
    this.notify();
    return { success: true, message: 'Seluruh riwayat presensi siswa dan guru telah di-reset menjadi 0.' };
  }
}

export const storage = new StorageService();
