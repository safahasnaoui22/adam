// app/api/customer/delete/[id]/route.ts
//
// The owner removes a customer card (and the customer's login) from their
// business. Only customers of the signed-in owner's own restaurant can be deleted.
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId || session.user.role !== "RESTAURANT_OWNER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const customer = await prisma.customerProfile.findUnique({
      where: { id },
      select: { id: true, userId: true, restaurantId: true, name: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }
    if (customer.restaurantId !== session.user.restaurantId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.visit.deleteMany({ where: { customerId: id } });
        await tx.earnedReward.deleteMany({ where: { customerId: id } });
        await tx.spinLog.deleteMany({ where: { customerId: id } });
        await tx.bonusRequest.deleteMany({ where: { customerId: id } });
        await tx.pushSubscription.deleteMany({ where: { clientId: id } });
        await tx.customerProfile.delete({ where: { id } });
        await tx.activityLog.deleteMany({ where: { userId: customer.userId } });
        await tx.passwordResetToken.deleteMany({ where: { userId: customer.userId } });
        await tx.user.delete({ where: { id: customer.userId } });
      },
      { maxWait: 10000, timeout: 30000 }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete customer:", error);
    return NextResponse.json(
      { error: `Impossible de supprimer le client${error?.code ? ` (${error.code})` : ""}` },
      { status: 500 }
    );
  }
}
