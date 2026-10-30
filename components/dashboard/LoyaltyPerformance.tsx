// components/dashboard/LoyaltyPerformance.tsx
// Server-compatible (no hooks): every figure comes from real visits.
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Banknote,
  Users,
  Repeat,
  UserCheck,
  Gauge,
  CalendarDays,
  Info,
  Lightbulb,
  UserX,
  Minus,
} from "lucide-react";

export type LoyaltyPerformanceData = {
  settings: { avgSpend: number; baseVisits: number; inactiveDays: number };
  visits: { cur: number; prev: number };
  revenue: { cur: number; prev: number };
  extra: { visits: number; revenue: number };
  active: { cur: number; prev: number };
  recurring: { count: number; rate: number }; // rate = % of active customers
  retention: number | null; // % of last period's active customers who came back
  frequency: number; // visits per active customer
  avgTicket: number | null;
  inactiveCount: number;
  totalCustomers: number;
  daily: { cur: number[]; prev: number[]; labels: string[] }; // 30 entries each
  weekdays: number[]; // Mon..Sun, visits in the last 30 days
};

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const money = (n: number) => `${nf.format(Math.round(n * 10) / 10)} DT`;
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DAYS_SHORT = ["L", "M", "M", "J", "V", "S", "D"];

function trendOf(cur: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

function Trend({ cur, prev }: { cur: number; prev: number }) {
  const t = trendOf(cur, prev);
  if (t === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-white/5 rounded-full px-2 py-0.5">
        {cur > 0 ? "Nouveau" : <><Minus size={11} /> Stable</>}
      </span>
    );
  }
  const up = t > 0;
  const flat = t === 0;
  const cls = flat ? "text-gray-300 bg-white/5" : up ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 ${cls}`}>
      {flat ? <Minus size={11} /> : up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? "+" : ""}{t}%
    </span>
  );
}

function Kpi({
  icon, tint, label, value, trend, helper,
}: {
  icon: React.ReactNode; tint: string; label: string; value: React.ReactNode; trend?: React.ReactNode; helper: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tint}22`, color: tint }}>{icon}</span>
        {trend}
      </div>
      <p className="mt-3 text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-0.5 text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="mt-1.5 text-[11px] leading-snug text-gray-500">{helper}</p>
    </div>
  );
}

function VisitsChart({ cur, prev, labels }: { cur: number[]; prev: number[]; labels: string[] }) {
  const W = 640, H = 200, padL = 28, padR = 8, padT = 12, padB = 24;
  const n = cur.length;
  const max = Math.max(1, ...cur, ...prev);
  const niceMax = max <= 4 ? max : Math.ceil(max / 2) * 2;
  const x = (i: number) => padL + (i / (n - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - v / niceMax) * (H - padT - padB);
  const line = (arr: number[]) => arr.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line(cur)} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const ticks = [0, Math.round(niceMax / 2), niceMax].filter((v, i, a) => a.indexOf(v) === i);
  const xLabels = [0, Math.floor((n - 1) / 2), n - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Visites par jour sur 30 jours">
      <defs>
        <linearGradient id="lpArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 4" />
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#9ca3af">{t}</text>
        </g>
      ))}
      <path d={line(prev)} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 4" strokeLinejoin="round" />
      <path d={area} fill="url(#lpArea)" />
      <path d={line(cur)} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {xLabels.map((i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize="10" fill="#9ca3af">{labels[i]}</text>
      ))}
    </svg>
  );
}

