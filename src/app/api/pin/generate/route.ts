// src/app/api/pin/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Generate random 6-digit PIN
function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/pin/generate — generate PIN untuk semua siswa di kelas
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { kelas_id } = body;

  if (!kelas_id) {
    return NextResponse.json({ error: "kelas_id wajib diisi" }, { status: 400 });
  }

  // Ambil semua siswa di kelas ini
  const { data: siswaList, error: siswaError } = await supabaseAdmin
    .from("siswa")
    .select("id, kelas_id")
    .eq("kelas_id", kelas_id);

  if (siswaError) return NextResponse.json({ error: siswaError.message }, { status: 500 });
  if (!siswaList || siswaList.length === 0) {
    return NextResponse.json({ error: "Tidak ada siswa di kelas ini" }, { status: 404 });
  }

  // Ambil existing PINs biar ga bentrok
  const { data: existingPins } = await supabaseAdmin
    .from("credentials")
    .select("pin");

  const usedPins = new Set((existingPins || []).map((c: any) => c.pin));

  // Buat credential baru untuk tiap siswa yang belum punya
  const { data: existingCreds } = await supabaseAdmin
    .from("credentials")
    .select("siswa_id")
    .eq("kelas_id", kelas_id);

  const existingSiswaIds = new Set((existingCreds || []).map((c: any) => c.siswa_id));

  const newCredentials = [];
  for (const siswa of siswaList) {
    if (existingSiswaIds.has(siswa.id)) continue; // Skip yang udah ada

    let pin = generatePin();
    // Hindari duplikat PIN
    while (usedPins.has(pin)) {
      pin = generatePin();
    }
    usedPins.add(pin);

    newCredentials.push({
      siswa_id: siswa.id,
      kelas_id: siswa.kelas_id,
      pin,
      sudah_digunakan: false,
    });
  }

  if (newCredentials.length === 0) {
    return NextResponse.json({ message: "Semua siswa sudah memiliki PIN", generated: 0 });
  }

  const { data, error } = await supabaseAdmin
    .from("credentials")
    .insert(newCredentials)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    generated: data?.length ?? 0,
    total_siswa: siswaList.length,
  }, { status: 201 });
}