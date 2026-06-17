"use client";
// src/app/admin/daftar-pemilih/page.tsx
import { useEffect, useState, useCallback } from "react";
import { Search, Key, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatsKelas {
  kelas_id: string;
  nama_kelas: string;
  total_kredensial: number;
  belum_digunakan: number;
  sudah_memilih: number;
}

interface Credential {
  id: string;
  pin: string;
  sudah_digunakan: boolean;
  used_at: string | null;
  siswa: { nama: string; nis: string | null } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DaftarPemilihPage() {
  const [statsList, setStatsList] = useState<StatsKelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [pinModal, setPinModal] = useState<StatsKelas | null>(null);
  const [pinList, setPinList] = useState<Credential[]>([]);
  const [pinLoading, setPinLoading] = useState(false);
  const [generateModal, setGenerateModal] = useState(false);
  const [kelasList, setKelasList] = useState<{ id: string; nama_kelas: string }[]>([]);
  const [selectedKelasGen, setSelectedKelasGen] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [pinSearch, setPinSearch] = useState("");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/pemilih?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setStatsList(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search]);

  const fetchKelas = useCallback(async () => {
    const res = await fetch("/api/kelas");
    const data = await res.json();
    setKelasList(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchKelas(); }, [fetchKelas]);

  const doGenerate = async () => {
    if (!selectedKelasGen) return showToast("Pilih kelas dulu", "error");
    setGenerating(selectedKelasGen);
    try {
      const res = await fetch("/api/pin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kelas_id: selectedKelasGen }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || "Gagal generate PIN", "error");
      showToast(`✓ ${data.generated} PIN berhasil digenerate`);
      setGenerateModal(false);
      fetchStats();
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setGenerating(null);
    }
  };

  const openPinModal = async (stats: StatsKelas) => {
    setPinModal(stats);
    setPinLoading(true);
    setPinSearch("");
    const res = await fetch(`/api/pemilih/${stats.kelas_id}`);
    const data = await res.json();
    setPinList(Array.isArray(data) ? data : []);
    setPinLoading(false);
  };

  const filteredPins = pinList.filter(
    (p) =>
      !pinSearch ||
      p.pin.includes(pinSearch) ||
      p.siswa?.nama.toLowerCase().includes(pinSearch.toLowerCase()) ||
      p.siswa?.nis?.includes(pinSearch)
  );

  return (
    <main className="pt-20 md:pt-8 px-4 md:px-8 pb-24 md:pb-8 w-full grow">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl text-sm font-medium text-white shadow-lg ${
            toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 tracking-tight">
            <Key className="w-6 h-6 text-blue-600" />
            Manajemen Kredensial
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hasilkan dan kelola PIN rahasia untuk otorisasi pemilih.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedKelasGen("");
            setGenerateModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all active:scale-[0.98] shadow-md shadow-blue-500/20"
        >
          <span className="text-lg leading-none">+</span>
          <span>Generate PIN</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              placeholder="Cari kelas..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Kelas</th>
                <th className="px-6 py-4 whitespace-nowrap">Total Kredensial</th>
                <th className="px-6 py-4 whitespace-nowrap">Belum Digunakan</th>
                <th className="px-6 py-4 whitespace-nowrap">Sudah Memilih</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : statsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Belum ada kelas. Tambahkan di menu Data Kelas.</p>
                  </td>
                </tr>
              ) : (
                statsList.map((s) => (
                  <tr key={s.kelas_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 bg-white whitespace-nowrap">
                        {s.nama_kelas}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">
                      {s.total_kredensial}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`font-medium ${
                          s.belum_digunakan > 0 ? "text-slate-700" : "text-slate-300"
                        }`}
                      >
                        {s.belum_digunakan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-emerald-500">{s.sudah_memilih}</span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() =>
                          s.total_kredensial > 0 ? openPinModal(s) : undefined
                        }
                        disabled={s.total_kredensial === 0}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition whitespace-nowrap ${
                          s.total_kredensial > 0
                            ? "border-blue-500 text-blue-600 hover:bg-blue-50 cursor-pointer"
                            : "border-slate-200 text-slate-300 cursor-default"
                        }`}
                      >
                        Lihat PIN
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Dialog Generate PIN ── */}
      <Dialog open={generateModal} onOpenChange={setGenerateModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Generate PIN</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 leading-relaxed">
            Pilih kelas untuk di-generate PIN-nya. Siswa yang sudah punya PIN tidak akan
            dibuatkan ulang.
          </p>
          <div className="py-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Pilih Kelas
            </label>
            <select
              value={selectedKelasGen}
              onChange={(e) => setSelectedKelasGen(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            >
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kelas}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setGenerateModal(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              onClick={doGenerate}
              disabled={!!generating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {generating ? "Generating..." : "Generate PIN"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Lihat PIN ── */}
      <Dialog
        open={!!pinModal}
        onOpenChange={(open) => {
          if (!open) setPinModal(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Daftar PIN —{" "}
                <span className="text-blue-600">{pinModal?.nama_kelas}</span>
              </DialogTitle>
              <div className="flex gap-2 mr-6">
                <StatChip
                  label="Total"
                  value={pinModal?.total_kredensial ?? 0}
                  color="text-blue-600"
                  bg="bg-blue-50"
                />
                <StatChip
                  label="Belum"
                  value={pinModal?.belum_digunakan ?? 0}
                  color="text-amber-600"
                  bg="bg-amber-50"
                />
                <StatChip
                  label="Memilih"
                  value={pinModal?.sudah_memilih ?? 0}
                  color="text-emerald-600"
                  bg="bg-emerald-50"
                />
              </div>
            </div>
          </DialogHeader>

          {/* Search */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={pinSearch}
              onChange={(e) => setPinSearch(e.target.value)}
              placeholder="Cari nama / NIS / PIN..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* PIN Table */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-slate-100 mt-2">
            {pinLoading ? (
              <p className="text-center text-slate-400 py-10 text-sm">Memuat PIN...</p>
            ) : filteredPins.length === 0 ? (
              <p className="text-center text-slate-400 py-10 text-sm">
                {pinList.length === 0
                  ? "Belum ada PIN. Klik Generate PIN terlebih dahulu."
                  : "Tidak ditemukan."}
              </p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                  <tr>
                    {["No", "Nama Siswa", "NIS", "PIN", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPins.map((c, i) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-300 text-xs w-8">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {c.siswa?.nama || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{c.siswa?.nis || "—"}</td>
                      <td className="px-4 py-3">
                        <code className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg tracking-widest text-sm">
                          {c.pin}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            c.sudah_digunakan
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {c.sudah_digunakan ? "✓ Sudah Memilih" : "Belum"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-slate-400">{filteredPins.length} data</span>
            <button
              onClick={() => setPinModal(null)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              Tutup
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

// ─── Sub Components ───────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`text-center px-3 py-1.5 rounded-lg ${bg} min-w-[48px]`}>
      <div className={`text-base font-bold leading-tight ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}