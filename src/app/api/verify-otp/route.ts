import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // pakai service role agar bisa bypass RLS
);

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code || typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { message: "Format kode OTP tidak valid." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("otp_codes")
    .select("credential_id, expires_at, used")
    .eq("code", code)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: "Kode OTP salah atau sudah kedaluwarsa. Coba lagi." },
      { status: 401 }
    );
  }

  if (data.used) {
    return NextResponse.json(
      { message: "Kode OTP ini sudah pernah digunakan." },
      { status: 401 }
    );
  }

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json(
      { message: "Kode OTP sudah kedaluwarsa. Hubungi panitia." },
      { status: 401 }
    );
  }

  // Tandai OTP sebagai sudah dipakai (one-time use)
  await supabase
    .from("otp_codes")
    .update({ used: true })
    .eq("code", code);

  return NextResponse.json({ credential_id: data.credential_id });
}