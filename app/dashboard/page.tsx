import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getRestaurantData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      restaurant: {
        include: {
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
        <h3 className="text-lg font-medium text-gray-900">Restaurant not found</h3>
        <p className="mt-2 text-sm text-gray-600">Please complete your setup</p>
        <Link
          href="/dashboard/personalize"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Complete Setup
        </Link>
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue sur votre tableau de bord de fidélité
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Démarrer avec Adam
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {stepsCompleted} sur 4 étapes terminées
              </span>
              <span className="text-sm font-medium text-indigo-600">
                {Math.round((stepsCompleted / 4) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${(stepsCompleted / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Steps Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Step 1: Personalize Card */}
        <div className={`bg-white shadow sm:rounded-lg ${steps[0] ? 'border-l-4 border-green-500' : ''}`}>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                1. Personnalisez votre carte
              </h3>
              {steps[0] && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Complété
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Ajoutez votre logo, description et coordonnées
            </p>
            <Link
              href="/dashboard/personalize"
              className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {steps[0] ? "Modifier les informations" : "Commencer"}
              <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Step 2: Loyalty Program */}
        <div className={`bg-white shadow sm:rounded-lg ${steps[3] ? 'border-l-4 border-green-500' : ''}`}>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                2. Configurez le programme
              </h3>
              {steps[3] && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Complété
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Définissez les règles de points et récompenses
            </p>
            <Link
              href="/dashboard/loyalty-program"
              className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {steps[3] ? "Gérer le programme" : "Configurer"}
              <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Step 3: Share QR Code */}
       {/* Step 3: Share QR Code - Enhanced version */}
<div className="bg-white shadow sm:rounded-lg border-2 border-indigo-100 hover:border-indigo-300 transition">
  <div className="px-4 py-5 sm:p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-medium text-gray-900">
        3. Partagez votre QR code
      </h3>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        Important
      </span>
    </div>
    <p className="mt-2 text-sm text-gray-600">
      Vos clients scannent ce QR code pour rejoindre votre programme de fidélité instantanément.
    </p>
    
    {/* Quick QR Preview */}
    <div className="mt-4 flex items-center space-x-4">
      <div className="bg-gray-100 p-2 rounded-lg">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded flex items-center justify-center">
          <span className="text-white text-xs text-center">QR<br/>Code</span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          URL de votre carte:
        </p>
        <p className="text-xs text-indigo-600 break-all">
          {`${restaurant.urlSlug}.stampi.tn`}
        </p>
      </div>
    </div>

    <div className="mt-6 flex space-x-3">
      <Link
        href="/dashboard/qr-code"
        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Voir et télécharger QR Code
        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </Link>
      <Link
        href={`/${restaurant.urlSlug}`}
        target="_blank"
        className="flex-inline items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        Aperçu
      </Link>
    </div>
    
    {/* Tips for printing */}
    <div className="mt-4 p-3 bg-yellow-50 rounded-md">
      <p className="text-xs text-yellow-800">
        💡 Astuce: Téléchargez le QR code et imprimez-le pour le placer sur vos tables ou comptoir.
      </p>
    </div>
  </div>
</div>
        {/* Step 4: Recent Customers */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Clients récents
            </h3>
            {restaurant.customers.length > 0 ? (
              <ul className="mt-3 divide-y divide-gray-200">
                {restaurant.customers.map((customer) => (
                  <li key={customer.id} className="py-2">
                    <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                    <p className="text-xs text-gray-500">
                      {customer.points} points • Inscrit le {new Date(customer.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Aucun client pour le moment</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total clients</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{restaurant.customers.length}</dd>
          </div>
        </div>
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Points distribués</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {restaurant.customers.reduce((sum, c) => sum + c.points, 0)}
            </dd>
          </div>
        </div>
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">URL de la carte</dt>
            <dd className="mt-1 text-sm font-medium text-indigo-600">
              <a href={`https://${restaurant.urlSlug}.Adam.tn`} target="_blank" rel="noopener noreferrer">
                {restaurant.urlSlug}.Adam.tn
              </a>
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}