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
                <div className="bg-[#0d1f3c] shadow rounded-lg p-8 text-center border border-[#1e3a5f]">
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
                <div className="bg-[#0d1f3c] shadow rounded-lg p-8 text-center border border-[#1e3a5f]">
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
        <div className="space-y-6">
            {/* Status Banner */}
            <div className="bg-[#0d1f3c] shadow sm:rounded-lg border border-[#1e3a5f]">
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

            {/* Welcome Header with Progress */}
            <div className="bg-[#0d1f3c] shadow sm:rounded-lg border border-[#1e3a5f]">
                <div className="px-4 py-5 sm:p-6">
                    <h1 className="text-2xl font-bold text-white">Bienvenue sur votre tableau de bord de fidélité</h1>
                    <p className="mt-1 text-sm text-gray-400">Démarrer avec Adam</p>
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{stepsCompleted} sur 4 étapes terminées</span>
                            <span className="text-sm font-medium text-[#fe5502]">{Math.round((stepsCompleted / 4) * 100)}%</span>
                        </div>
                        <div className="w-full bg-[#1e3a5f] rounded-full h-2.5">
                            <div className="bg-[#fe5502] h-2.5 rounded-full" style={{ width: `${(stepsCompleted / 4) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reward Exchange component - centered */}
            <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                    <RewardExchange />
                </div>
            </div>

            {/* Three stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0d1f3c] rounded-lg border border-[#1e3a5f] p-5">
                    <p className="text-gray-400 text-sm">Clients Inscrits</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.totalCustomers}</p>
                </div>
                <div className="bg-[#0d1f3c] rounded-lg border border-[#1e3a5f] p-5">
                    <p className="text-gray-400 text-sm">Points Consommés</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.totalPointsConsumed}⭐</p>
                </div>
                <div className="bg-[#0d1f3c] rounded-lg border border-[#1e3a5f] p-5">
                    <p className="text-gray-400 text-sm">Taux d'Échange</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.exchangeRate}%</p>
                </div>
            </div>

            {/* Performance de fidélité block (static) */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#0a1628] rounded-xl border border-[#fe5502]/30 p-6">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Performance de fidélité cette période</h3>
                        <p className="text-sm text-gray-400">30 derniers jours</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-[#fe5502]">+0 DT</p>
                        <p className="text-xs text-gray-400">Faible échantillon</p>
                    </div>
                </div>
                <p className="text-sm text-gray-300 mt-2">Revenus supplémentaires grâce à la fidélité</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-400">Basé sur 10.00 DT/visite</p>
                        <p className="text-xl font-semibold text-white mt-1">0</p>
                        <p className="text-xs text-gray-400">Clients récurrents</p>
                    </div>
                    <div>
                        <p className="text-sm text-[#fe5502] font-medium">0</p>
                        <p className="text-xs text-gray-400">Visites supplémentaires</p>
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1e3a5f]">
                    <p className="text-sm text-gray-400">Activité tampons vs. 30 jours précédents</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Statique</span>
                        <div className="w-24 h-2 bg-gray-700 rounded-full">
                            <div className="w-0 h-2 bg-[#fe5502] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Setup Steps Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Step 1 */}
                <div className={`bg-[#0d1f3c] shadow sm:rounded-lg border border-[#1e3a5f] ${steps[0] ? 'border-l-4 border-l-[#fe5502]' : ''}`}>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-white">1. Personnalisez votre carte</h3>
                            {steps[0] && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffd9b9] text-[#e0682e]">Complété</span>}
                        </div>
                        <p className="mt-2 text-sm text-gray-400">Ajoutez votre logo, description et coordonnées</p>
                        <Link href="/dashboard/personalize" className="mt-4 inline-flex items-center text-sm font-medium text-[#fe5502] hover:text-[#e0682e] transition-colors">
                            {steps[0] ? "Modifier les informations" : "Commencer"}
                            <svg className="ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                </div>
                {/* Step 2 */}
                <div className={`bg-[#0d1f3c] shadow sm:rounded-lg border border-[#1e3a5f] ${steps[3] ? 'border-l-4 border-l-[#fe5502]' : ''}`}>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-white">2. Configurez le programme</h3>
                            {steps[3] && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffd9b9] text-[#e0682e]">Complété</span>}
                        </div>
                        <p className="mt-2 text-sm text-gray-400">Définissez les règles de points et récompenses</p>
                        <Link href="/dashboard/loyalty-program" className="mt-4 inline-flex items-center text-sm font-medium text-[#fe5502] hover:text-[#e0682e] transition-colors">
                            {steps[3] ? "Gérer le programme" : "Configurer"}
                            <svg className="ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                </div>
                {/* Step 3 */}
                <div className="bg-[#0d1f3c] shadow sm:rounded-lg border-2 border-[#ffd9b9] hover:border-[#fe5502] transition">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-white">3. Partagez votre QR code</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffd9b9] text-[#e0682e]">Important</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">Vos clients scannent ce QR code pour rejoindre votre programme de fidélité instantanément.</p>
                        <div className="mt-4 flex items-center space-x-4">
                            <div className="bg-[#1e3a5f] p-2 rounded-lg">
                                <div className="w-16 h-16 bg-gradient-to-r from-[#fe5502] to-[#e0682e] rounded flex items-center justify-center">
                                    <span className="text-white text-xs text-center">QR<br />Code</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">URL de votre carte:</p>
                                <p className="text-xs text-[#fe5502] break-all">{`${restaurant.urlSlug}.adam.tn`}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex space-x-3">
                            <Link href="/dashboard/qr-code" className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#fe5502] hover:bg-[#e0682e] transition-colors">
                                Voir et télécharger QR Code
                                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </Link>
                            <Link href={`/${restaurant.urlSlug}`} target="_blank" className="flex-inline items-center px-4 py-2 border border-[#1e3a5f] text-sm font-medium rounded-md text-white bg-[#0d1f3c] hover:bg-[#1e3a5f] transition-colors">
                                Aperçu
                            </Link>
                        </div>
                        <div className="mt-4 p-3 bg-[#ffd9b9] rounded-md">
                            <p className="text-xs text-[#e0682e]">💡 Astuce: Téléchargez le QR code et imprimez-le pour le placer sur vos tables ou comptoir.</p>
                        </div>
                    </div>
                </div>
                {/* Step 4 */}
                <div className="bg-[#0d1f3c] shadow sm:rounded-lg border border-[#1e3a5f]">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-white">Clients récents</h3>
                        {restaurant.customers.length > 0 ? (
                            <ul className="mt-3 divide-y divide-[#1e3a5f]">
                                {restaurant.customers.map((customer) => (
                                    <li key={customer.id} className="py-2">
                                        <p className="text-sm font-medium text-white">{customer.name}</p>
                                        <p className="text-xs text-gray-400">{customer.points} points • Inscrit le {new Date(customer.createdAt).toLocaleDateString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 text-sm text-gray-400">Aucun client pour le moment</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-[#0d1f3c] shadow sm:rounded-lg border border-[#1e3a5f]">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-400 truncate">Total clients</dt>
                        <dd className="mt-1 text-3xl font-semibold text-white">{restaurant.customers.length}</dd>
                    </div>
                </div>
                <div className="bg-[#0d1f3c] shadow sm:rounded-lg border border-[#1e3a5f]">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-400 truncate">Points distribués</dt>
                        <dd className="mt-1 text-3xl font-semibold text-white">{restaurant.customers.reduce((sum, c) => sum + c.points, 0)}</dd>
                    </div>
                </div>
                <div className="bg-[#0d1f3c] shadow sm:rounded-lg border border-[#1e3a5f]">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-400 truncate">URL de la carte</dt>
                        <dd className="mt-1 text-sm font-medium text-[#fe5502]">
                            <a href={`https://${restaurant.urlSlug}.Adam.tn`} target="_blank" rel="noopener noreferrer" className="hover:text-[#e0682e]">
                                {restaurant.urlSlug}.Adam.tn
                            </a>
                        </dd>
                    </div>
                </div>
            </div>
        </div>
    );
}