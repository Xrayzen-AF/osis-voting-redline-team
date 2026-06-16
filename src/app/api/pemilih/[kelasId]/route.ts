// src/app/api/pemilih/[kelasId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/pemilih/:kelasId — list PIN credentials untuk kelas tertentu
export async function GET(req: NextRequest, { params }: { params: Promise<{ kelasId: string }> }) {
  const { kelasId } = await params;
  const { data, error } = await supabaseAdmin
    .from("credentials")
    .select("*, siswa(nama, nis)")
    .eq("kelas_id", kelasId)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

// DELETE /api/pemilih/:kelasId — hapus semua credential kelas ini (reset)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ kelasId: string }> }) {
  const { kelasId } = await params;
  const { error } = await supabaseAdmin
    .from("credentials")
    .delete()
    .eq("kelas_id", kelasId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}