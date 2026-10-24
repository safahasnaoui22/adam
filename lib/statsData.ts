// app/lib/statsData.ts
// Aggregates everything shown on /dashboard/stats for one business.
import { prisma } from "@/app/lib/prisma";

const TZ = "Africa/Tunis";
const DAY = 86400000;

export type Kpi = { value: number; prev: number };

export interface StatsData {
  range: number;
  generatedAt: string;
  lifetime: { customers: number; pointsInCirculation: number; revenue: number; visits: number; rewardsRedeemed: number };
  kpis: {
    newCustomers: Kpi;
    activeCustomers: Kpi;
    visits: Kpi;
    revenue: Kpi;
    avgBasket: Kpi;
    pointsIssued: Kpi;
    rewardsRedeemed: Kpi;
    pointsRedeemed: Kpi;
    returnRate: Kpi; // % of active customers with 2+ visits in the period
    spins: Kpi;
  };
  series: { label: string; visits: number; revenue: number; newCustomers: number; points: number }[];
  weekday: { label: string; visits: number }[];
  hours: { label: string; visits: number }[];
  segments: { name: string; value: number; color: string }[];
  topCustomers: { id: string; name: string; visits: number; spent: number; points: number }[];
  rewardsRanking: { name: string; pointsRequired: number; redeemed: number }[];
  activity: { type: "visit" | "reward" | "signup"; text: string; sub: string; at: string }[];
  spin: { total: number; free: number; bonus: number; pointsAwarded: number; top: { label: string; count: number }[] };
  bonus: { platform: string; approved: number; pending: number; rejected: number }[];
}

const fmtDay = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const fmtHour = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false });
const fmtWeekday = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" });
const dayKey = (d: Date) => fmtDay.format(d); // YYYY-MM-DD in Tunis time
const hourOf = (d: Date) => parseInt(fmtHour.format(d), 10) % 24;
const WD = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const WD_MAP: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

const PLATFORM_LABEL: Record<string, string> = {
  googleMaps: "Google Maps",
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "X / Twitter",
  tiktok: "TikTok",
};

