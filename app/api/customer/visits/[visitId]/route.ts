// app/api/customer/visits/[visitId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// ── PATCH /api/customer/visits/[visitId] ─────────────────────────────────────
// Updates the amount of a visit and recalculates pointsEarned
export async function PATCH(
  req: NextRequest,
  { params }: { params: { visitId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { visitId } = params;
    const body = await req.json();
    const amount = parseFloat(body.amount);

    if (!visitId) {
      return NextResponse.json({ error: "Visit ID manquant" }, { status: 400 });
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    // Fetch the existing visit (to get the linked customer + verify ownership)
    const existingVisit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: {
        id: true,
        pointsEarned: true,
        customerId: true,
        customer: { select: { restaurantId: true } },
      },
    });

    if (!existingVisit) {
      return NextResponse.json({ error: "Visite introuvable" }, { status: 404 });
    }

    // Ensure the visit belongs to this restaurant
    if (existingVisit.customer.restaurantId !== session.user.restaurantId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Same formula as add-points: 1 DT = 10 points
    const newPointsEarned = Math.floor(amount * 10);
    const pointsDiff = newPointsEarned - existingVisit.pointsEarned;

    // Update visit + adjust customer points in a transaction
    const [updatedVisit] = await prisma.$transaction([
      prisma.visit.update({
        where: { id: visitId },
        data: {
          amount,
          pointsEarned: newPointsEarned,
        },
      }),
      prisma.customerProfile.update({
        where: { id: existingVisit.customerId },
        data: {
          points: { increment: pointsDiff },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      pointsEarned: updatedVisit.pointsEarned,
      pointsDiff,
    });
  } catch (error) {
    console.error("[PATCH /api/customer/visits]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── DELETE /api/customer/visits/[visitId] ────────────────────────────────────
// Deletes a visit and subtracts its points from the customer
export async function DELETE(
  req: NextRequest,
  { params }: { params: { visitId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { visitId } = params;

    if (!visitId) {
      return NextResponse.json({ error: "Visit ID manquant" }, { status: 400 });
    }

    // Fetch first so we know how many points to subtract + verify ownership
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: {
        id: true,
        pointsEarned: true,
        customerId: true,
        customer: { select: { restaurantId: true } },
      },
    });

    if (!visit) {
      return NextResponse.json({ error: "Visite introuvable" }, { status: 404 });
    }

    // Ensure the visit belongs to this restaurant
    if (visit.customer.restaurantId !== session.user.restaurantId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Delete visit + subtract points in a transaction
    await prisma.$transaction([
      prisma.visit.delete({
        where: { id: visitId },
      }),
      prisma.customerProfile.update({
        where: { id: visit.customerId },
        data: {
          points: { decrement: visit.pointsEarned },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/customer/visits]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}