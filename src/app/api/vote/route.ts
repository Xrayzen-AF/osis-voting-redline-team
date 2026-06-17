// src/app/api/vote/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/vote — submit vote
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { credential_id, paslon_id } = body;

  if (!credential_id || !paslon_id) {
    return NextResponse.json(
      { error: "credential_id dan paslon_id wajib diisi" },
      { status: 400 }
    );
  }

  // Cek credential masih valid dan belum digunakan
  const { data: credential, error: credError } = await supabaseAdmin
    .from("credentials")
    .select("id, sudah_digunakan")
    .eq("id", credential_id)
    .single();

  if (credError || !credential) {
    return NextResponse.json({ error: "Credential tidak valid" }, { status: 404 });
  }

  if (credential.sudah_digunakan) {
    return NextResponse.json({ error: "Sudah pernah memilih" }, { status: 409 });
  }

  // Cek paslon ada
  const { data: paslon, error: paslonError } = await supabaseAdmin
    .from("paslon")
    .select("id")
    .eq("id", paslon_id)
    .single();

  if (paslonError || !paslon) {
    return NextResponse.json({ error: "Paslon tidak ditemukan" }, { status: 404 });
  }

  // Insert vote
  const { error: voteError } = await supabaseAdmin
    .from("votes")
    .insert({ credential_id, paslon_id });

  if (voteError) {
    return NextResponse.json({ error: voteError.message }, { status: 500 });
  }

  // Update credential sudah_digunakan = true
  const { error: updateError } = await supabaseAdmin
    .from("credentials")
    .update({ sudah_digunakan: true, used_at: new Date().toISOString() })
    .eq("id", credential_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}