export async function getStatsData(restaurantId: string, range: number): Promise<StatsData> {
  const now = new Date();
  const start = new Date(now.getTime() - range * DAY);
  const prevStart = new Date(now.getTime() - 2 * range * DAY);

  const [customers, visits, earned, spins, bonusReqs, lifetimeVisits, lifetimeRewards, program] = await Promise.all([
    prisma.customerProfile.findMany({
      where: { restaurantId },
      select: { id: true, name: true, points: true, createdAt: true, lastVisit: true },
    }),
    prisma.visit.findMany({
      where: { customer: { restaurantId }, date: { gte: prevStart } },
      select: { id: true, date: true, amount: true, pointsEarned: true, customerId: true },
      orderBy: { date: "desc" },
    }),
    prisma.earnedReward.findMany({
      where: { customer: { restaurantId }, earnedAt: { gte: prevStart } },
      select: { earnedAt: true, customerId: true, reward: { select: { name: true, pointsRequired: true } } },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.spinLog.findMany({
      where: { restaurantId, spunAt: { gte: prevStart } },
      select: { spunAt: true, source: true, pointsAwarded: true, prizeLabel: true },
    }),
    prisma.bonusRequest.findMany({
      where: { restaurantId },
      select: { platform: true, status: true },
    }),
    prisma.visit.aggregate({
      where: { customer: { restaurantId } },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.earnedReward.count({ where: { customer: { restaurantId } } }),
    prisma.loyaltyProgram.findFirst({
      where: { restaurantId },
      include: { rewards: { where: { isActive: true }, orderBy: { pointsRequired: "asc" } } },
    }),
  ]);

  const inCur = (d: Date) => d >= start;
  const inPrev = (d: Date) => d >= prevStart && d < start;

  const nameById = new Map(customers.map((c) => [c.id, c.name]));

  // ── KPIs ──
  const calc = (pick: (d: Date) => boolean) => {
    const v = visits.filter((x) => pick(x.date));
    const revenue = v.reduce((s, x) => s + (x.amount ?? 0), 0);
    const withAmount = v.filter((x) => x.amount != null && x.amount > 0);
    const perCustomer = new Map<string, number>();
    v.forEach((x) => perCustomer.set(x.customerId, (perCustomer.get(x.customerId) ?? 0) + 1));
    const active = perCustomer.size;
    const returning = [...perCustomer.values()].filter((n) => n >= 2).length;
    const e = earned.filter((x) => pick(x.earnedAt));
    return {
      newCustomers: customers.filter((c) => pick(c.createdAt)).length,
      active,
      visits: v.length,
      revenue,
      avgBasket: withAmount.length ? revenue / withAmount.length : 0,
      pointsIssued: v.reduce((s, x) => s + Math.max(x.pointsEarned, 0), 0),
      rewards: e.length,
      pointsRedeemed: e.reduce((s, x) => s + x.reward.pointsRequired, 0),
      returnRate: active ? Math.round((returning / active) * 100) : 0,
      spins: spins.filter((x) => pick(x.spunAt)).length,
    };
  };
  const cur = calc(inCur);
  const prev = calc(inPrev);
  const k = (a: number, b: number): Kpi => ({ value: a, prev: b });

  // ── Time series (daily up to 90 days, weekly beyond) ──
  const weekly = range > 90;
  const bucketOf = (d: Date) => {
    const key = dayKey(d);
    if (!weekly) return key;
    const t = new Date(key + "T00:00:00Z");
    const dow = (t.getUTCDay() + 6) % 7; // Monday = 0
    return dayKey(new Date(t.getTime() - dow * DAY + 12 * 3600000));
  };
  const buckets = new Map<string, { visits: number; revenue: number; newCustomers: number; points: number }>();
  for (let t = start.getTime(); t <= now.getTime(); t += DAY) {
    const key = bucketOf(new Date(t));
    if (!buckets.has(key)) buckets.set(key, { visits: 0, revenue: 0, newCustomers: 0, points: 0 });
  }
  const ensure = (d: Date) => {
    const key = bucketOf(d);
    if (!buckets.has(key)) buckets.set(key, { visits: 0, revenue: 0, newCustomers: 0, points: 0 });
    return buckets.get(key)!;
  };
  visits.filter((x) => inCur(x.date)).forEach((x) => {
    const b = ensure(x.date);
    b.visits += 1;
    b.revenue += x.amount ?? 0;
    b.points += Math.max(x.pointsEarned, 0);
  });
  customers.filter((c) => inCur(c.createdAt)).forEach((c) => (ensure(c.createdAt).newCustomers += 1));
  const series = [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => {
      const [, m, d] = key.split("-");
      return { label: `${d}/${m}`, ...v, revenue: Math.round(v.revenue * 100) / 100 };
    });

  // ── Weekday & hour ──
  const wd = new Array(7).fill(0);
  const hr = new Array(24).fill(0);
  visits.filter((x) => inCur(x.date)).forEach((x) => {
    wd[WD_MAP[fmtWeekday.format(x.date)] ?? 0] += 1;
    hr[hourOf(x.date)] += 1;
  });

  // ── Segments (all customers) ──
  const seg = { vip: 0, nouveau: 0, actif: 0, inactif: 0 };
  customers.forEach((c) => {
    const last = c.lastVisit ?? c.createdAt;
    if (c.points > 500) seg.vip++;
    else if (now.getTime() - c.createdAt.getTime() <= 14 * DAY) seg.nouveau++;
    else if (now.getTime() - last.getTime() <= 30 * DAY) seg.actif++;
    else seg.inactif++;
  });
  const segments = [
    { name: "VIP (+500 pts)", value: seg.vip, color: "#d4af6a" },
    { name: "Nouveaux (14 j)", value: seg.nouveau, color: "#38bdf8" },
    { name: "Actifs (30 j)", value: seg.actif, color: "#22c55e" },
    { name: "Inactifs", value: seg.inactif, color: "#64748b" },
  ];

  // ── Top customers (period) ──
  const agg = new Map<string, { visits: number; spent: number }>();
  visits.filter((x) => inCur(x.date)).forEach((x) => {
    const a = agg.get(x.customerId) ?? { visits: 0, spent: 0 };
    a.visits += 1;
    a.spent += x.amount ?? 0;
    agg.set(x.customerId, a);
  });
  const pointsById = new Map(customers.map((c) => [c.id, c.points]));
  const topCustomers = [...agg.entries()]
    .sort(([, a], [, b]) => b.spent - a.spent || b.visits - a.visits)
    .slice(0, 8)
    .map(([id, a]) => ({
      id,
      name: nameById.get(id) ?? "Client",
      visits: a.visits,
      spent: Math.round(a.spent * 100) / 100,
      points: pointsById.get(id) ?? 0,
    }));

  // ── Rewards ranking (period) ──
  const counts = new Map<string, number>();
  earned.filter((x) => inCur(x.earnedAt)).forEach((x) => counts.set(x.reward.name, (counts.get(x.reward.name) ?? 0) + 1));
  const rewardsRanking = (program?.rewards ?? [])
    .map((r) => ({ name: r.name, pointsRequired: r.pointsRequired, redeemed: counts.get(r.name) ?? 0 }))
    .sort((a, b) => b.redeemed - a.redeemed || a.pointsRequired - b.pointsRequired);

  // ── Activity feed ──
  const activity: StatsData["activity"] = [];
  visits.slice(0, 8).forEach((x) =>
    activity.push({
      type: "visit",
      text: `${nameById.get(x.customerId) ?? "Client"} · ${x.amount != null ? x.amount.toFixed(2) + " DT" : "visite"}`,
      sub: `+${x.pointsEarned} pts`,
      at: x.date.toISOString(),
    })
  );
  earned.slice(0, 5).forEach((x) =>
    activity.push({
      type: "reward",
      text: `${nameById.get(x.customerId) ?? "Client"} a échangé « ${x.reward.name} »`,
      sub: `-${x.reward.pointsRequired} pts`,
      at: x.earnedAt.toISOString(),
    })
  );
  [...customers]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .forEach((c) => activity.push({ type: "signup", text: `${c.name} a rejoint le programme`, sub: "Nouveau client", at: c.createdAt.toISOString() }));
  activity.sort((a, b) => b.at.localeCompare(a.at));

  // ── Spin wheel ──
  const sp = spins.filter((x) => inCur(x.spunAt));
  const prizeCount = new Map<string, number>();
  sp.forEach((x) => prizeCount.set(x.prizeLabel, (prizeCount.get(x.prizeLabel) ?? 0) + 1));

  // ── Social bonuses ──
  const platforms = [...new Set(bonusReqs.map((b) => b.platform))];
  const bonus = platforms.map((p) => ({
    platform: PLATFORM_LABEL[p] ?? p,
    approved: bonusReqs.filter((b) => b.platform === p && b.status === "APPROVED").length,
    pending: bonusReqs.filter((b) => b.platform === p && b.status === "PENDING").length,
    rejected: bonusReqs.filter((b) => b.platform === p && b.status === "REJECTED").length,
  }));

  return {
    range,
    generatedAt: now.toISOString(),
    lifetime: {
      customers: customers.length,
      pointsInCirculation: customers.reduce((s, c) => s + c.points, 0),
      revenue: Math.round((lifetimeVisits._sum.amount ?? 0) * 100) / 100,
      visits: lifetimeVisits._count._all,
      rewardsRedeemed: lifetimeRewards,
    },
    kpis: {
      newCustomers: k(cur.newCustomers, prev.newCustomers),
      activeCustomers: k(cur.active, prev.active),
      visits: k(cur.visits, prev.visits),
      revenue: k(Math.round(cur.revenue * 100) / 100, Math.round(prev.revenue * 100) / 100),
      avgBasket: k(Math.round(cur.avgBasket * 100) / 100, Math.round(prev.avgBasket * 100) / 100),
      pointsIssued: k(cur.pointsIssued, prev.pointsIssued),
      rewardsRedeemed: k(cur.rewards, prev.rewards),
      pointsRedeemed: k(cur.pointsRedeemed, prev.pointsRedeemed),
      returnRate: k(cur.returnRate, prev.returnRate),
      spins: k(cur.spins, prev.spins),
    },
    series,
    weekday: WD.map((label, i) => ({ label, visits: wd[i] })),
    hours: hr.map((v, h) => ({ label: `${h}h`, visits: v })),
    segments,
    topCustomers,
    rewardsRanking,
    activity: activity.slice(0, 12),
    spin: {
      total: sp.length,
      free: sp.filter((x) => x.source === "FREE").length,
      bonus: sp.filter((x) => x.source === "BONUS").length,
      pointsAwarded: sp.reduce((s, x) => s + x.pointsAwarded, 0),
      top: [...prizeCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, count]) => ({ label, count })),
    },
    bonus,
  };
}
