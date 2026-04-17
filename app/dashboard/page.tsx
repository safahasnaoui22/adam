// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";
import { AccountStatus, SubscriptionPlan } from "@prisma/client";

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

    // Get plan from subscription
    const plan = restaurant.subscription?.plan || SubscriptionPlan.FREE;
    const accountStatus = restaurant.accountStatus as string;

    // Check account status
    if (accountStatus === "PENDING") {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-[#1e293b] shadow rounded-lg p-8 text-center">
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
                    <p className="text-sm text-gray-500">
                        Cela peut prendre jusqu'à 24-48 heures. Merci de votre patience.
                    </p>
                </div>
            </div>
        );
    }

    if (accountStatus === "SUSPENDED") {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-[#1e293b] shadow rounded-lg p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Compte suspendu</h2>
                    <p className="text-gray-400 mb-4">
                        Votre compte a été suspendu. Pour plus d'informations, veuillez contacter notre support.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center px-4 py-2 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e] transition-colors"
                    >
                        Contacter le support
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate steps completed
    const steps = [
        !!restaurant.logo,
        !!restaurant.address,
        !!restaurant.openingHours,
        !!restaurant.loyaltyProgram,
    ];
    const stepsCompleted = steps.filter(Boolean).length;

    // Navigation items
    const navigation = [
        { name: "Tableau de bord", href: "/dashboard", icon: "📊" },
        { name: "Personnaliser", href: "/dashboard/personalize", icon: "🎨" },
        { name: "Programme fidélité", href: "/dashboard/loyalty-program", icon: "⭐" },
        { name: "Clients", href: "/dashboard/clients", icon: "👥" },
        { name: "QR Code", href: "/dashboard/qr-code", icon: "📱" },
        { name: "Demandes bonus", href: "/dashboard/bonus-requests", icon: "🎁" },
    ];

    // Get plan display text
    const getPlanText = () => {
        if (plan === SubscriptionPlan.FREE) return "Gratuit";
        if (plan === SubscriptionPlan.BASIC) return "Basic";
        if (plan === SubscriptionPlan.PREMIUM) return "Premium";
        if (plan === SubscriptionPlan.ENTERPRISE) return "Enterprise";
        return "Gratuit";
    };

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <div className="flex">
                {/* Sidebar */}
                <aside className="fixed left-0 top-0 z-40 w-64 h-screen bg-[#1e293b] border-r border-gray-700">
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
                            <span className="text-xl font-bold text-[#fe5502]">Adam Dashboard</span>
                        </div>
                        
                        {/* Navigation */}
                        <nav className="flex-1 px-2 py-4 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        item.href === "/dashboard"
                                            ? "bg-[#fe5502] text-white"
                                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                    }`}
                                >
                                    <span className="mr-3 text-lg">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                        
                        {/* User info */}
                        <div className="p-4 border-t border-gray-700">
                            <div className="flex items-center">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {session.user.name || "Restaurateur"}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {session.user.email}
                                    </p>
                                </div>
                                <div className="w-8 h-8 bg-[#fe5502] rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-white">
                                        {session.user.name?.charAt(0) || "R"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="ml-64 flex-1 p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Status Banner */}
                        <div className="bg-[#1e293b] rounded-lg shadow-sm">
                            <div className="px-6 py-5">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <h2 className="text-lg font-medium text-white">Statut de votre compte</h2>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Consultez l'état de votre compte et votre abonnement actuel
                                        </p>
                                    </div>
                                    <div className="flex space-x-4">
                                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            accountStatus === "ACTIVE"
                                                ? "bg-green-900 text-green-300"
                                                : "bg-yellow-900 text-yellow-300"
                                        }`}>
                                            {accountStatus === "ACTIVE" && "✓ Compte Actif"}
                                            {accountStatus === "PENDING" && "⏳ En attente d'approbation"}
                                        </div>
                                        <div className="px-3 py-1 bg-gray-700 text-[#fe5502] rounded-full text-sm font-semibold">
                                            Plan {getPlanText()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Welcome Header */}
                        <div className="bg-[#1e293b] rounded-lg shadow-sm">
                            <div className="px-6 py-5">
                                <h1 className="text-2xl font-bold text-white">
                                    Bienvenue sur votre tableau de bord
                                </h1>
                                <p className="mt-1 text-sm text-gray-400">
                                    Gérez votre programme de fidélité en toute simplicité
                                </p>
                                
                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-400">
                                            Configuration du compte
                                        </span>
                                        <span className="text-sm font-medium text-[#fe5502]">
                                            {Math.round((stepsCompleted / 4) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                        <div
                                            className="bg-[#fe5502] h-2.5 rounded-full"
                                            style={{ width: `${(stepsCompleted / 4) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <div className="bg-[#1e293b] rounded-lg shadow-sm p-6">
                                <dt className="text-sm font-medium text-gray-400 truncate">Total clients</dt>
                                <dd className="mt-1 text-3xl font-semibold text-white">{restaurant.customers.length}</dd>
                            </div>
                            <div className="bg-[#1e293b] rounded-lg shadow-sm p-6">
                                <dt className="text-sm font-medium text-gray-400 truncate">Points distribués</dt>
                                <dd className="mt-1 text-3xl font-semibold text-white">
                                    {restaurant.customers.reduce((sum, c) => sum + c.points, 0)}
                                </dd>
                            </div>
                            <div className="bg-[#1e293b] rounded-lg shadow-sm p-6">
                                <dt className="text-sm font-medium text-gray-400 truncate">URL de la carte</dt>
                                <dd className="mt-1 text-sm font-medium text-[#fe5502]">
                                    <a href={`https://${restaurant.urlSlug}.adam.tn`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {restaurant.urlSlug}.adam.tn
                                    </a>
                                </dd>
                            </div>
                        </div>

                        {/* Setup Steps Grid */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="bg-[#1e293b] rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-white">Personnalisez votre carte</h3>
                                    {steps[0] && <span className="text-green-400 text-sm">✓ Complété</span>}
                                </div>
                                <p className="text-sm text-gray-400 mb-4">Ajoutez votre logo, description et coordonnées</p>
                                <Link href="/dashboard/personalize" className="text-[#fe5502] hover:underline text-sm">
                                    {steps[0] ? "Modifier" : "Commencer"} →
                                </Link>
                            </div>

                            <div className="bg-[#1e293b] rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-white">Configurez le programme</h3>
                                    {steps[3] && <span className="text-green-400 text-sm">✓ Complété</span>}
                                </div>
                                <p className="text-sm text-gray-400 mb-4">Définissez les règles de points et récompenses</p>
                                <Link href="/dashboard/loyalty-program" className="text-[#fe5502] hover:underline text-sm">
                                    {steps[3] ? "Gérer" : "Configurer"} →
                                </Link>
                            </div>

                            <div className="bg-[#1e293b] rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-white">Partagez votre QR code</h3>
                                    <span className="text-yellow-400 text-sm">Important</span>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">Téléchargez et imprimez votre QR code unique</p>
                                <Link href="/dashboard/qr-code" className="text-[#fe5502] hover:underline text-sm">
                                    Générer →
                                </Link>
                            </div>

                            <div className="bg-[#1e293b] rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-medium text-white mb-4">Clients récents</h3>
                                {restaurant.customers.length > 0 ? (
                                    <ul className="space-y-2">
                                        {restaurant.customers.map((customer) => (
                                            <li key={customer.id} className="flex justify-between items-center">
                                                <span className="text-sm text-white">{customer.name}</span>
                                                <span className="text-xs text-gray-400">{customer.points} points</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-400">Aucun client pour le moment</p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}