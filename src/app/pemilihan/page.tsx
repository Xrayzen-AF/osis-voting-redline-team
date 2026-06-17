"use client";

import { useState } from "react";
import { Eye, LogOut, CheckCircle2, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Kandidat {
  nama: string;
  kelas: string;
  peran: "Ketua" | "Wakil";
  foto?: string;
}

interface Paslon {
  id: string;
  nomor: number;
  kandidat: Kandidat[];
  visiUtama: string;
  misi: string[];
}

interface HasilVote {
  paslonId: string;
  waktu: string;
}

// ─── Data Paslon ──────────────────────────────────────────────────────────────

const daftarPaslon: Paslon[] = [
  {
    id: "paslon-1",
    nomor: 1,
    kandidat: [
      {
        nama: "Asep Karung",
        kelas: "X PPLG 1",
        peran: "Ketua",
        foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=asepkarung&backgroundColor=b6e3f4",
      },
      {
        nama: "Ujang Karbit",
        kelas: "X PPLG 2",
        peran: "Wakil",
        foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=ujangkarbit&backgroundColor=c0aede",
      },
    ],
    visiUtama: "Ada-ada saja.",
    misi: [
      "Program A",
      "Program B",
      "Program C",
      "Program D",
    ],
  },
  {
    id: "paslon-2",
    nomor: 2,
    kandidat: [
      {
        nama: "Iki Ultramen",
        kelas: "X PPLG 3",
        peran: "Ketua",
        foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=ikiultramen&backgroundColor=d1f4d1",
      },
      {
        nama: "Wili Galon",
        kelas: "X PPLG 3",
        peran: "Wakil",
        foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=wiligalon&backgroundColor=ffd5dc",
      },
    ],
    visiUtama: "ffff",
    misi: [
      "yyyy",
    ],
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

// ─── Modal Detail Visi & Misi ─────────────────────────────────────────────────

function ModalDetail({
  paslon,
  onClose,
  onPilih,
}: {
  paslon: Paslon;
  onClose: () => void;
  onPilih: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="font-semibold text-slate-900 text-base">
            Paslon {pad(paslon.nomor)}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Foto */}
          <div className="grid grid-cols-2 gap-3">
            {paslon.kandidat.map((k) => (
              <div key={k.peran} className="text-center">
                <div className="rounded-xl overflow-hidden aspect-[3/4] bg-slate-100 mb-2">
                  <img
                    src={k.foto}
                    alt={k.nama}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-semibold text-slate-900 text-sm leading-tight">
                  {k.nama}
                </p>
                <p className="text-xs text-slate-500">
                  {k.kelas} · {k.peran}
                </p>
              </div>
            ))}
          </div>

          {/* Visi */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Visi
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {paslon.visiUtama}
            </p>
          </div>

          {/* Misi */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Misi
            </p>
            <ol className="list-decimal list-inside space-y-1.5">
              {paslon.misi.map((m, i) => (
                <li key={i} className="text-sm text-slate-700 leading-relaxed">
                  {m}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
          >
            Tutup
          </button>
          <button
            onClick={onPilih}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            Pilih Paslon Ini
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Konfirmasi ─────────────────────────────────────────────────────────

function ModalKonfirmasi({
  paslon,
  onBatal,
  onKonfirmasi,
}: {
  paslon: Paslon;
  onBatal: () => void;
  onKonfirmasi: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onBatal()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-base">
            Konfirmasi Pilihan
          </h2>
          <button
            onClick={onBatal}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
            aria-label="Batal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="px-5 py-4 text-sm text-slate-500 leading-relaxed">
          Kamu akan memilih{" "}
          <span className="font-semibold text-slate-700">
            Paslon {pad(paslon.nomor)}
          </span>{" "}
          ({paslon.kandidat.find((k) => k.peran === "Ketua")?.nama} &amp;{" "}
          {paslon.kandidat.find((k) => k.peran === "Wakil")?.nama}) sebagai
          Ketua &amp; Wakil OSIS. Pilihan ini{" "}
          <span className="font-semibold">tidak dapat diubah</span> setelah
          dikonfirmasi.
        </p>

        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onBatal}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            onClick={onKonfirmasi}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            Ya, Pilih Paslon Ini
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kartu Paslon ─────────────────────────────────────────────────────────────

function PaslonCard({
  paslon,
  onLihatDetail,
  onPilih,
}: {
  paslon: Paslon;
  onLihatDetail: (p: Paslon) => void;
  onPilih: (p: Paslon) => void;
}) {
  const ketua = paslon.kandidat.find((k) => k.peran === "Ketua");
  const wakil = paslon.kandidat.find((k) => k.peran === "Wakil");

  return (
    <div className="relative bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-5">
      {/* Watermark nomor */}
      <span className="absolute -top-3 right-2 text-7xl font-extrabold text-slate-100 select-none pointer-events-none leading-none">
        {pad(paslon.nomor)}
      </span>

      <div className="relative">
        {/* Badge nomor */}
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white font-bold text-sm mb-4">
          {pad(paslon.nomor)}
        </span>

        {/* Foto kandidat */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[ketua, wakil].map(
            (k) =>
              k && (
                <div
                  key={k.peran}
                  className="relative rounded-xl overflow-hidden aspect-[3/4] bg-slate-100"
                >
                  <img
                    src={k.foto}
                    alt={k.nama}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                    <p className="text-white text-xs font-semibold leading-tight">
                      {k.nama}
                    </p>
                    <p className="text-white/70 text-[10px]">
                      {k.kelas} · {k.peran}
                    </p>
                  </div>
                </div>
              )
          )}
        </div>

        {/* Visi singkat */}
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 italic">
          &ldquo;{paslon.visiUtama}&rdquo;
        </p>

        {/* Tombol aksi */}
        <div className="flex gap-2">
          <button
            onClick={() => onLihatDetail(paslon)}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 font-medium py-2.5 rounded-xl hover:bg-blue-50 active:scale-[0.99] transition text-sm"
          >
            <Eye className="w-4 h-4" />
            Visi &amp; Misi
          </button>
          <button
            onClick={() => onPilih(paslon)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.99] transition text-sm"
          >
            Pilih
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────

export default function PemilihanPage() {
  const [hasil, setHasil] = useState<HasilVote | null>(null);
  const [detailTarget, setDetailTarget] = useState<Paslon | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Paslon | null>(null);

  const sudahMemilih = !!hasil;
  const paslonTerpilih = daftarPaslon.find((p) => p.id === hasil?.paslonId);

  const handleKonfirmasiVote = () => {
    if (!confirmTarget) return;
    setHasil({ paslonId: confirmTarget.id, waktu: new Date().toISOString() });
    setConfirmTarget(null);
    setDetailTarget(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <span className="text-xl font-bold text-blue-600">OSIS Portal</span>
        <button
          title="Keluar"
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 py-10">
        {sudahMemilih ? (
          /* ── Sudah memilih ── */
          <div className="text-center pt-10">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Terima Kasih!</h1>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              Suaramu untuk Paslon{" "}
              <span className="font-semibold text-slate-700">
                {pad(paslonTerpilih?.nomor ?? 0)}
              </span>{" "}
              sudah berhasil tercatat.
            </p>

            {paslonTerpilih && (
              <div className="bg-white border border-emerald-100 rounded-2xl p-5 text-left shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-sm">
                    {pad(paslonTerpilih.nomor)}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {paslonTerpilih.kandidat.find((k) => k.peran === "Ketua")?.nama}
                    </p>
                    <p className="text-xs text-slate-500">
                      &amp; {paslonTerpilih.kandidat.find((k) => k.peran === "Wakil")?.nama}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic">
                  &ldquo;{paslonTerpilih.visiUtama}&rdquo;
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900">
                Pilih Pemimpinmu
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Gunakan hak suaramu dengan bijak untuk masa depan sekolah yang
                lebih baik.
              </p>
            </div>

            <div className="space-y-5">
              {daftarPaslon.map((paslon) => (
                <PaslonCard
                  key={paslon.id}
                  paslon={paslon}
                  onLihatDetail={setDetailTarget}
                  onPilih={setConfirmTarget}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modal Detail Visi & Misi */}
      {detailTarget && (
        <ModalDetail
          paslon={detailTarget}
          onClose={() => setDetailTarget(null)}
          onPilih={() => {
            setConfirmTarget(detailTarget);
            setDetailTarget(null);
          }}
        />
      )}

      {/* Modal Konfirmasi */}
      {confirmTarget && (
        <ModalKonfirmasi
          paslon={confirmTarget}
          onBatal={() => setConfirmTarget(null)}
          onKonfirmasi={handleKonfirmasiVote}
        />
      )}
    </div>
  );
}