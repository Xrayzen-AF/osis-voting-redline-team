import { NextRequest, NextResponse } from "next/server";
// Pastikan path import supabaseAdmin di bawah ini sudah benar sesuai proyek Anda
import { supabaseAdmin } from "@/lib/supabase"; 

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ kelasId: string }> }
) {
  try {
    // Membaca params secara asynchronous (Wajib di Next.js 15)
    const { kelasId } = await context.params;

    // Mengambil data dari Supabase
    const { data, error } = await supabaseAdmin
      .from("credentials")
      .select("*, siswa(nama, nis)")
      .eq("kelas_id", kelasId); // Asumsi kolom filter adalah kelas_id

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
