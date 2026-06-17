// src/app/api/paslon/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/paslon — list semua paslon
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("paslon")
    .select("id, nomor_urut, nama_ketua, nama_wakil, visi, misi, foto_url")
    .order("nomor_urut");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}