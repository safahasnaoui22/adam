// app/scan/[customerId]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import ScanClientForm from "@/components/ScanClientForm";

interface PageProps {
  params: Promise<{ customerId: string }>;
}

// Helper to get short ID (same as client dashboard)
function getShortId(fullCustomerId: string): string {
  if (!fullCustomerId) return "****";
  // If it contains hyphens, take the last part's last 4 chars
  if (fullCustomerId.includes('-')) {
    const parts = fullCustomerId.split('-');
    const lastPart = parts[parts.length - 1];
    return lastPart.slice(-4);
  }
  // Otherwise take last 4 chars
  return fullCustomerId.slice(-4);
}

export default async function ScanCustomerPage({ params }: PageProps) {
  const { customerId } = await params;
  const session = await getServerSession(authOptions);

  // Only restaurant owners can access this page
  if (!session?.user?.restaurantId) {
    redirect("/auth/signin");
  }

  // Find the customer and ensure it belongs to the owner's restaurant
  const customer = await prisma.customerProfile.findFirst({
    where: {
      customerId: customerId,
      restaurantId: session.user.restaurantId,
    },
    include: {
      restaurant: {
        select: { urlSlug: true, name: true },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const shortId = getShortId(customer.customerId);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Fiche client</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Nom</p>
            <p className="text-lg font-semibold">{customer.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ID client</p>
            <p className="text-lg font-mono">#{shortId}</p>
            <p className="text-xs text-gray-400 mt-1">(Complet: {customer.customerId})</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Points actuels</p>
            <p className="text-3xl font-bold text-orange-500">{customer.points} ⭐</p>
          </div>
        </div>

        <ScanClientForm customerId={customer.id} currentPoints={customer.points} />
      </div>
    </div>
  );
}