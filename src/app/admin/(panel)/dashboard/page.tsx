"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Vote,
  TrendingUp,
  Clock,
  MonitorSmartphone,
  Download,
  ChevronDown,
  RefreshCw,
  Award,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface Paslon {
  id: number;
  name: string;
  ketua: string;
  wakil: string;
  votes: number;
  color: string;
}

interface KelasData {
  name: string;
  registered: number;
  voted: number;
  votesByPaslon: number[];
}

interface DashboardData {
  registered: number;
  voted: number;
  sessions: number;
  paslons: Paslon[];
  classes: KelasData[];
  hourlyActivity: { hour: string; count: number }[];
  lastUpdated: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 1000) / 10;
}

function fmt(n: number): string {
  return n.toLocaleString("id-ID");
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
  barValue,
  trend,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  barValue?: number;
  trend?: { label: string; positive: boolean };
}) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-500">{label}</h3>
        <div className={`${iconBg} p-2 rounded-lg ${iconColor}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium flex items-center px-1.5 py-0.5 rounded-md ${
              trend.positive
                ? "text-emerald-600 bg-emerald-50"
                : "text-rose-500 bg-rose-50"
            }`}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend.label}
          </span>
        )}
      </div>
      {barValue !== undefined && (
        <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-700"
            style={{ width: `${barValue}%` }}
          />
        </div>
      )}
      <p className="text-xs font-medium text-slate-500 mt-3">{sub}</p>
    </div>
  );
}

function PaslonCard({
  paslon,
  totalVotes,
  rank,
}: {
  paslon: Paslon;
  totalVotes: number;
  rank: number;
}) {
  const share = pct(paslon.votes, totalVotes);
  const isLeading = rank === 1;

  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        isLeading
          ? "border-blue-200 bg-blue-50/60"
          : "border-white/40 bg-white/70"
      } backdrop-blur-xl shadow-sm shadow-slate-200/50`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
            style={{ backgroundColor: paslon.color }}
          >
            {String(paslon.id).padStart(2, "0")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900">{paslon.name}</p>
              {isLeading && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  <Award className="w-3 h-3" /> Unggul
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {paslon.ketua} & {paslon.wakil}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: paslon.color }}>
            {share}%
          </p>
          <p className="text-xs text-slate-500">{fmt(paslon.votes)} suara</p>
        </div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${share}%`, backgroundColor: paslon.color }}
        />
      </div>
    </div>
  );
}

