// src/app/api/siswa/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/siswa?kelas_id=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kelas_id = searchParams.get("kelas_id");
  const search = searchParams.get("search") || "";

  let query = supabaseAdmin
    .from("siswa")
    .select("*, kelas(nama_kelas)")
    .order("nama");

  if (kelas_id) query = query.eq("kelas_id", kelas_id);
  if (search) query = query.ilike("nama", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

// POST /api/siswa — tambah siswa baru
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nama, nis, kelas_id } = body;

  if (!nama?.trim() || !kelas_id) {
    return NextResponse.json({ error: "Nama dan kelas wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("siswa")
    .insert({ nama: nama.trim(), nis: nis?.trim() || null, kelas_id })
    .select("*, kelas(nama_kelas)")
    .single();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "NIS sudah terdaftar" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}