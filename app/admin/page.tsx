// app/admin/page.tsx  — Admin dashboard (overview)
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import {
  GrowthChart,
  VisitsChart,
  DonutChart,
  TopRestaurantsChart,
} from "@/components/admin/AdminCharts";

export const dynamic = "force-dynamic";

/* ----------------------------- helpers ----------------------------- */
const pct = (cur: number, prev: number) =>
  prev > 0 ? Math.round(((cur - prev) / prev) * 100) : cur > 0 ? 100 : 0;

const nf = new Intl.NumberFormat("fr-FR");
const money = (n: number) => `${nf.format(Math.round(n))} DT`;
const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
const fmtDateTime = (d: Date | string) =>
  new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const PLAN_META: Record<string, { label: string; color: string }> = {
  FREE: { label: "1 mois", color: "#94A3B8" },
  BASIC: { label: "3 mois", color: "#0EA5E9" },
  PREMIUM: { label: "6 mois", color: "#4F46E5" },
  ENTERPRISE: { label: "1 an", color: "#F59E0B" },
};

const ACTION_LABELS: Record<string, string> = {
  APPROVE: "Approbation",
  SUSPEND: "Suspension",
  ACTIVATE: "Activation",
  DELETE: "Suppression",
  UPDATE: "Modification",
  CREATE: "Création",
};