export default function LoyaltyPerformance({ data }: { data: LoyaltyPerformanceData }) {
  const { settings: st } = data;
  const empty = data.visits.cur === 0 && data.visits.prev === 0;
  const lowSample = !empty && data.visits.cur < 20;
  const maxDay = Math.max(...data.weekdays);
  const topDayIdx = maxDay > 0 ? data.weekdays.indexOf(maxDay) : -1;
  const totalWeek = data.weekdays.reduce((a, b) => a + b, 0);

  // Plain-language takeaways generated from the real figures
  const insights: { icon: React.ReactNode; text: string }[] = [];
  if (data.inactiveCount > 0) {
    insights.push({
      icon: <UserX size={16} />,
      text: `${data.inactiveCount} client${data.inactiveCount > 1 ? "s" : ""} n'${data.inactiveCount > 1 ? "ont" : "a"} pas visité depuis plus de ${st.inactiveDays} jours : une offre de retour peut les réactiver.`,
    });
  }
  if (data.retention !== null) {
    insights.push({
      icon: <Repeat size={16} />,
      text:
        data.retention >= 60
          ? `${data.retention}% de vos clients du mois dernier sont revenus : votre fidélisation est solide.`
          : data.retention >= 30
          ? `${data.retention}% de vos clients du mois dernier sont revenus. Une récompense plus accessible peut améliorer ce taux.`
          : `Seulement ${data.retention}% de vos clients du mois dernier sont revenus. Pensez à une récompense atteignable dès les premières visites.`,
    });
  }
  if (topDayIdx >= 0 && totalWeek > 0) {
    insights.push({
      icon: <CalendarDays size={16} />,
      text: `Le ${DAYS[topDayIdx].toLowerCase()} concentre ${Math.round((maxDay / totalWeek) * 100)}% de vos visites : idéal pour une offre ciblée ou pour renforcer l'équipe.`,
    });
  }
  if (!empty && data.extra.visits === 0) {
    insights.push({
      icon: <Info size={16} />,
      text: `Aucune visite supplémentaire estimée : vos clients actifs viennent au rythme de référence (${st.baseVisits}/mois). Ajustez ces hypothèses dans Personnaliser > Suivi des revenus.`,
    });
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-7">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-[#8B5CF6]/15 text-[#a78bfa] flex items-center justify-center">
            <TrendingUp size={22} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">Performance de fidélité</h2>
            <p className="text-sm text-gray-400">30 derniers jours, comparés aux 30 jours précédents</p>
          </div>
        </div>
        {lowSample && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1" title="Moins de 20 visites : les pourcentages peuvent varier fortement">
            <Info size={13} /> Échantillon faible ({data.visits.cur} visite{data.visits.cur > 1 ? "s" : ""})
          </span>
        )}
      </div>

      {empty ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--border)] py-10 px-6 text-center">
          <span className="mx-auto w-11 h-11 rounded-xl bg-white/5 text-gray-400 flex items-center justify-center"><TrendingUp size={22} /></span>
          <p className="mt-3 text-white font-medium">Aucune visite enregistrée sur les 60 derniers jours</p>
          <p className="mt-1 text-sm text-gray-400 max-w-md mx-auto">
            Validez un ticket avec « Ajouter des points » : vos revenus, clients récurrents et jours les plus actifs apparaîtront ici automatiquement.
          </p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <Kpi
              icon={<Banknote size={18} />} tint="#10B981" label="Chiffre d'affaires fidélité"
              value={money(data.revenue.cur)}
              trend={<Trend cur={data.revenue.cur} prev={data.revenue.prev} />}
              helper={`Somme des tickets validés sur ${data.visits.cur} visite${data.visits.cur > 1 ? "s" : ""} (${money(data.revenue.prev)} la période précédente).`}
            />
            <Kpi
              icon={<TrendingUp size={18} />} tint="#8B5CF6" label="Revenus supplémentaires estimés"
              value={`+${money(data.extra.revenue)}`}
              helper={`${data.extra.visits} visite${data.extra.visits > 1 ? "s" : ""} au-dessus de la référence (${st.baseVisits}/mois par client) × ${money(st.avgSpend)} par visite.`}
            />
            <Kpi
              icon={<Users size={18} />} tint="#F59E0B" label="Clients actifs"
              value={data.active.cur}
              trend={<Trend cur={data.active.cur} prev={data.active.prev} />}
              helper={`Clients venus au moins une fois, sur ${data.totalCustomers} inscrit${data.totalCustomers > 1 ? "s" : ""}.`}
            />
            <Kpi
              icon={<UserCheck size={18} />} tint="#EC4899" label="Clients récurrents"
              value={data.recurring.count}
              helper={`Venus 2 fois ou plus : ${data.recurring.rate}% de vos clients actifs.`}
            />
            <Kpi
              icon={<Repeat size={18} />} tint="#14B8A6" label="Taux de retour"
              value={data.retention === null ? "—" : `${data.retention}%`}
              helper={data.retention === null ? "Pas encore assez de données sur la période précédente." : "Des clients actifs il y a 30 jours qui sont revenus depuis."}
            />
            <Kpi
              icon={<Gauge size={18} />} tint="#fe5502" label="Fréquence moyenne"
              value={`${nf.format(data.frequency)} visite${data.frequency >= 2 ? "s" : ""}`}
              helper={data.avgTicket !== null ? `Par client actif. Ticket moyen réel : ${money(data.avgTicket)} (réglage : ${money(st.avgSpend)}).` : "Par client actif sur la période."}
            />
          </div>

          {/* Charts */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-white">Visites par jour</h3>
                <div className="flex items-center gap-4 text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#8B5CF6] rounded" /> 30 derniers jours ({data.visits.cur})</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-3 border-t border-dashed border-gray-400" /> Période précédente ({data.visits.prev})</span>
                </div>
              </div>
              <VisitsChart cur={data.daily.cur} prev={data.daily.prev} labels={data.daily.labels} />
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-white/[0.03] p-4">
              <h3 className="text-sm font-semibold text-white">Jours les plus actifs</h3>
              <p className="text-[11px] text-gray-500 mb-3">Répartition des visites par jour de la semaine</p>
              <div className="flex items-end justify-between gap-2 h-32">
                {data.weekdays.map((v, i) => {
                  const h = maxDay > 0 ? Math.max(6, (v / maxDay) * 100) : 6;
                  const top = i === topDayIdx;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                      <span className="text-[10px] text-gray-400 tabular-nums">{v}</span>
                      <div className="w-full rounded-t-md" style={{ height: `${h}%`, backgroundColor: top ? "#8B5CF6" : "rgba(255,255,255,0.15)" }} />
                      <span className={`text-[11px] ${top ? "text-white font-semibold" : "text-gray-500"}`}>{DAYS_SHORT[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Takeaways */}
          {insights.length > 0 && (
            <div className="mt-6 rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/[0.07] p-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Lightbulb size={16} className="text-[#a78bfa]" /> À retenir</h3>
              <ul className="mt-3 space-y-2.5">
                {insights.map((it, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="mt-0.5 text-[#a78bfa] shrink-0">{it.icon}</span>
                    <span>{it.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 text-[11px] text-gray-500">
            Le revenu supplémentaire est une estimation basée sur vos hypothèses ({money(st.avgSpend)} par visite, {st.baseVisits} visite/mois de référence, client inactif après {st.inactiveDays} jours).{" "}
            <Link href="/dashboard/personalize" className="underline hover:text-gray-300">Modifier</Link>
          </p>
        </>
      )}
    </section>
  );
}
