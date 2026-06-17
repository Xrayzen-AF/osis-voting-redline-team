import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/admin/dashboard?class=NAMA_KELAS
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const kelasFilter = searchParams.get("class"); // null = semua kelas

  try {
    const PASLON_COLORS = ["#1a56db", "#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b"];

    // ── 1. Semua kelas ──────────────────────────────────────────────────────
    let kelasQuery = supabaseAdmin
      .from("kelas")
      .select("id, nama_kelas")
      .order("nama_kelas");
    if (kelasFilter) kelasQuery = kelasQuery.eq("nama_kelas", kelasFilter);
    const { data: semuaKelas, error: kelasError } = await kelasQuery;
    if (kelasError) throw kelasError;

    // ── 2. Total terdaftar ──────────────────────────────────────────────────
    let terdaftarQuery = supabaseAdmin
      .from("credentials")
      .select("id", { count: "exact", head: true });
    if (kelasFilter) {
      const kelasId = semuaKelas?.[0]?.id;
      if (kelasId) terdaftarQuery = terdaftarQuery.eq("kelas_id", kelasId);
    }
    const { count: totalTerdaftar } = await terdaftarQuery;

    // ── 3. Total sudah memilih ──────────────────────────────────────────────
    let memilihQuery = supabaseAdmin
      .from("credentials")
      .select("id", { count: "exact", head: true })
      .eq("sudah_digunakan", true);
    if (kelasFilter) {
      const kelasId = semuaKelas?.[0]?.id;
      if (kelasId) memilihQuery = memilihQuery.eq("kelas_id", kelasId);
    }
    const { count: totalMemilih } = await memilihQuery;

    // ── 4. Sesi aktif (credentials used_at dalam 30 menit terakhir) ─────────
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { count: sessions } = await supabaseAdmin
      .from("credentials")
      .select("id", { count: "exact", head: true })
      .gte("used_at", thirtyMinsAgo);

    // ── 5. Semua paslon ─────────────────────────────────────────────────────
    const { data: semuaPaslon, error: paslonError } = await supabaseAdmin
      .from("paslon")
      .select("id, nomor_urut, nama_ketua, nama_wakil")
      .order("nomor_urut");
    if (paslonError) throw paslonError;

    // ── 6. Votes per paslon ─────────────────────────────────────────────────
    const paslons = await Promise.all(
      (semuaPaslon ?? []).map(async (p, i) => {
        const { count: voteCount } = await supabaseAdmin
          .from("votes")
          .select("id", { count: "exact", head: true })
          .eq("paslon_id", p.id);
        return {
          id: i + 1,
          name: `Paslon ${String(p.nomor_urut).padStart(2, "0")}`,
          ketua: p.nama_ketua,
          wakil: p.nama_wakil,
          votes: voteCount ?? 0,
          color: PASLON_COLORS[i] ?? "#64748b",
        };
      })
    );

    // ── 7. Turnout + sebaran suara per kelas ────────────────────────────────
    const classes = await Promise.all(
      (semuaKelas ?? []).map(async (k) => {
        const { count: terdaftar } = await supabaseAdmin
          .from("credentials")
          .select("id", { count: "exact", head: true })
          .eq("kelas_id", k.id);

        const { count: memilih } = await supabaseAdmin
          .from("credentials")
          .select("id", { count: "exact", head: true })
          .eq("kelas_id", k.id)
          .eq("sudah_digunakan", true);

        // Votes per paslon di kelas ini (via credentials.kelas_id)
        const votesByPaslon = await Promise.all(
          (semuaPaslon ?? []).map(async (p) => {
            const { count } = await supabaseAdmin
              .from("votes")
              .select("id", { count: "exact", head: true })
              .eq("paslon_id", p.id)
              .in(
                "credential_id",
                await supabaseAdmin
                  .from("credentials")
                  .select("id")
                  .eq("kelas_id", k.id)
                  .then(({ data }) => (data ?? []).map((c) => c.id))
              );
            return count ?? 0;
          })
        );

        return {
          name: k.nama_kelas,
          registered: terdaftar ?? 0,
          voted: memilih ?? 0,
          votesByPaslon,
        };
      })
    );

    // ── 8. Aktivitas per jam hari ini ───────────────────────────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: votesHariIni } = await supabaseAdmin
      .from("votes")
      .select("voted_at")
      .gte("voted_at", todayStart.toISOString())
      .order("voted_at");

    const hourMap: Record<string, number> = {};
    for (const v of votesHariIni ?? []) {
      const hour = new Date(v.voted_at).getHours();
      const label = `${String(hour).padStart(2, "0")}:00`;
      hourMap[label] = (hourMap[label] ?? 0) + 1;
    }
    const hourlyActivity = Object.entries(hourMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, count]) => ({ hour, count }));

    // ── 9. Response ─────────────────────────────────────────────────────────
    return NextResponse.json({
      registered: totalTerdaftar ?? 0,
      voted: totalMemilih ?? 0,
      sessions: sessions ?? 0,
      paslons,
      classes,
      hourlyActivity,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[/api/admin/dashboard] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data", detail: String(err) },
      { status: 500 }
    );
  }
}