import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";

async function getRestaurantData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            restaurant: {
                include: {
                    subscription: true, // Add this to get plan
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
                <h3 className="text-lg font-medium text-[#282424]">Restaurant not found</h3>
                <p className="mt-2 text-sm text-[#7f8489]">Please complete your setup</p>
                <Link
                    href="/dashboard/personalize"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#fe5502] hover:bg-[#e0682e] transition-colors"
                >
                    Complete Setup
                </Link>
            </div>
        );
    }

    // Check account status - Show pending/suspended screens if needed
    if (restaurant.accountStatus === "PENDING") {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-white shadow rounded-lg p-8 text-center">
                    <div className="w-20 h-20 bg-[#ffd9b9] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-[#fe5502]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#282424] mb-2">Compte en attente de vérification</h2>
                    <p className="text-[#7f8489] mb-4">
                        Votre compte est actuellement en cours de vérification par notre équipe administrative.
                        Vous serez notifié dès que votre compte sera activé.
                    </p>
                    <p className="text-sm text-[#7f8489]">
                        Cela peut prendre jusqu'à 24-48 heures. Merci de votre patience.
                    </p>
                </div>
            </div>
        );
    }

    if (restaurant.accountStatus === "SUSPENDED") {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-white shadow rounded-lg p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#282424] mb-2">Compte suspendu</h2>
                    <p className="text-[#7f8489] mb-4">
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

    // Calculate steps completed (only show for active accounts)
    const steps = [
        !!restaurant.logo,
        !!restaurant.address,
        !!restaurant.openingHours,
        !!restaurant.loyaltyProgram,
    ];
    const stepsCompleted = steps.filter(Boolean).length;

    return (
        <div className="space-y-6">
            {/* Status and Plan Banner */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-lg font-medium text-[#282424]">Statut de votre compte</h2>
                            <p className="mt-1 text-sm text-[#7f8489]">
                                Consultez l'état de votre compte et votre abonnement actuel
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                restaurant.accountStatus === "ACTIVE"
                                    ? "bg-[#ffd9b9] text-[#e0682e]"
                                    : restaurant.accountStatus === "PENDING"
                                    ? "bg-[#ffd9b9] text-[#fe5502]"
                                    : "bg-[#c6c9c8] text-[#7f8489]"
                            }`}>
                                {restaurant.accountStatus === "ACTIVE" && "✓ Compte Actif"}
                                {restaurant.accountStatus === "PENDING" && "⏳ En attente d'approbation"}
                                {restaurant.accountStatus === "SUSPENDED" && "⚠️ Compte Suspendu"}
                            </div>
                            <div className="px-3 py-1 bg-[#fdf9f4] text-[#fe5502] rounded-full text-sm font-semibold border border-[#fe5502]">
                                Plan {restaurant.plan === "FREE" ? "Gratuit" : restaurant.plan === "PRO" ? "Pro" : "Enterprise"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Welcome Header */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h1 className="text-2xl font-bold text-[#282424]">
                        Bienvenue sur votre tableau de bord de fidélité
                    </h1>
                    <p className="mt-1 text-sm text-[#7f8489]">
                        Démarrer avec Adam
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#282424]">
                                {stepsCompleted} sur 4 étapes terminées
                            </span>
                            <span className="text-sm font-medium text-[#fe5502]">
                                {Math.round((stepsCompleted / 4) * 100)}%
                            </span>
                        </div>
                        <div className="w-full bg-[#c6c9c8] rounded-full h-2.5">
                            <div
                                className="bg-[#fe5502] h-2.5 rounded-full"
                                style={{ width: `${(stepsCompleted / 4) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Setup Steps Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Step 1: Personalize Card */}
                <div className={`bg-white shadow sm:rounded-lg ${steps[0] ? 'border-l-4 border-[#e7926b]' : ''}`}>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-[#282424]">
                                1. Personnalisez votre carte
                            </h3>
                            {steps[0] && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffd9b9] text-[#e0682e]">
                                    Complété
                                </span>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-[#7f8489]">
                            Ajoutez votre logo, description et coordonnées
                        </p>
                        <Link
                            href="/dashboard/personalize"
                            className="mt-4 inline-flex items-center text-sm font-medium text-[#fe5502] hover:text-[#e0682e] transition-colors"
                        >
                            {steps[0] ? "Modifier les informations" : "Commencer"}
                            <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Step 2: Loyalty Program */}
                <div className={`bg-white shadow sm:rounded-lg ${steps[3] ? 'border-l-4 border-[#e7926b]' : ''}`}>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-[#282424]">
                                2. Configurez le programme
                            </h3>
                            {steps[3] && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffd9b9] text-[#e0682e]">
                                    Complété
                                </span>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-[#7f8489]">
                            Définissez les règles de points et récompenses
                        </p>
                        <Link
                            href="/dashboard/loyalty-program"
                            className="mt-4 inline-flex items-center text-sm font-medium text-[#fe5502] hover:text-[#e0682e] transition-colors"
                        >
                            {steps[3] ? "Gérer le programme" : "Configurer"}
                            <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Step 3: Share QR Code */}
                <div className="bg-white shadow sm:rounded-lg border-2 border-[#ffd9b9] hover:border-[#fe5502] transition">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-[#282424]">
                                3. Partagez votre QR code
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffd9b9] text-[#e0682e]">
                                Important
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-[#7f8489]">
                            Vos clients scannent ce QR code pour rejoindre votre programme de fidélité instantanément.
                        </p>

                        <div className="mt-4 flex items-center space-x-4">
                            <div className="bg-[#c6c9c8] p-2 rounded-lg">
                                <div className="w-16 h-16 bg-gradient-to-r from-[#fe5502] to-[#e0682e] rounded flex items-center justify-center">
                                    <span className="text-white text-xs text-center">QR<br />Code</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-[#282424]">
                                    URL de votre carte:
                                </p>
                                <p className="text-xs text-[#fe5502] break-all">
                                    {`${restaurant.urlSlug}.adam.tn`}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex space-x-3">
                            <Link
                                href="/dashboard/qr-code"
                                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#fe5502] hover:bg-[#e0682e] transition-colors"
                            >
                                Voir et télécharger QR Code
                                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </Link>
                            <Link
                                href={`/${restaurant.urlSlug}`}
                                target="_blank"
                                className="flex-inline items-center px-4 py-2 border border-[#c6c9c8] text-sm font-medium rounded-md text-[#282424] bg-white hover:bg-[#fdf9f4] transition-colors"
                            >
                                Aperçu
                            </Link>
                        </div>

                        <div className="mt-4 p-3 bg-[#ffd9b9] rounded-md">
                            <p className="text-xs text-[#e0682e]">
                                💡 Astuce: Téléchargez le QR code et imprimez-le pour le placer sur vos tables ou comptoir.
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Step 4: Recent Customers */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-[#282424]">
                            Clients récents
                        </h3>
                        {restaurant.customers.length > 0 ? (
                            <ul className="mt-3 divide-y divide-[#c6c9c8]">
                                {restaurant.customers.map((customer) => (
                                    <li key={customer.id} className="py-2">
                                        <p className="text-sm font-medium text-[#282424]">{customer.name}</p>
                                        <p className="text-xs text-[#7f8489]">
                                            {customer.points} points • Inscrit le {new Date(customer.createdAt).toLocaleDateString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 text-sm text-[#7f8489]">Aucun client pour le moment</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-[#7f8489] truncate">Total clients</dt>
                        <dd className="mt-1 text-3xl font-semibold text-[#282424]">{restaurant.customers.length}</dd>
                    </div>
                </div>
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-[#7f8489] truncate">Points distribués</dt>
                        <dd className="mt-1 text-3xl font-semibold text-[#282424]">
                            {restaurant.customers.reduce((sum, c) => sum + c.points, 0)}
                        </dd>
                    </div>
                </div>
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-[#7f8489] truncate">URL de la carte</dt>
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