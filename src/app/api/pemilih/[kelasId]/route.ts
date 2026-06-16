import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kelasId: string }> }
) {
  try {
    const { kelasId } = await params;

    if (!kelasId) {
      return NextResponse.json({ error: "kelasId is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("credentials")
      .select("*, siswa(nama, nis)")
      .eq("kelas_id", kelasId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}