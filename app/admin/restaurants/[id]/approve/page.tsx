import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import ApproveForm from "./ApproveForm";


export default async function ApprovePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: params.id },
    include: {
      owner: true,
    },
  });

  if (!restaurant) {
    redirect("/admin/restaurants");
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Approuver le restaurant</h1>
      <ApproveForm restaurant={restaurant} />
    </div>
  );
}