function ClassTable({
  classes,
}: {
  classes: KelasData[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Kelas
            </th>
            <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Memilih
            </th>
            <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Turnout
            </th>
            <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => {
            const p = pct(c.voted, c.registered);
            const statusClass =
              p >= 80
                ? "bg-emerald-50 text-emerald-700"
                : p >= 50
                ? "bg-amber-50 text-amber-700"
                : "bg-rose-50 text-rose-600";
            const statusLabel =
              p >= 80 ? "Tinggi" : p >= 50 ? "Sedang" : "Rendah";

            return (
              <tr
                key={c.name}
                className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
              >
                <td className="py-3 px-3 font-semibold text-slate-800">
                  {c.name}
                </td>
                <td className="py-3 px-3 text-slate-600">
                  {c.voted}/{c.registered}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 w-10">
                      {p}%
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden min-w-[60px]">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-700"
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [selectedClass, setSelectedClass] = useState("all");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch data from API ──────────────────────────────────────────────────
  const fetchData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        const params = new URLSearchParams();
        if (selectedClass !== "all") params.set("class", selectedClass);

        const res = await fetch(`/api/admin/dashboard?${params.toString()}`);
        if (!res.ok) throw new Error("Gagal mengambil data");
        const json: DashboardData = await res.json();
        setData(json);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedClass]
  );

  // Auto-refresh setiap 10 detik
  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => fetchData(true), 10_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  // ── Derived values ───────────────────────────────────────────────────────
  const turnoutPct = data ? pct(data.voted, data.registered) : 0;
  const pending = data ? data.registered - data.voted : 0;
  const totalVotes = data?.voted ?? 0;
  const sortedPaslons = data
    ? [...data.paslons].sort((a, b) => b.votes - a.votes)
    : [];

  // ── Chart configs ────────────────────────────────────────────────────────
  const voteBarData = {
    labels: sortedPaslons.map((p) => p.name),
    datasets: [
      {
        label: "Suara",
        data: sortedPaslons.map((p) => p.votes),
        backgroundColor: sortedPaslons.map((p) => p.color + "cc"),
        borderColor: sortedPaslons.map((p) => p.color),
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const classBarsData = {
    labels: data?.classes.map((c) => c.name) ?? [],
    datasets: (data?.paslons ?? []).map((p) => ({
      label: p.name,
      data: data?.classes.map((c) => c.votesByPaslon[p.id - 1] ?? 0) ?? [],
      backgroundColor: p.color + "bb",
      borderColor: p.color,
      borderWidth: 1,
      borderRadius: 4,
    })),
  };

  const timelineData = {
    labels: data?.hourlyActivity.map((h) => h.hour) ?? [],
    datasets: [
      {
        label: "Suara masuk",
        data: data?.hourlyActivity.map((h) => h.count) ?? [],
        borderColor: "#1a56db",
        backgroundColor: "#1a56db18",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#1a56db",
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 11 } } },
      y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: "#94a3b8", font: { size: 11 } } },
    },
  };

  // ── Unique class names for filter dropdown ───────────────────────────────
  const classNames = data?.classes.map((c) => c.name) ?? [];

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="pt-20 md:pt-8 px-4 md:px-8 pb-24 md:pb-8 w-full grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Memuat data dashboard...</p>
        </div>
      </main>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="pt-20 md:pt-8 px-4 md:px-8 pb-24 md:pb-8 w-full grow">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            {refreshing && <RefreshCw className="w-3 h-3 animate-spin" />}
            {data?.lastUpdated
              ? `Diperbarui ${new Date(data.lastUpdated).toLocaleTimeString("id-ID")} WIB`
              : "Overview progres dan turnout pemilihan."}
          </p>
        </div>

        <div className="flex items-end gap-3">
          {/* Manual refresh */}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-slate-600 text-sm font-medium hover:bg-slate-100 px-4 py-2.5 rounded-xl transition-colors border border-slate-200 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {/* Filter by Class */}
          <div className="relative min-w-48">
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">
              Filter by Class
            </label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent cursor-pointer transition-all shadow-sm"
              >
                <option value="all">Semua Kelas</option>
                {classNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          label="Total Turnout"
          value={`${turnoutPct}%`}
          sub={`${fmt(totalVotes)} dari ${fmt(data?.registered ?? 0)} terdaftar`}
          icon={<Vote className="w-5 h-5" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          barValue={turnoutPct}
          trend={{ label: "+live", positive: true }}
        />
        <MetricCard
          label="Belum Memilih"
          value={fmt(pending)}
          sub="Siswa belum mencoblos"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <MetricCard
          label="Sesi Aktif"
          value={fmt(data?.sessions ?? 0)}
          sub="Sedang login atau memilih"
          icon={<MonitorSmartphone className="w-5 h-5" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Paslon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {sortedPaslons.map((p, i) => (
          <PaslonCard key={p.id} paslon={p} totalVotes={totalVotes} rank={i + 1} />
        ))}
      </div>

      {/* Vote Bar Chart */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm shadow-slate-200/50 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Perolehan Suara Real-Time
          </h2>
          <button className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-100">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
        <div className="h-72">
          <Bar data={voteBarData} options={chartOptions} />
        </div>
      </div>

      {/* Class Table + Class Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Turnout per Kelas
          </h2>
          <ClassTable classes={data?.classes ?? []} />
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Sebaran Suara per Kelas
          </h2>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4">
            {data?.paslons.map((p) => (
              <span
                key={p.id}
                className="flex items-center gap-1.5 text-xs text-slate-500"
              >
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ backgroundColor: p.color }}
                />
                {p.name}
              </span>
            ))}
          </div>
          <div className="h-56">
            <Bar data={classBarsData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      {/* Hourly Timeline */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Aktivitas Voting (per jam)
          </h2>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
            Hari ini
          </span>
        </div>
        <div className="h-52">
          <Line data={timelineData} options={chartOptions} />
        </div>
      </div>

    </main>
  );
}