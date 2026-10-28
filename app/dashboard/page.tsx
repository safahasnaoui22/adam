// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";
import { AccountStatus, SubscriptionPlan } from "@prisma/client";
import RewardExchange from "@/components/RewardExchange";

async function getRestaurantData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            restaurant: {
                include: {
                    subscription: true,
                    loyaltyProgram: {
                        include: {
                            rewards: true,
                        },
                    },
                    customers: {
                        take: 5,
                        orderBy: { createdAt: "desc" },
                    },
                },
            },
        },
    });
    return user?.restaurant;
}

async function getDashboardStats(restaurantId: string) {
    // Total customers
    const totalCustomers = await prisma.customerProfile.count({
        where: { restaurantId },
    });

    // Points earned (sum of points from all customers)
    const pointsEarnedResult = await prisma.customerProfile.aggregate({
        where: { restaurantId },
        _sum: { points: true },
    });
    const totalPointsEarned = pointsEarnedResult._sum.points || 0;

    // Points consumed (redeemed) – sum of pointsRequired from earnedRewards
    const redeemedRewards = await prisma.earnedReward.findMany({
        where: {
            customer: { restaurantId },
        },
        include: {
            reward: true,
        },
    });
    const totalPointsConsumed = redeemedRewards.reduce((sum, er) => sum + (er.reward.pointsRequired || 0), 0);

    // Exchange rate = (points consumed / points earned) * 100
    const exchangeRate = totalPointsEarned > 0 ? (totalPointsConsumed / totalPointsEarned) * 100 : 0;

    return {
        totalCustomers,
        totalPointsEarned,
        totalPointsConsumed,
        exchangeRate: exchangeRate.toFixed(1),
    };
}

