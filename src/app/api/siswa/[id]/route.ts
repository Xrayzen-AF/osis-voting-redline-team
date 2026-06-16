// src/app/api/siswa/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PUT /api/siswa/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { nama, nis, kelas_id } = body;

  if (!nama?.trim() || !kelas_id) {
    return NextResponse.json({ error: "Nama dan kelas wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("siswa")
    .update({ nama: nama.trim(), nis: nis?.trim() || null, kelas_id })
    .eq("id", params.id)
    .select("*, kelas(nama_kelas)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// DELETE /api/siswa/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabaseAdmin
    .from("siswa")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}