/* ------------------------------ page ------------------------------- */
export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/auth/signin");

  const now = new Date();
  const startMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  // same elapsed period last month (fair comparison mid-month)
  const prevEnd = new Date(
    Math.min(startMonth.getTime(), startLastMonth.getTime() + (now.getTime() - startMonth.getTime()))
  );
  const since12 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const since30 = new Date(now);
  since30.setUTCHours(0, 0, 0, 0);
  since30.setUTCDate(since30.getUTCDate() - 29);
  const in14 = new Date(now.getTime() + 14 * 86400000);
  const inactiveSince = new Date(now.getTime() - 30 * 86400000);

  const [
    statusGroups,
    totalCustomers,
    customersThisMonth,
    customersPrevPeriod,
    activeCustomers30,
    restaurantsThisMonth,
    restaurantsPrevPeriod,
    visitsMonth,
    visitsPrev,
    planGroups,
    paidValue,
    rewardsEarnedMonth,
    rewardsUsedMonth,
    pendingBonusRequests,
    restaurantMonthly,
    customerMonthly,
    visitsDaily,
    topRestaurantsRaw,
    pendingList,
    recentRestaurants,
    expiringSubs,
    inactiveCount,
    recentLogs,
  ] = await Promise.all([
    prisma.restaurant.groupBy({ by: ["accountStatus"], _count: { _all: true } }),
    prisma.customerProfile.count(),
    prisma.customerProfile.count({ where: { createdAt: { gte: startMonth } } }),
    prisma.customerProfile.count({ where: { createdAt: { gte: startLastMonth, lt: prevEnd } } }),
    prisma.customerProfile.count({ where: { lastVisit: { gte: since30 } } }),
    prisma.restaurant.count({ where: { createdAt: { gte: startMonth } } }),
    prisma.restaurant.count({ where: { createdAt: { gte: startLastMonth, lt: prevEnd } } }),
    prisma.visit.aggregate({
      where: { date: { gte: startMonth } },
      _count: { _all: true },
      _sum: { amount: true, pointsEarned: true },
    }),
    prisma.visit.aggregate({
      where: { date: { gte: startLastMonth, lt: prevEnd } },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.subscription.groupBy({ by: ["plan"], _count: { _all: true } }),
    prisma.subscription.aggregate({
      where: { restaurant: { accountStatus: "ACTIVE" } },
      _sum: { price: true },
    }),
    prisma.earnedReward.count({ where: { earnedAt: { gte: startMonth } } }),
    prisma.earnedReward.count({ where: { usedAt: { gte: startMonth } } }),
    prisma.bonusRequest.count({ where: { status: "PENDING" } }),
    prisma.$queryRaw<{ m: string; c: number }[]>`
      SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS m, COUNT(*)::int AS c
      FROM "Restaurant" WHERE "createdAt" >= ${since12} GROUP BY 1`,
    prisma.$queryRaw<{ m: string; c: number }[]>`
      SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS m, COUNT(*)::int AS c
      FROM "CustomerProfile" WHERE "createdAt" >= ${since12} GROUP BY 1`,
    prisma.$queryRaw<{ d: string; c: number; a: number }[]>`
      SELECT to_char(date_trunc('day', "date"), 'YYYY-MM-DD') AS d,
             COUNT(*)::int AS c, COALESCE(SUM("amount"), 0)::float AS a
      FROM "Visit" WHERE "date" >= ${since30} GROUP BY 1`,
    prisma.$queryRaw<{ id: string; name: string; customers: number; visits: number }[]>`
      SELECT r."id", r."name",
             COUNT(DISTINCT c."id")::int AS customers,
             COUNT(v."id") FILTER (WHERE v."date" >= ${since30})::int AS visits
      FROM "Restaurant" r
      LEFT JOIN "CustomerProfile" c ON c."restaurantId" = r."id"
      LEFT JOIN "Visit" v ON v."customerId" = c."id"
      GROUP BY r."id", r."name"
      ORDER BY customers DESC, visits DESC
      LIMIT 6`,
    prisma.restaurant.findMany({
      where: { accountStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, createdAt: true, owner: { select: { name: true, email: true } } },
    }),
    prisma.restaurant.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, accountStatus: true, createdAt: true, _count: { select: { customers: true } } },
    }),
    prisma.subscription.findMany({
      where: { endDate: { gte: now, lte: in14 } },
      orderBy: { endDate: "asc" },
      take: 5,
      select: { plan: true, endDate: true, restaurant: { select: { id: true, name: true } } },
    }),
    prisma.restaurant.count({
      where: {
        accountStatus: "ACTIVE",
        OR: [{ lastLoginAt: { lt: inactiveSince } }, { lastLoginAt: null }],
      },
    }),
    prisma.adminLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { admin: { select: { name: true, email: true } } },
    }),
  ]);

  /* ---------------------------- derived data --------------------------- */
  const statusCount = (s: string) => statusGroups.find((g) => g.accountStatus === s)?._count._all ?? 0;
  const active = statusCount("ACTIVE");
  const pending = statusCount("PENDING");
  const suspended = statusCount("SUSPENDED");
  const totalRestaurants = active + pending + suspended;

  const visitsCount = visitsMonth._count._all;
  const visitsPrevCount = visitsPrev._count._all;
  const spendMonth = visitsMonth._sum.amount ?? 0;
  const pointsMonth = visitsMonth._sum.pointsEarned ?? 0;

  // Restaurants without a subscription row count as FREE
  const withSub = planGroups.reduce((s, g) => s + g._count._all, 0);
  const planCount = (p: string) =>
    (planGroups.find((g) => g.plan === p)?._count._all ?? 0) + (p === "FREE" ? Math.max(0, totalRestaurants - withSub) : 0);
  const planData = Object.entries(PLAN_META).map(([key, m]) => ({
    name: m.label,
    value: planCount(key),
    color: m.color,
  }));

  const statusData = [
    { name: "Actifs", value: active, color: "#10B981" },
    { name: "En attente", value: pending, color: "#F59E0B" },
    { name: "Suspendus", value: suspended, color: "#F43F5E" },
  ];

  // 12-month series
  const restMap = new Map(restaurantMonthly.map((r) => [r.m, r.c]));
  const custMap = new Map(customerMonthly.map((r) => [r.m, r.c]));
  const growthData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    return {
      label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit", timeZone: "UTC" }),
      restaurants: restMap.get(key) ?? 0,
      customers: custMap.get(key) ?? 0,
    };
  });

  // 30-day series
  const visitMap = new Map(visitsDaily.map((r) => [r.d, r]));
  const visitsData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since30.getTime() + i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const row = visitMap.get(key);
    return {
      label: `${key.slice(8, 10)}/${key.slice(5, 7)}`,
      visits: row?.c ?? 0,
      amount: Math.round(row?.a ?? 0),
    };
  });

  const topData = topRestaurantsRaw.map((r) => ({
    name: r.name,
    customers: Number(r.customers),
    visits: Number(r.visits),
  }));

  const retention = totalCustomers > 0 ? Math.round((activeCustomers30 / totalCustomers) * 100) : 0;
  const avgCustomers = totalRestaurants > 0 ? Math.round((totalCustomers / totalRestaurants) * 10) / 10 : 0;

  /* ------------------------------ render ------------------------------ */
  const kpis = [
    {
      label: "Restaurants",
      value: nf.format(totalRestaurants),
      sub: `${active} actifs · ${pending} en attente · ${suspended} suspendus`,
      trend: pct(restaurantsThisMonth, restaurantsPrevPeriod),
      trendLabel: `+${restaurantsThisMonth} ce mois`,
      accent: "bg-indigo-50 text-indigo-600",
      icon: "🏪",
    },
    {
      label: "Clients",
      value: nf.format(totalCustomers),
      sub: `${activeCustomers30} actifs (30 j) · ${retention}% de rétention`,
      trend: pct(customersThisMonth, customersPrevPeriod),
      trendLabel: `+${customersThisMonth} ce mois`,
      accent: "bg-emerald-50 text-emerald-600",
      icon: "👥",
    },
    {
      label: "Visites (ce mois)",
      value: nf.format(visitsCount),
      sub: `${nf.format(pointsMonth)} points distribués`,
      trend: pct(visitsCount, visitsPrevCount),
      trendLabel: "vs même période",
      accent: "bg-sky-50 text-sky-600",
      icon: "📍",
    },
    {
      label: "Montant encaissé (ce mois)",
      value: money(spendMonth),
      sub: `Moy. ${visitsCount ? money(spendMonth / visitsCount) : "0 DT"} / visite`,
      trend: pct(spendMonth, visitsPrev._sum.amount ?? 0),
      trendLabel: "vs même période",
      accent: "bg-amber-50 text-amber-600",
      icon: "💰",
    },
  ];

  const secondary = [
    { label: "Valeur des abonnements", value: money(paidValue._sum.price ?? 0), hint: "Somme des prix, comptes actifs" },
    { label: "Récompenses gagnées", value: nf.format(rewardsEarnedMonth), hint: "Ce mois" },
    { label: "Récompenses utilisées", value: nf.format(rewardsUsedMonth), hint: "Ce mois" },
    { label: "Clients / restaurant", value: String(avgCustomers), hint: "Moyenne" },
  ];

  const alerts = [
    pending > 0 && { text: `${pending} restaurant(s) en attente d'approbation`, href: "/admin/restaurants?status=PENDING", tone: "amber" },
    pendingBonusRequests > 0 && { text: `${pendingBonusRequests} demande(s) de bonus en attente`, href: "/admin/restaurants", tone: "indigo" },
    expiringSubs.length > 0 && { text: `${expiringSubs.length} abonnement(s) expirent sous 14 jours`, href: "/admin/plans", tone: "rose" },
    inactiveCount > 0 && { text: `${inactiveCount} restaurant(s) actif(s) sans connexion depuis 30 jours`, href: "/admin/restaurants?status=ACTIVE", tone: "slate" },
  ].filter(Boolean) as { text: string; href: string; tone: string }[];

  const toneClass: Record<string, string> = {
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    indigo: "bg-indigo-50 text-indigo-800 border-indigo-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const statusBadge: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    SUSPENDED: "bg-rose-100 text-rose-700",
  };
  const statusLabel: Record<string, string> = { ACTIVE: "Actif", PENDING: "En attente", SUSPENDED: "Suspendu" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#282424] sm:text-3xl">Tableau de bord</h1>
          <p className="mt-1 text-sm text-gray-500">
            Vue d'ensemble de la plateforme · mis à jour {fmtDateTime(now)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/restaurants" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Gérer les restaurants
          </Link>
          <Link href="/admin/plans" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Plans
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {alerts.map((a) => (
            <Link key={a.text} href={a.href} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium ${toneClass[a.tone]}`}>
              <span>{a.text}</span>
              <span aria-hidden>→</span>
            </Link>
          ))}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-gray-500">{k.label}</p>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${k.accent}`}>{k.icon}</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{k.value}</p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-semibold ${k.trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {k.trend >= 0 ? "▲" : "▼"} {Math.abs(k.trend)}%
              </span>
              <span className="text-gray-400">{k.trendLabel}</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {secondary.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{s.value}</p>
            <p className="mt-0.5 text-[11px] text-gray-400">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900">Croissance sur 12 mois</h2>
          <p className="mb-3 text-xs text-gray-500">Nouveaux clients et nouveaux restaurants par mois</p>
          <GrowthChart data={growthData} />
        </section>
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Répartition des plans</h2>
          <p className="mb-3 text-xs text-gray-500">Restaurants par durée d'abonnement</p>
          <DonutChart data={planData} />
        </section>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900">Activité des 30 derniers jours</h2>
          <p className="mb-3 text-xs text-gray-500">Visites par jour et montant encaissé</p>
          <VisitsChart data={visitsData} />
        </section>
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Statut des comptes</h2>
          <p className="mb-3 text-xs text-gray-500">Restaurants par statut</p>
          <DonutChart data={statusData} />
        </section>
      </div>

      {/* Top restaurants + pending */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Top restaurants</h2>
          <p className="mb-3 text-xs text-gray-500">Par nombre de clients</p>
          <TopRestaurantsChart data={topData} />
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">En attente d'approbation</h2>
              <p className="text-xs text-gray-500">Nouveaux restaurants à valider</p>
            </div>
            <Link href="/admin/restaurants?status=PENDING" className="text-sm font-medium text-indigo-600 hover:underline">Tout voir</Link>
          </div>
          {pendingList.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Aucune demande en attente 🎉</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pendingList.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{r.name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {r.owner?.name || r.owner?.email} · {fmtDate(r.createdAt)}
                    </p>
                  </div>
                  <Link href={`/admin/restaurants/${r.id}/approve`} className="flex-shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">
                    Examiner
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {expiringSubs.length > 0 && (
            <div className="mt-5 border-t border-gray-100 pt-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Abonnements bientôt expirés</h3>
              <ul className="space-y-2">
                {expiringSubs.map((s) => (
                  <li key={s.restaurant.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-gray-700">
                      {s.restaurant.name}
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                        {PLAN_META[s.plan]?.label ?? s.plan}
                      </span>
                    </span>
                    <span className="flex-shrink-0 text-xs font-medium text-rose-600">{s.endDate ? fmtDate(s.endDate) : "—"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* Recent restaurants + admin activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Derniers restaurants inscrits</h2>
          <ul className="divide-y divide-gray-100">
            {recentRestaurants.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">
                    {fmtDate(r.createdAt)} · {r._count.customers} client(s)
                  </p>
                </div>
                <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge[r.accountStatus]}`}>
                  {statusLabel[r.accountStatus]}
                </span>
              </li>
            ))}
            {recentRestaurants.length === 0 && <li className="py-6 text-center text-sm text-gray-400">Aucun restaurant</li>}
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Activité récente des admins</h2>
            <Link href="/admin/logs" className="text-sm font-medium text-indigo-600 hover:underline">Tous les logs</Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {recentLogs.map((l) => (
              <li key={l.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-900">
                    {ACTION_LABELS[l.action] ?? l.action}
                    <span className="ml-2 text-xs font-normal text-gray-500">{l.targetType}</span>
                  </p>
                  <span className="flex-shrink-0 text-xs text-gray-400">{fmtDateTime(l.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-500">par {l.admin?.name || l.admin?.email || "Système"}</p>
              </li>
            ))}
            {recentLogs.length === 0 && <li className="py-6 text-center text-sm text-gray-400">Aucune activité</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
