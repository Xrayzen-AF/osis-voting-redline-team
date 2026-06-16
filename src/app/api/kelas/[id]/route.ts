// src/app/api/kelas/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PUT /api/kelas/:id — edit nama kelas
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { nama_kelas } = body;

  if (!nama_kelas?.trim()) {
    return NextResponse.json({ error: "Nama kelas wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("kelas")
    .update({ nama_kelas: nama_kelas.trim() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "Nama kelas sudah ada" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/kelas/:id — hapus kelas (cascade: siswa + credentials)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("kelas")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// GET /api/kelas/:id — detail kelas + siswa
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("kelas")
    .select("*, siswa(*)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}