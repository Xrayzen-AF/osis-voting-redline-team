"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  ClipboardCheck,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Data Paslon", href: "/admin/kandidat", icon: Megaphone },
  { label: "Daftar Pemilih", href: "/admin/pemilih", icon: ClipboardCheck },
  { label: "Data Kelas", href: "/admin/kelas", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:left-0 md:z-30 border-r border-slate-100 bg-white px-4 py-6">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
          OP
        </div>
        <div>
          <p className="font-serif font-bold text-slate-900 leading-tight">
            OSIS Portal
          </p>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href + "/"));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="pt-4 border-t border-slate-100">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}