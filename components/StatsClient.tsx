// components/StatsClient.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { StatsData, Kpi } from "@/app/lib/statsData";

const ORANGE = "#fe5502";
const GOLD = "#d4af6a";
const GRID = "#243b5c";
const AXIS = "#8b9bb4";

const card = "rounded-2xl border border-[#1e3a5f] bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] shadow-lg shadow-black/20";
const tip = {
  contentStyle: { backgroundColor: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 12, color: "#fff", fontSize: 12 },
  labelStyle: { color: "#9ca3af" },
  cursor: { fill: "rgba(254,85,2,0.08)" },
};

const ICONS: Record<string, string> = {
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  userPlus: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  cash: "M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
  bag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z",
  gift: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  repeat: "m17 2 4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3",
  disc: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0",
  gem: "M6 3h12l4 6-10 13L2 9zM2 9h20",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 6v6l4 2",
};
const Icon = ({ name, className = "w-5 h-5" }: { name: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={ICONS[name]} />
  </svg>
);

const nf = (n: number, d = 0) => n.toLocaleString("fr-FR", { maximumFractionDigits: d, minimumFractionDigits: d });

function Delta({ kpi, suffix = "" }: { kpi: Kpi; suffix?: string }) {
  if (kpi.prev === 0 && kpi.value === 0) return <span className="text-[11px] text-gray-500">— vs période préc.</span>;
  if (kpi.prev === 0) return <span className="text-[11px] text-emerald-400">Nouveau</span>;
  const pct = ((kpi.value - kpi.prev) / kpi.prev) * 100;
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {up ? <path d="M7 17 17 7M7 7h10v10" /> : <path d="M7 7l10 10M17 7v10H7" />}
      </svg>
      {up ? "+" : ""}{nf(pct, 0)}%
      <span className="font-normal text-gray-500">vs préc.{suffix}</span>
    </span>
  );
}

function KpiCard({ icon, label, value, unit, kpi, accent = ORANGE }: {
  icon: string; label: string; value: string; unit?: string; kpi: Kpi; accent?: string;
}) {
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}1a`, color: accent }}>
          <Icon name={icon} className="w-4 h-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-white tabular-nums">
        {value}{unit && <span className="text-sm font-medium text-gray-500 ml-1">{unit}</span>}
      </p>
      <div className="mt-1"><Delta kpi={kpi} /></div>
    </div>
  );
}

function Section({ title, sub, children, right, className = "" }: {
  title: string; sub?: string; children: React.ReactNode; right?: React.ReactNode; className?: string;
}) {
  return (
    <div className={`${card} p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide">{title}</h2>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

const Empty = ({ text = "Pas encore de données sur cette période" }: { text?: string }) => (
  <p className="text-sm text-gray-500 text-center py-10">{text}</p>
);

const RANGES = [
  { v: 7, l: "7 jours" },
  { v: 30, l: "30 jours" },
  { v: 90, l: "3 mois" },
  { v: 365, l: "1 an" },
];

function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return d < 30 ? `il y a ${d} j` : new Date(iso).toLocaleDateString("fr-FR");
}

