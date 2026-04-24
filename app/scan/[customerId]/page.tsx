import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import ScanClientForm from "@/components/ScanClientForm";

interface PageProps {
  params: Promise<{ customerId: string }>;
}

export default async function ScanCustomerPage({ params }: PageProps) {
  const { customerId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.restaurantId) {
    redirect("/auth/signin");
  }

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

  const loyaltyProgram = await prisma.loyaltyProgram.findFirst({
    where: { restaurantId: session.user.restaurantId },
    include: {
      rewards: {
        where: { isActive: true },
        orderBy: { pointsRequired: "asc" },
      },
    },
  });

  const rewards = (loyaltyProgram?.rewards || []).map((r) => ({
    id: r.id,
    name: r.name,
    pointsRequired: r.pointsRequired,
    description: r.description ?? undefined, // convert null to undefined
  }));

  const getShortId = (fullId: string) => fullId.slice(-4);

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
            <p className="text-lg font-mono font-bold text-orange-600">#{getShortId(customer.customerId)}</p>
            <p className="text-xs text-gray-400">{customer.customerId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Points actuels</p>
            <p className="text-3xl font-bold text-orange-500">{customer.points} ⭐</p>
          </div>
        </div>

        <ScanClientForm
          customerId={customer.id}
          currentPoints={customer.points}
          rewards={rewards}
        />
      </div>
    </div>
  );
}