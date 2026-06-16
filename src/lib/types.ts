// src/lib/types.ts

export interface Kelas {
  id: string;
  nama_kelas: string;
  created_at: string;
}

export interface Siswa {
  id: string;
  nama: string;
  nis: string | null;
  kelas_id: string;
  created_at: string;
  kelas?: Kelas;
}

export interface Credential {
  id: string;
  siswa_id: string;
  kelas_id: string;
  pin: string;
  sudah_digunakan: boolean;
  used_at: string | null;
  created_at: string;
  siswa?: Siswa;
  kelas?: Kelas;
}

export interface StatsKelas {
  kelas_id: string;
  nama_kelas: string;
  total_kredensial: number;
  belum_digunakan: number;
  sudah_memilih: number;
}

export interface Paslon {
  id: string;
  nomor_urut: number;
  nama_ketua: string;
  nama_wakil: string;
  visi: string | null;
  misi: string | null;
  foto_url: string | null;
  created_at: string;
}