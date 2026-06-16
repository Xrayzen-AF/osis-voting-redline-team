// src/app/api/kelas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/kelas — list all kelas with siswa count
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  let query = supabaseAdmin
    .from("kelas")
    .select("*, siswa(count)")
    .order("nama_kelas");

  if (search) {
    query = query.ilike("nama_kelas", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten siswa count
  const result = (data || []).map((k: any) => ({
    id: k.id,
    nama_kelas: k.nama_kelas,
    created_at: k.created_at,
    jumlah_siswa: k.siswa?.[0]?.count ?? 0,
  }));

  return NextResponse.json(result);
}

// POST /api/kelas — tambah kelas baru
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nama_kelas } = body;

  if (!nama_kelas?.trim()) {
    return NextResponse.json({ error: "Nama kelas wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("kelas")
    .insert({ nama_kelas: nama_kelas.trim() })
    .select()
    .single();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "Nama kelas sudah ada" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}