// Reward trends: most redeemed rewards over the last 30 days vs the 30 days before
async function getRewardTrends(restaurantId: string) {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const last30Start = now - 30 * DAY;
    const prev30Start = now - 60 * DAY;

    const earned = await prisma.earnedReward.findMany({
        where: { customer: { restaurantId } },
        select: {
            earnedAt: true,
            reward: { select: { id: true, name: true, pointsRequired: true } },
        },
    });

    const byReward = new Map<
        string,
        { id: string; name: string; pointsRequired: number; total: number; last30: number; prev30: number }
    >();

    for (const er of earned) {
        const key = er.reward.id;
        const entry =
            byReward.get(key) ??
            {
                id: er.reward.id,
                name: er.reward.name,
                pointsRequired: er.reward.pointsRequired,
                total: 0,
                last30: 0,
                prev30: 0,
            };
        entry.total += 1;
        const t = er.earnedAt.getTime();
        if (t >= last30Start) entry.last30 += 1;
        else if (t >= prev30Start) entry.prev30 += 1;
        byReward.set(key, entry);
    }

    const items = Array.from(byReward.values())
        .sort((a, b) => b.last30 - a.last30 || b.total - a.total)
        .slice(0, 5)
        .map((r) => {
            let trend: number | null = null; // % change vs previous 30 days
            if (r.prev30 > 0) trend = Math.round(((r.last30 - r.prev30) / r.prev30) * 100);
            else if (r.last30 > 0) trend = 100;
            return { ...r, trend };
        });

    const totalLast30 = Array.from(byReward.values()).reduce((s, r) => s + r.last30, 0);
    return { items, totalLast30 };
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/auth/signin");
    }

    const restaurant = await getRestaurantData(session.user.id);
    if (!restaurant) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-white">Restaurant not found</h3>
                <p className="mt-2 text-sm text-gray-400">Please complete your setup</p>
                <Link
                    href="/dashboard/personalize"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#fe5502] hover:bg-[#e0682e] transition-colors"
                >
                    Complete Setup
                </Link>
            </div>
        );
    }

    const plan = restaurant.subscription?.plan || SubscriptionPlan.FREE;
    const accountStatus = restaurant.accountStatus as string;

    if (accountStatus === "PENDING") {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-[var(--bg-card)] shadow rounded-[var(--radius-lg)] p-8 text-center border border-[var(--border)]">
                    <div className="w-20 h-20 bg-[#ffd9b9] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-[#fe5502]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Compte en attente de vérification</h2>
                    <p className="text-gray-400 mb-4">
                        Votre compte est actuellement en cours de vérification par notre équipe administrative.
                        Vous serez notifié dès que votre compte sera activé.
                    </p>
                    <p className="text-sm text-gray-500">Cela peut prendre jusqu'à 24-48 heures. Merci de votre patience.</p>
                </div>
            </div>
        );
    }

    if (accountStatus === "SUSPENDED") {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-[var(--bg-card)] shadow rounded-[var(--radius-lg)] p-8 text-center border border-[var(--border)]">
                    <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Compte suspendu</h2>
                    <p className="text-gray-400 mb-4">
                        Votre compte a été suspendu. Pour plus d'informations, veuillez contacter notre support.
                    </p>
                    <Link href="/contact" className="inline-flex items-center px-4 py-2 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e] transition-colors">
                        Contacter le support
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch additional stats
    const stats = await getDashboardStats(restaurant.id);
    const rewardTrends = await getRewardTrends(restaurant.id);
    const maxTrendCount = Math.max(1, ...rewardTrends.items.map((r) => r.last30));

    const steps = [
        !!restaurant.logo,
        !!restaurant.address,
        !!restaurant.openingHours,
        !!restaurant.loyaltyProgram,
    ];
    const stepsCompleted = steps.filter(Boolean).length;

    const getStatusDisplay = () => {
        if (accountStatus === "ACTIVE") return "✓ Compte Actif";
        if (accountStatus === "PENDING") return "⏳ En attente d'approbation";
        if (accountStatus === "SUSPENDED") return "⚠️ Compte Suspendu";
        return "";
    };

    const getStatusStyles = () => {
        if (accountStatus === "ACTIVE") return "bg-[#ffd9b9] text-[#e0682e]";
        if (accountStatus === "PENDING") return "bg-[#ffd9b9] text-[#fe5502]";
        return "bg-[#1e3a5f] text-gray-400";
    };

    const getPlanDisplay = () => {
        if (plan === SubscriptionPlan.FREE) return "Gratuit";
        if (plan === SubscriptionPlan.BASIC) return "Basic";
        if (plan === SubscriptionPlan.PREMIUM) return "Premium";
        if (plan === SubscriptionPlan.ENTERPRISE) return "Enterprise";
        return "Gratuit";
    };

    return (
        <div className="space-y-6 bg-[var(--bg-app)] min-h-screen p-6 rounded-tl-[var(--radius-lg)]">
       
            {/* Reward Exchange component - centered */}
            <div className="flex justify-center">
                <div className="w-full max-w-[1200px]">
                    <RewardExchange />
                </div>
            </div>

            {/* Four stat cards with animated border and 3D effect */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Clients Inscrits */}
                <div className="group relative bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-500/50">
    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    <div className="relative p-5 z-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:bg-orange-500/20 group-hover:text-orange-300 transition-colors duration-300">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            </div>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">Stats</span>
        </div>
        <p className="text-gray-400 text-sm mt-3">Clients Inscrits</p>
        <p className="text-3xl font-bold text-white mt-1">{stats.totalCustomers}</p>
    </div>
</div>
                {/* Stars distribués */}
<div className="group relative bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 hover:border-yellow-500/50">
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
    </div>
    <div className="relative p-5 z-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500/20 group-hover:text-yellow-300 transition-colors duration-300">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            </div>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">Stars</span>
        </div>
        <p className="text-gray-400 text-sm mt-3">Stars distribués</p>
        <p className="text-3xl font-bold text-white mt-1">
            {stats.totalPointsEarned}
            <span className="text-yellow-400 ml-1" aria-hidden="true">★</span>
        </p>
    </div>
</div>
            {/* Points Consommés */}
<div className="group relative bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-500/50">
    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    <div className="relative p-5 z-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 group-hover:bg-red-500/20 group-hover:text-red-300 transition-colors duration-300">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
            </div>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">Dépenses</span>
        </div>
        <p className="text-gray-400 text-sm mt-3">Points Consommés</p>
        <p className="text-3xl font-bold text-white mt-1">
            {stats.totalPointsConsumed}
            <span className="text-yellow-400 ml-1" aria-hidden="true">★</span>
        </p>
    </div>
</div>

             {/* Taux d'Échange */}
<div className="group relative bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 hover:border-green-500/50">
    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    <div className="relative p-5 z-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 group-hover:bg-green-500/20 group-hover:text-green-300 transition-colors duration-300">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M8 3 4 7l4 4" />
                    <path d="M4 7h16" />
                    <path d="m16 21 4-4-4-4" />
                    <path d="M20 17H4" />
                </svg>
            </div>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">Taux</span>
        </div>
        <p className="text-gray-400 text-sm mt-3">Taux d'Échange</p>
        <p className="text-3xl font-bold text-white mt-1">{stats.exchangeRate}%</p>
    </div>
</div>
            </div>
                        {/* Status Banner */}
            <div className="bg-[var(--bg-card)] shadow rounded-[var(--radius-md)] border border-[var(--border)]">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-lg font-medium text-white">Statut de votre compte</h2>
                            <p className="mt-1 text-sm text-gray-400">Consultez l'état de votre compte et votre abonnement actuel</p>
                        </div>
                        <div className="flex space-x-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyles()}`}>
                                {getStatusDisplay()}
                            </div>
                            <div className="px-3 py-1 bg-[#1e3a5f] text-[#fe5502] rounded-full text-sm font-semibold border border-[#fe5502]">
                                Plan {getPlanDisplay()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tendances Récompenses */}
            <div className="bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-[var(--border)] p-6">
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>📈</span> Tendances Récompenses
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Les récompenses les plus échangées sur les 30 derniers jours
                        </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-300 bg-white/5 border border-[var(--border)] px-3 py-1 rounded-full">
                        {rewardTrends.totalLast30} échange{rewardTrends.totalLast30 > 1 ? "s" : ""} · 30 jours
                    </span>
                </div>

                {rewardTrends.items.length === 0 ? (
                    <div className="mt-6 text-center py-8 border border-dashed border-[var(--border)] rounded-xl">
                        <p className="text-gray-300 font-medium">Aucun échange pour le moment</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Dès que vos clients échangeront leurs points, les récompenses les plus populaires apparaîtront ici.
                        </p>
                        <Link
                            href="/dashboard/loyalty-program"
                            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-[#fe5502] hover:bg-[#e0682e] transition-colors"
                        >
                            Gérer mes récompenses
                        </Link>
                    </div>
                ) : (
                    <ul className="mt-5 space-y-3">
                        {rewardTrends.items.map((r, i) => (
                            <li
                                key={r.id}
                                className="flex items-center gap-4 bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3"
                            >
                                <span className="w-8 h-8 shrink-0 rounded-full bg-[#fe5502]/15 text-[#fe5502] text-sm font-bold flex items-center justify-center">
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <p className="text-white font-semibold truncate">{r.name}</p>
                                        <p className="text-xs text-gray-400 shrink-0">{r.pointsRequired} pts</p>
                                    </div>
                                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[#F97316] to-[#fb923c]"
                                            style={{ width: `${Math.max(4, (r.last30 / maxTrendCount) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-white font-bold">{r.last30}</p>
                                    <p
                                        className={`text-xs font-semibold ${
                                            r.trend === null
                                                ? "text-gray-500"
                                                : r.trend > 0
                                                ? "text-emerald-400"
                                                : r.trend < 0
                                                ? "text-red-400"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {r.trend === null ? "—" : `${r.trend > 0 ? "↑ +" : r.trend < 0 ? "↓ " : ""}${r.trend}%`}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

         {/* Performance de fidélité block (animated) - Nouveau design */}
<div 
    className="relative overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_rgba(16,185,129,0.5)]"
    style={{
        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        borderRadius: "32px",
        padding: "40px",
        marginBottom: "40px",
        color: "white",
        boxShadow: "0 20px 50px rgba(16,185,129,0.3)",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)"
    }}
>
    {/* Animated gradient overlay (shimmer) - adapté pour le nouveau fond */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    
    <div className="relative z-10">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Performance de fidélité cette période</h3>
                    <p className="text-sm text-white/70">30 derniers jours</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-white animate-pulse">+0 DT</p>
                <p className="text-xs text-white/60">Faible échantillon</p>
            </div>
        </div>

        <p className="text-sm text-white/80 mt-2 flex items-center gap-1">
            <span>💰</span> Revenus supplémentaires grâce à la fidélité
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm transition-transform hover:scale-105">
                <p className="text-xs text-white/70">Basé sur 10.00 DT/visite</p>
                <p className="text-2xl font-bold text-white mt-1">0</p>
                <p className="text-xs text-white/70">Clients récurrents</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm transition-transform hover:scale-105">
                <p className="text-xs text-white/70">Visites supplémentaires</p>
                <p className="text-2xl font-bold text-white mt-1">0</p>
                <p className="text-xs text-white/70">+0% vs période précédente</p>
            </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/20">
            <div className="flex justify-between items-center">
                <p className="text-sm text-white/80 flex items-center gap-1">
                    <span>📊</span> Activité tampons vs. 30 jours précédents
                </p>
                <span className="text-xs text-white/60 bg-black/30 px-2 py-1 rounded-full">Statique</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-white/80 rounded-full animate-pulse"></div>
                </div>
                <span className="text-xs text-white/70">+0%</span>
            </div>
        </div>
    </div>
</div>



        
        </div>
    );
}