export default function StatsClient({ data }: { data: StatsData }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const { kpis: k, lifetime: L } = data;

  const hasSeries = data.series.some((s) => s.visits || s.revenue || s.newCustomers);
  const maxHour = Math.max(...data.hours.map((h) => h.visits), 1);
  const peakHour = data.hours.reduce((a, b) => (b.visits > a.visits ? b : a), data.hours[0]);
  const peakDay = data.weekday.reduce((a, b) => (b.visits > a.visits ? b : a), data.weekday[0]);
  const segTotal = data.segments.reduce((s, x) => s + x.value, 0);
  const maxReward = Math.max(...data.rewardsRanking.map((r) => r.redeemed), 1);
  const exchangeRate = k.pointsIssued.value ? Math.min(100, Math.round((k.pointsRedeemed.value / k.pointsIssued.value) * 100)) : 0;

  return (
    <div className={`space-y-6 transition-opacity ${pending ? "opacity-60" : ""}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#fe5502]/80">Tableau de bord</p>
          <h1 className="text-2xl font-bold text-white">Statistiques</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Performance de votre programme de fidélité · {RANGES.find((r) => r.v === data.range)?.l}
          </p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-[#0a1628] border border-[#1e3a5f] self-start md:self-auto">
          {RANGES.map((r) => (
            <button
              key={r.v}
              type="button"
              onClick={() => start(() => router.push(`${pathname}?range=${r.v}`))}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                data.range === r.v ? "bg-[#fe5502] text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              {r.l}
            </button>
          ))}
        </div>
      </div>

      {/* Lifetime strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "Clients inscrits", v: nf(L.customers) },
          { l: "Points en circulation", v: nf(L.pointsInCirculation) },
          { l: "Chiffre d'affaires cumulé", v: `${nf(L.revenue, 2)} DT` },
          { l: "Visites cumulées", v: nf(L.visits) },
          { l: "Récompenses échangées", v: nf(L.rewardsRedeemed) },
        ].map((x) => (
          <div key={x.l} className="rounded-xl border border-[#d4af6a]/20 bg-[#d4af6a]/[0.05] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#d4af6a]/80">{x.l}</p>
            <p className="text-lg font-bold text-white tabular-nums mt-0.5">{x.v}</p>
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon="cash" label="Chiffre d'affaires" value={nf(k.revenue.value, 2)} unit="DT" kpi={k.revenue} />
        <KpiCard icon="bag" label="Panier moyen" value={nf(k.avgBasket.value, 2)} unit="DT" kpi={k.avgBasket} />
        <KpiCard icon="activity" label="Visites" value={nf(k.visits.value)} kpi={k.visits} />
        <KpiCard icon="users" label="Clients actifs" value={nf(k.activeCustomers.value)} kpi={k.activeCustomers} />
        <KpiCard icon="userPlus" label="Nouveaux clients" value={nf(k.newCustomers.value)} kpi={k.newCustomers} accent="#38bdf8" />
        <KpiCard icon="repeat" label="Taux de retour" value={nf(k.returnRate.value)} unit="%" kpi={k.returnRate} accent="#22c55e" />
        <KpiCard icon="star" label="Points distribués" value={nf(k.pointsIssued.value)} kpi={k.pointsIssued} accent={GOLD} />
        <KpiCard icon="gift" label="Récompenses échangées" value={nf(k.rewardsRedeemed.value)} kpi={k.rewardsRedeemed} accent={GOLD} />
      </div>

      {/* Revenue + visits chart */}
      <Section
        title="Visites & chiffre d'affaires"
        sub={data.range > 90 ? "Par semaine" : "Par jour"}
        right={
          <div className="flex items-center gap-4 text-[11px] text-gray-400">
            <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full" style={{ background: ORANGE }} />CA (DT)</span>
            <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full" style={{ background: "#38bdf8" }} />Visites</span>
          </div>
        }
      >
        {!hasSeries ? <Empty /> : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.series} margin={{ left: -10, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ORANGE} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={ORANGE} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gVis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="label" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis yAxisId="l" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="r" orientation="right" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...tip} />
              <Area yAxisId="l" type="monotone" dataKey="revenue" name="CA (DT)" stroke={ORANGE} strokeWidth={2.2} fill="url(#gRev)" />
              <Area yAxisId="r" type="monotone" dataKey="visits" name="Visites" stroke="#38bdf8" strokeWidth={2} fill="url(#gVis)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* New customers + segments */}
      <div className="grid lg:grid-cols-5 gap-4">
        <Section title="Nouveaux clients" sub={data.range > 90 ? "Par semaine" : "Par jour"} className="lg:col-span-3">
          {!data.series.some((s) => s.newCustomers) ? <Empty /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.series} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="label" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...tip} />
                <Bar dataKey="newCustomers" name="Nouveaux clients" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        <Section title="Segments clients" sub={`${nf(segTotal)} clients au total`} className="lg:col-span-2">
          {segTotal === 0 ? <Empty text="Aucun client pour le moment" /> : (
            <div className="flex items-center gap-4">
              <div className="w-40 h-40 shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.segments} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={2} stroke="none">
                      {data.segments.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                    <Tooltip {...tip} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-white tabular-nums">{nf(segTotal)}</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">clients</span>
                </div>
              </div>
              <ul className="flex-1 space-y-2 min-w-0">
                {data.segments.map((s) => (
                  <li key={s.name} className="flex items-center justify-between text-xs gap-2">
                    <span className="inline-flex items-center gap-2 text-gray-300 min-w-0">
                      <i className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="truncate">{s.name}</span>
                    </span>
                    <span className="text-white font-semibold tabular-nums">
                      {s.value} <span className="text-gray-500 font-normal">({segTotal ? Math.round((s.value / segTotal) * 100) : 0}%)</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      </div>

      {/* Weekday + hour */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Section
          title="Affluence par jour"
          sub="Visites par jour de la semaine"
          right={peakDay.visits > 0 && <span className="text-[11px] text-[#d4af6a] bg-[#d4af6a]/10 border border-[#d4af6a]/25 rounded-full px-2.5 py-1">Pic : {peakDay.label}</span>}
        >
          {data.weekday.every((d) => d.visits === 0) ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.weekday} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="label" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...tip} />
                <Bar dataKey="visits" name="Visites" radius={[6, 6, 0, 0]}>
                  {data.weekday.map((d) => <Cell key={d.label} fill={d.label === peakDay.label ? GOLD : ORANGE} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        <Section
          title="Heures de pointe"
          sub="Visites par heure (heure de Tunis)"
          right={peakHour.visits > 0 && <span className="text-[11px] text-[#d4af6a] bg-[#d4af6a]/10 border border-[#d4af6a]/25 rounded-full px-2.5 py-1">Pic : {peakHour.label}</span>}
        >
          {data.hours.every((h) => h.visits === 0) ? <Empty /> : (
            <>
              <div className="grid grid-cols-12 gap-1.5">
                {data.hours.map((h) => (
                  <div
                    key={h.label}
                    title={`${h.label} : ${h.visits} visite(s)`}
                    className="aspect-square rounded-md flex items-center justify-center text-[10px] font-medium"
                    style={{
                      background: h.visits ? `rgba(254,85,2,${0.15 + 0.85 * (h.visits / maxHour)})` : "rgba(255,255,255,0.04)",
                      color: h.visits ? "#fff" : "#4b5b73",
                    }}
                  >
                    {h.label.replace("h", "")}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-3">Plus la case est intense, plus il y a de visites à cette heure.</p>
            </>
          )}
        </Section>
      </div>

      {/* Top customers + rewards */}
      <div className="grid lg:grid-cols-5 gap-4">
        <Section title="Meilleurs clients" sub="Classés par dépenses sur la période" className="lg:col-span-3">
          {data.topCustomers.length === 0 ? <Empty /> : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-[#1e3a5f]">
                    <th className="text-left py-2 px-1 font-medium">#</th>
                    <th className="text-left py-2 px-1 font-medium">Client</th>
                    <th className="text-right py-2 px-1 font-medium">Visites</th>
                    <th className="text-right py-2 px-1 font-medium">Dépensé</th>
                    <th className="text-right py-2 px-1 font-medium">Solde</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e3a5f]/60">
                  {data.topCustomers.map((c, i) => (
                    <tr key={c.id} className="hover:bg-white/[0.03]">
                      <td className="py-2.5 px-1 text-gray-500 text-xs w-8">{i === 0 ? <span className="text-[#d4af6a]">★</span> : i + 1}</td>
                      <td className="py-2.5 px-1">
                        <a href={`/dashboard/clients/${c.id}`} className="text-white hover:text-[#fe5502] transition-colors font-medium">{c.name}</a>
                      </td>
                      <td className="py-2.5 px-1 text-right text-gray-300 tabular-nums">{c.visits}</td>
                      <td className="py-2.5 px-1 text-right text-white font-semibold tabular-nums">{nf(c.spent, 2)} DT</td>
                      <td className="py-2.5 px-1 text-right text-[#d4af6a] tabular-nums">{nf(c.points)} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section
          title="Récompenses populaires"
          sub="Échanges sur la période"
          className="lg:col-span-2"
          right={<span className="text-[11px] text-gray-400 bg-[#0a1628] border border-[#1e3a5f] rounded-full px-2.5 py-1">Taux d'échange {exchangeRate}%</span>}
        >
          {data.rewardsRanking.length === 0 ? <Empty text="Aucune récompense configurée" /> : (
            <ul className="space-y-3">
              {data.rewardsRanking.slice(0, 6).map((r) => (
                <li key={r.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-200 truncate pr-2">{r.name}</span>
                    <span className="text-gray-400 shrink-0">
                      <b className="text-white">{r.redeemed}</b> · {r.pointsRequired} pts
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#0a1628] border border-[#1e3a5f]/60 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#fe5502] to-[#d4af6a]" style={{ width: `${(r.redeemed / maxReward) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* Spin + social + activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Section title="Roue de la chance" sub="Parties jouées sur la période">
          {data.spin.total === 0 ? <Empty text="Aucune partie jouée" /> : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { l: "Parties", v: data.spin.total },
                  { l: "Gratuites", v: data.spin.free },
                  { l: "Bonus", v: data.spin.bonus },
                ].map((x) => (
                  <div key={x.l} className="rounded-xl bg-[#0a1628] border border-[#1e3a5f]/60 p-2.5 text-center">
                    <p className="text-lg font-bold text-white tabular-nums">{x.v}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">{x.l}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mb-2">Points offerts : <b className="text-[#d4af6a]">{nf(data.spin.pointsAwarded)}</b></p>
              <ul className="space-y-1.5">
                {data.spin.top.map((p) => (
                  <li key={p.label} className="flex justify-between text-xs text-gray-300">
                    <span className="truncate pr-2">{p.label}</span>
                    <b className="text-white">{p.count}</b>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>

        <Section title="Bonus réseaux sociaux" sub="Demandes depuis le lancement">
          {data.bonus.length === 0 ? <Empty text="Aucune demande de bonus" /> : (
            <ul className="space-y-3">
              {data.bonus.map((b) => (
                <li key={b.platform} className="flex items-center justify-between text-xs">
                  <span className="text-gray-200 font-medium">{b.platform}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{b.approved} validés</span>
                    {b.pending > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{b.pending} en attente</span>}
                    {b.rejected > 0 && <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">{b.rejected}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Activité récente" sub="Dernières actions de vos clients">
          {data.activity.length === 0 ? <Empty text="Aucune activité" /> : (
            <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {data.activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 w-7 h-7 shrink-0 rounded-lg flex items-center justify-center"
                    style={{
                      background: a.type === "reward" ? "rgba(212,175,106,0.12)" : a.type === "signup" ? "rgba(56,189,248,0.12)" : "rgba(254,85,2,0.12)",
                      color: a.type === "reward" ? GOLD : a.type === "signup" ? "#38bdf8" : ORANGE,
                    }}
                  >
                    <Icon name={a.type === "reward" ? "gift" : a.type === "signup" ? "userPlus" : "bag"} className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-200 truncate">{a.text}</p>
                    <p className="text-[11px] text-gray-500">{a.sub} · {ago(a.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
