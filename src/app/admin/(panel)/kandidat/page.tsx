"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Megaphone, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocalStorage } from "@/hooks/use-local-storage";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Kandidat {
  nama: string;
  kelas: string;
  peran: "Ketua" | "Wakil";
  foto?: string; // URL foto, opsional
}

interface Paslon {
  id: string;
  nomor: number;
  kandidat: Kandidat[];
  visiUtama: string;
  misi: string[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockPaslon: Paslon[] = [
  {
    id: "uuid-1",
    nomor: 1,
    kandidat: [
      {
        nama: "Asep Betmen",
        kelas: "X PPLG 1",
        peran: "Ketua",
        foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=asep",
      },
      {
        nama: "Ujang Robin",
        kelas: "X PPLG 2",
        peran: "Wakil",
        foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=ujang",
      },
    ],
    visiUtama: "Ada-ada saja.",
    misi: ["Program A", "Program B", "Program C", "Program D"],
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

const emptyForm = {
  namaKetua: "",
  kelasKetua: "",
  fotoKetua: "",
  namaWakil: "",
  kelasWakil: "",
  fotoWakil: "",
  visiUtama: "",
  misi: "",
};

type FormState = typeof emptyForm;

// ─── Form Fields (komponen terpisah) ───────────────────────────────────────────
// PENTING: komponen ini didefinisikan DI LUAR DataPaslonPage.
// Kalau didefinisikan di dalam, setiap kali state `form` berubah (mis. saat
// mengetik 1 huruf), seluruh DataPaslonPage akan re-render dan komponen ini
// dibuat ulang sebagai instance baru -> React unmount/remount input -> fokus
// hilang -> harus klik ulang setiap kali mau mengetik huruf berikutnya.

const inputClass =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

function FormFields({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (field: keyof FormState, value: string) => void;
}) {
  return (
    <div className="grid gap-4 py-2">
      {/* Ketua */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Kandidat Ketua
        </p>
        <div className="grid gap-2">
          <input
            placeholder="Nama Ketua"
            className={inputClass}
            value={form.namaKetua}
            onChange={(e) => onChange("namaKetua", e.target.value)}
          />
          <input
            placeholder="Asal Kelas (contoh: X PPLG 1)"
            className={inputClass}
            value={form.kelasKetua}
            onChange={(e) => onChange("kelasKetua", e.target.value)}
          />
        </div>
      </div>

      {/* Wakil */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Kandidat Wakil
        </p>
        <div className="grid gap-2">
          <input
            placeholder="Nama Wakil"
            className={inputClass}
            value={form.namaWakil}
            onChange={(e) => onChange("namaWakil", e.target.value)}
          />
          <input
            placeholder="Asal Kelas (contoh: X PPLG 2)"
            className={inputClass}
            value={form.kelasWakil}
            onChange={(e) => onChange("kelasWakil", e.target.value)}
          />
        </div>
      </div>

      {/* Visi & Misi */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Visi & Misi
        </p>
        <div className="grid gap-2">
          <input
            placeholder="Visi Utama"
            className={inputClass}
            value={form.visiUtama}
            onChange={(e) => onChange("visiUtama", e.target.value)}
          />
          <textarea
            placeholder={"Program/Misi (satu per baris)\nContoh:\nProgram A\nProgram B"}
            className={`${inputClass} resize-none`}
            rows={4}
            value={form.misi}
            onChange={(e) => onChange("misi", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DataPaslonPage() {
  const [paslonList, setPaslonList] = useLocalStorage<Paslon[]>(
    "osis-paslon-list",
    mockPaslon,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(emptyForm);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Paslon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Paslon | null>(null);

  // ── Filter ──
  const filtered = paslonList.filter((p) =>
    p.kandidat.some((k) =>
      k.nama.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  // ── Form helpers ──
  const fillFormFromPaslon = (p: Paslon) => {
    const ketua = p.kandidat.find((k) => k.peran === "Ketua");
    const wakil = p.kandidat.find((k) => k.peran === "Wakil");
    setForm({
      namaKetua: ketua?.nama ?? "",
      kelasKetua: ketua?.kelas ?? "",
      fotoKetua: ketua?.foto ?? "",
      namaWakil: wakil?.nama ?? "",
      kelasWakil: wakil?.kelas ?? "",
      fotoWakil: wakil?.foto ?? "",
      visiUtama: p.visiUtama,
      misi: p.misi.join("\n"),
    });
  };

  const buildPaslonFromForm = (id: string, nomor: number): Paslon => ({
    id,
    nomor,
    kandidat: [
      {
        nama: form.namaKetua,
        kelas: form.kelasKetua,
        peran: "Ketua",
        foto:
          form.fotoKetua ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.namaKetua}`,
      },
      {
        nama: form.namaWakil,
        kelas: form.kelasWakil,
        peran: "Wakil",
        foto:
          form.fotoWakil ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.namaWakil}`,
      },
    ],
    visiUtama: form.visiUtama,
    misi: form.misi.split("\n").filter(Boolean),
  });

  // ── CRUD handlers ──
  const handleAdd = () => {
    const newPaslon = buildPaslonFromForm(
      `uuid-${Date.now()}`,
      paslonList.length + 1,
    );
    setPaslonList((prev) => [...prev, newPaslon]);
    setForm(emptyForm);
    setIsAddOpen(false);
  };

  const handleEdit = () => {
    if (!editTarget) return;
    setPaslonList((prev) =>
      prev.map((p) =>
        p.id === editTarget.id
          ? buildPaslonFromForm(editTarget.id, editTarget.nomor)
          : p,
      ),
    );
    setEditTarget(null);
    setForm(emptyForm);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setPaslonList((prev) =>
      prev
        .filter((p) => p.id !== deleteTarget.id)
        .map((p, i) => ({ ...p, nomor: i + 1 })),
    );
    setDeleteTarget(null);
  };

  // ── Update satu field form ──
  const updateForm = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="pt-20 md:pt-8 px-4 md:px-8 pb-24 md:pb-8 w-full grow">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 tracking-tight">
            <Megaphone className="w-6 h-6 text-blue-600" />
            Manajemen Paslon
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data terintegrasi Pasangan Calon Ketua OSIS.
          </p>
        </div>

        {/* Dialog Tambah Paslon */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => setForm(emptyForm)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all active:scale-[0.98] shadow-md shadow-blue-500/20"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Paslon</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Paslon Baru</DialogTitle>
            </DialogHeader>
            <FormFields form={form} onChange={updateForm} />
            <DialogFooter className="gap-2">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
              >
                Simpan
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              placeholder="Cari nama paslon..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-16">No.</th>
                <th className="px-6 py-4">Kandidat &amp; Asal Kelas</th>
                <th className="px-6 py-4">Visi Utama</th>
                <th className="px-6 py-4">Misi</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Belum ada paslon. Tambahkan paslon baru.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((paslon) => {
                  const ketua = paslon.kandidat.find(
                    (k) => k.peran === "Ketua",
                  );
                  const wakil = paslon.kandidat.find(
                    (k) => k.peran === "Wakil",
                  );
                  return (
                    <tr key={paslon.id} className="hover:bg-slate-50">
                      {/* Nomor urut */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm">
                          {String(paslon.nomor).padStart(2, "0")}
                        </span>
                      </td>

                      {/* Kandidat */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {[ketua, wakil].map(
                            (k) =>
                              k && (
                                <div
                                  key={k.peran}
                                  className="flex items-center gap-2"
                                >
                                  <img
                                    src={k.foto}
                                    alt={k.nama}
                                    className="w-8 h-8 rounded-full bg-slate-100 object-cover border border-slate-200"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        `https://api.dicebear.com/7.x/initials/svg?seed=${k.nama}`;
                                    }}
                                  />
                                  <div>
                                    <p className="font-semibold text-slate-900 leading-tight">
                                      {k.nama}
                                    </p>
                                    <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                                      <Users className="w-3 h-3" />
                                      {k.kelas} ({k.peran})
                                    </span>
                                  </div>
                                </div>
                              ),
                          )}
                        </div>
                      </td>

                      {/* Visi */}
                      <td className="px-6 py-4 text-slate-600 max-w-xs">
                        {paslon.visiUtama}
                      </td>

                      {/* Misi */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                          {paslon.misi.length} Program
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {/* Edit */}
                          <button
                            onClick={() => {
                              fillFormFromPaslon(paslon);
                              setEditTarget(paslon);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(paslon)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Dialog Edit ── */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null);
            setForm(emptyForm);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Paslon</DialogTitle>
          </DialogHeader>
          <FormFields form={form} onChange={updateForm} />
          <DialogFooter className="gap-2">
            <button
              onClick={() => {
                setEditTarget(null);
                setForm(emptyForm);
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              Simpan Perubahan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Konfirmasi Hapus ── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Paslon?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 py-2">
            Paslon{" "}
            <span className="font-semibold text-slate-700">
              {deleteTarget?.kandidat.find((k) => k.peran === "Ketua")?.nama}
            </span>{" "}
            &amp;{" "}
            <span className="font-semibold text-slate-700">
              {deleteTarget?.kandidat.find((k) => k.peran === "Wakil")?.nama}
            </span>{" "}
            akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              Ya, Hapus
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}