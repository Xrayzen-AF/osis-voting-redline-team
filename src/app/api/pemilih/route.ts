// src/app/api/pemilih/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/pemilih — stats per kelas dari view v_stats_kelas
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  let query = supabaseAdmin
    .from("v_stats_kelas")
    .select("*")
    .order("nama_kelas");

  if (search) {
    query = query.ilike("nama_kelas", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}