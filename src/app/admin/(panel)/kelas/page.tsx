"use client";
// src/app/admin/data-kelas/page.tsx
import { useEffect, useState } from "react";
import { Search, Users, Edit, Trash2, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Kelas {
  id: string;
  nama_kelas: string;
  jumlah_siswa: number;
  created_at: string;
}

interface Siswa {
  id: string;
  nama: string;
  nis: string | null;
  kelas_id: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DataKelasPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Modal states
  const [addModal, setAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Kelas | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Kelas | null>(null);
  const [siswaTarget, setSiswaTarget] = useState<Kelas | null>(null);

  // Form
  const [formNama, setFormNama] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Siswa
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [siswaLoading, setSiswaLoading] = useState(false);
  const [formSiswa, setFormSiswa] = useState({ nama: "", nis: "" });
  const [editSiswa, setEditSiswa] = useState<Siswa | null>(null);
  const [siswaError, setSiswaError] = useState("");
  const [siswaSearch, setSiswaSearch] = useState("");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchKelas = async () => {
    setLoading(true);
    const res = await fetch(`/api/kelas?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setKelasList(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchKelas(); }, [search]);

  // ─── Kelas CRUD ───────────────────────────────────────────────────────────

  const submitKelas = async () => {
    if (!formNama.trim()) return setFormError("Nama kelas wajib diisi");
    if (editTarget && !editTarget.id) return setFormError("ID kelas tidak ditemukan");
    setFormLoading(true);
    setFormError("");
    try {
      const isEdit = !!editTarget;
      const res = await fetch(isEdit ? `/api/kelas/${editTarget!.id}` : "/api/kelas", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_kelas: formNama }),
      });
      const data = await res.json();
      if (!res.ok) return setFormError(data.error || "Gagal menyimpan");
      showToast(isEdit ? "Kelas berhasil diupdate" : "Kelas berhasil ditambahkan");
      setAddModal(false);
      setEditTarget(null);
      setFormNama("");
      fetchKelas();
    } catch {
      setFormError("Terjadi kesalahan jaringan");
    } finally {
      setFormLoading(false);
    }
  };

  const deleteKelas = async () => {
    if (!deleteTarget?.id) return;
    const res = await fetch(`/api/kelas/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Kelas berhasil dihapus");
      fetchKelas();
    } else {
      showToast("Gagal menghapus kelas", "error");
    }
    setDeleteTarget(null);
  };

  // ─── Siswa CRUD ───────────────────────────────────────────────────────────

  const openSiswaModal = async (k: Kelas) => {
    if (!k?.id) return showToast("Data kelas tidak valid", "error");
    setSiswaTarget(k);
    setSiswaError("");
    setSiswaSearch("");
    setFormSiswa({ nama: "", nis: "" });
    setEditSiswa(null);
    await loadSiswa(k.id);
  };

  const loadSiswa = async (kelasId: string) => {
    if (!kelasId) return;
    setSiswaLoading(true);
    const res = await fetch(`/api/siswa?kelas_id=${kelasId}`);
    const data = await res.json();
    setSiswaList(Array.isArray(data) ? data : []);
    setSiswaLoading(false);
  };

  const submitSiswa = async () => {
    if (!formSiswa.nama.trim()) return setSiswaError("Nama siswa wajib diisi");
    if (!siswaTarget?.id) return setSiswaError("ID kelas tidak ditemukan");
    setSiswaError("");
    try {
      const isEdit = !!editSiswa;
      const res = await fetch(isEdit ? `/api/siswa/${editSiswa!.id}` : "/api/siswa", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formSiswa, kelas_id: siswaTarget.id }),
      });
      const data = await res.json();
      if (!res.ok) return setSiswaError(data.error || "Gagal menyimpan");
      setFormSiswa({ nama: "", nis: "" });
      setEditSiswa(null);
      await loadSiswa(siswaTarget.id);
      fetchKelas();
    } catch {
      setSiswaError("Terjadi kesalahan jaringan");
    }
  };

  const deleteSiswa = async (id: string) => {
    if (!id || !siswaTarget?.id) return;
    const res = await fetch(`/api/siswa/${id}`, { method: "DELETE" });
    if (res.ok) await loadSiswa(siswaTarget.id);
    fetchKelas();
  };

  const filteredSiswa = siswaList.filter(
    (s) =>
      !siswaSearch ||
      s.nama.toLowerCase().includes(siswaSearch.toLowerCase()) ||
      s.nis?.includes(siswaSearch)
  );

  return (
    <main className="pt-20 md:pt-8 px-4 md:px-8 pb-24 md:pb-8 w-full grow">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl text-sm font-medium text-white shadow-lg ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 tracking-tight">
            <Users className="w-6 h-6 text-blue-600" />
            Data Kelas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data kelas dan daftar siswa pemilih.
          </p>
        </div>
        <button
          onClick={() => { setFormNama(""); setFormError(""); setAddModal(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all active:scale-[0.98] shadow-md shadow-blue-500/20"
        >
          <span className="text-lg leading-none">+</span>
          <span>Tambah Kelas</span>
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
                <th className="px-6 py-4 whitespace-nowrap">Nama Kelas</th>
                <th className="px-6 py-4 whitespace-nowrap">Jumlah Siswa</th>
                <th className="px-6 py-4 whitespace-nowrap">Dibuat</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : kelasList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Belum ada kelas. Tambahkan kelas baru.</p>
                  </td>
                </tr>
              ) : (
                kelasList.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                    {/* Nama Kelas */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 bg-white whitespace-nowrap">
                        {k.nama_kelas}
                      </span>
                    </td>

                    {/* Jumlah Siswa */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                        <Users className="w-3 h-3" />
                        {k.jumlah_siswa} Siswa
                      </span>
                    </td>

                    {/* Dibuat */}
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                      {new Date(k.created_at).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openSiswaModal(k)}
                          title="Kelola Siswa"
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditTarget(k); setFormNama(k.nama_kelas); setFormError(""); }}
                          title="Edit Kelas"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(k)}
                          title="Hapus Kelas"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Dialog Tambah Kelas ── */}
      <Dialog open={addModal} onOpenChange={(open) => { if (!open) { setAddModal(false); setFormNama(""); setFormError(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Kelas Baru</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Nama Kelas
            </label>
            <input
              placeholder="contoh: X.PPLG-1"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {formError && <p className="text-red-500 text-xs mt-2">{formError}</p>}
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => { setAddModal(false); setFormNama(""); setFormError(""); }}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              onClick={submitKelas}
              disabled={formLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {formLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Edit Kelas ── */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) { setEditTarget(null); setFormNama(""); setFormError(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Kelas</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Nama Kelas
            </label>
            <input
              placeholder="contoh: X.PPLG-1"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {formError && <p className="text-red-500 text-xs mt-2">{formError}</p>}
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => { setEditTarget(null); setFormNama(""); setFormError(""); }}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              onClick={submitKelas}
              disabled={formLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {formLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Hapus Kelas ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Kelas?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 py-2 leading-relaxed">
            Kelas <span className="font-semibold text-slate-700">{deleteTarget?.nama_kelas}</span> beserta
            seluruh data siswa dan kredensial PIN akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              onClick={deleteKelas}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              Ya, Hapus
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Kelola Siswa ── */}
      <Dialog open={!!siswaTarget} onOpenChange={(open) => { if (!open) { setSiswaTarget(null); setSiswaList([]); setEditSiswa(null); setFormSiswa({ nama: "", nis: "" }); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Kelola Siswa —{" "}
              <span className="text-blue-600">{siswaTarget?.nama_kelas}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Form Tambah/Edit Siswa */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {editSiswa ? "Edit Siswa" : "Tambah Siswa"}
            </p>
            <div className="flex gap-2">
              <input
                placeholder="Nama Siswa"
                value={formSiswa.nama}
                onChange={(e) => setFormSiswa((p) => ({ ...p, nama: e.target.value }))}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
              />
              <input
                placeholder="NIS (opsional)"
                value={formSiswa.nis}
                onChange={(e) => setFormSiswa((p) => ({ ...p, nis: e.target.value }))}
                className="w-36 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
              />
              <button
                onClick={submitSiswa}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition whitespace-nowrap"
              >
                {editSiswa ? "Update" : "Tambah"}
              </button>
              {editSiswa && (
                <button
                  onClick={() => { setEditSiswa(null); setFormSiswa({ nama: "", nis: "" }); setSiswaError(""); }}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
              )}
            </div>
            {siswaError && <p className="text-red-500 text-xs mt-2">{siswaError}</p>}
          </div>

          {/* Search Siswa */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={siswaSearch}
              onChange={(e) => setSiswaSearch(e.target.value)}
              placeholder="Cari nama / NIS..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Daftar Siswa */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-slate-100">
            {siswaLoading ? (
              <p className="text-center text-slate-400 py-10 text-sm">Memuat siswa...</p>
            ) : filteredSiswa.length === 0 ? (
              <p className="text-center text-slate-400 py-10 text-sm">
                {siswaList.length === 0 ? "Belum ada siswa di kelas ini." : "Tidak ditemukan."}
              </p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">No</th>
                    <th className="px-4 py-3 whitespace-nowrap">Nama</th>
                    <th className="px-4 py-3 whitespace-nowrap">NIS</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSiswa.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-300 text-xs w-8">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{s.nama}</td>
                      <td className="px-4 py-3 text-slate-500">{s.nis || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { setEditSiswa(s); setFormSiswa({ nama: s.nama, nis: s.nis || "" }); setSiswaError(""); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteSiswa(s.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-xs text-slate-400">{filteredSiswa.length} siswa</span>
            <button
              onClick={() => setSiswaTarget(null)}
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