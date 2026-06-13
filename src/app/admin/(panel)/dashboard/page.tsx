"use client";
 
import { useState } from "react";
import {
  Vote,
  TrendingUp,
  Clock,
  MonitorSmartphone,
  Download,
  ChevronDown,
} from "lucide-react";
 
export default function AdminDashboardPage() {
  const [selectedClass, setSelectedClass] = useState("all");
 
  return (
    // PERBAIKAN: Menghapus 'max-w-7xl' dan 'mx-auto' agar layout menjadi full-width (100%)
    <main className="pt-20 md:pt-8 px-4 md:px-8 pb-24 md:pb-8 w-full grow">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of election progress and turnout.
          </p>
        </div>
 
        {/* Custom Select Filter */}
        <div className="relative min-w-50">
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">
            Filter by Class
          </label>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent cursor-pointer transition-all shadow-sm"
            >
              <option value="all">All Classes</option>
              <option value="X.PPLG-1">X.PPLG-1</option>
              <option value="X.PPLG-2">X.PPLG-2</option>
              <option value="XI.DKV-1">XI.DKV-1</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
 
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Turnout */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-slate-500">
              Total Turnout
            </h3>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <Vote className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              78.4%
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> +2.1%
            </span>
          </div>
          <div className="mt-5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-1000"
              style={{ width: "78.4%" }}
            ></div>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-3">
            1,254 of 1,600 registered
          </p>
        </div>
 
        {/* Card 2: Pending Votes */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-slate-500">
              Pending Votes
            </h3>
            <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              346
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-5">
            Students yet to cast their ballot
          </p>
        </div>
 
        {/* Card 3: Active Sessions */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-slate-500">
              Active Sessions
            </h3>
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
              <MonitorSmartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              42
            </span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-5">
            Currently logging in or voting
          </p>
        </div>
      </div>
 
      {/* Main Chart Area (Simulated) */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm shadow-slate-200/50 mb-8 h-96 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Real-Time Vote Count
          </h2>
          <button className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-100">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
 
        <div className="flex-1 flex items-end justify-around gap-4 pb-4 border-b border-slate-100 relative mt-4">
          <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-slate-400 text-[10px] font-medium pr-4 border-r border-slate-100">
            <span>600</span>
            <span>450</span>
            <span>300</span>
            <span>150</span>
            <span>0</span>
          </div>
 
          <div className="ml-10 w-full flex justify-around items-end h-full">
            {/* Candidate 1 */}
            <div className="flex flex-col items-center group w-1/4 h-full justify-end relative">
              <div
                className="w-full max-w-20 bg-blue-600 rounded-t-lg relative transition-all duration-300 group-hover:bg-blue-700 shadow-sm"
                style={{ height: "85%" }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg pointer-events-none">
                  510
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>
              <span className="mt-4 text-xs font-bold text-slate-600 truncate w-full text-center">
                Paslon 01
              </span>
            </div>
 
            {/* Candidate 2 */}
            <div className="flex flex-col items-center group w-1/4 h-full justify-end relative">
              <div
                className="w-full max-w-20 bg-slate-200 border border-slate-300 rounded-t-lg relative transition-all duration-300 group-hover:bg-slate-300"
                style={{ height: "60%" }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg pointer-events-none">
                  360
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>
              <span className="mt-4 text-xs font-semibold text-slate-500 truncate w-full text-center">
                Paslon 02
              </span>
            </div>
 
            {/* Candidate 3 */}
            <div className="flex flex-col items-center group w-1/4 h-full justify-end relative">
              <div
                className="w-full max-w-20 bg-slate-200 border border-slate-300 rounded-t-lg relative transition-all duration-300 group-hover:bg-slate-300"
                style={{ height: "40%" }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg pointer-events-none">
                  240
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>
              <span className="mt-4 text-xs font-semibold text-slate-500 truncate w-full text-center">
                Paslon 03
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
