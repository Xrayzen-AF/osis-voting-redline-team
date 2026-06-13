-- ==============================================================================
-- FASE 1: PEMBUATAN TABEL (DDL)
-- ==============================================================================
 
-- 1. Tabel Kepanitiaan (Admins)
-- Menggunakan relasi langsung ke tabel auth.users bawaan Supabase
CREATE TABLE admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'panitia' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
 
-- 2. Tabel Master Kelas (Hanya untuk tingkat 10 dan 11)
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(20) NOT NULL UNIQUE,
    grade SMALLINT NOT NULL CHECK (grade IN (10, 11)),
    voter_count SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
 
-- 3. Tabel Kandidat (Pasangan Calon)
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SMALLINT NOT NULL UNIQUE,
    chairman_name VARCHAR(100) NOT NULL,
    vice_chairman_name VARCHAR(100) NOT NULL,
    vision TEXT NOT NULL,
    missions JSONB NOT NULL DEFAULT '[]'::jsonb,
    photo_urls JSONB NOT NULL DEFAULT '{"chairman": "", "vice_chairman": ""}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
 
-- 4. Tabel Tiket Pemilih (Tokens) Dieksekusi nanti
-- Perhatikan: Tidak ada kolom identitas siswa di sini demi kerahasiaan.
 
-- 5. Tabel Kotak Suara (Votes)
-- Perhatikan: Relasi hanya ke kandidat dan kelas, TIDAK ke tokens.
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
 
-- ==============================================================================
-- FASE 2: PENGATURAN KEAMANAN DATA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
 
-- Mengaktifkan gerbang keamanan RLS untuk semua tabel
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
 
-- ------------------------------------------------------------------------------
-- A. Akses Publik (Frontend Pemilih / Siswa)
-- ------------------------------------------------------------------------------
 
-- Siswa perlu membaca data kelas dan paslon untuk ditampilkan di UI
CREATE POLICY "Publik dapat melihat daftar kelas"
ON classes FOR SELECT USING (true);
 
CREATE POLICY "Publik dapat melihat profil kandidat"
ON candidates FOR SELECT USING (true);
 
-- Siswa perlu membaca PIN untuk validasi login, dan mengupdate status is_used
CREATE POLICY "Publik dapat memvalidasi PIN"
ON tokens FOR SELECT USING (true);
 
CREATE POLICY "Publik dapat menandai PIN sebagai terpakai"
ON tokens FOR UPDATE USING (true) WITH CHECK (is_used = true);
 
-- Siswa hanya boleh "memasukkan" (INSERT) kertas suara ke dalam kotak
CREATE POLICY "Publik dapat memberikan suara"
ON votes FOR INSERT WITH CHECK (true);
 
-- ------------------------------------------------------------------------------
-- B. Akses Administrator (Backend Panel / Guru & Panitia)
-- ------------------------------------------------------------------------------
-- Catatan Arsitektural:
-- Operasi CRUD (Create, Read, Update, Delete) untuk menambah kelas,
-- mendaftarkan paslon, dan melihat statistik suara tidak memerlukan policy
-- publik di sini. Nantinya di Next.js, rute Admin Panel akan menggunakan
-- Supabase Service Role Key di dalam Server Actions yang dijamin secara otomatis
-- bisa menembus (bypass) pembatasan RLS ini dengan aman.
 
