"use client";
 
import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
 
interface ClassData {
  id: string;
  name: string;
  totalStudents: number;
  createdAt: string;
}
 
const mockClasses: ClassData[] = [
  {
    id: "uuid-1",
    name: "X.PPLG-1",
    totalStudents: 36,
    createdAt: "2026-06-01",
  },
  {
    id: "uuid-2",
    name: "X.PPLG-2",
    totalStudents: 35,
    createdAt: "2026-06-01",
  },
];
 
export default function DataKelasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
 
  const filteredClasses = mockClasses.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
 
  return (
    <main className="pt-20 md:pt-8 px-4 md:px-8 pb-24 md:pb-8 w-full grow">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Manajemen Kelas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola master data kelas.
          </p>
        </div>
 
        {/* Dialog Tambah Kelas */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all active:scale-[0.98] shadow-md shadow-blue-500/20">
              <Plus className="w-5 h-5" />
              <span>Tambah Kelas</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>Tambah Kelas Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <input
                placeholder="Nama Kelas (Contoh: X.PPLG-1)"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <DialogFooter>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Simpan
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
 
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              placeholder="Cari nama kelas..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
 
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Nama Kelas</th>
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClasses.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4">{item.totalStudents}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
