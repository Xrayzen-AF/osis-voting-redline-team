// src/app/api/pin/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/pin/verify — validasi PIN siswa
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pin } = body;

  if (!pin?.trim()) {
    return NextResponse.json({ error: "PIN wajib diisi" }, { status: 400 });
  }

  // Cari credential berdasarkan PIN
  const { data: credential, error } = await supabaseAdmin
    .from("credentials")
    .select("id, pin, sudah_digunakan, kelas_id, siswa(id, nama)")
    .eq("pin", pin.trim())
    .single();

  if (error || !credential) {
    return NextResponse.json({ error: "PIN tidak ditemukan" }, { status: 404 });
  }

  if (credential.sudah_digunakan) {
    return NextResponse.json({ error: "PIN sudah digunakan" }, { status: 409 });
  }

  return NextResponse.json({
    valid: true,
    credential_id: credential.id,
    siswa: credential.siswa,
    kelas_id: credential.kelas_id,
  });
}