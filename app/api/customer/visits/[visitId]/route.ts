// app/api/customer/visits/[visitId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust this import to match your prisma client path

// ── PATCH /api/customer/visits/[visitId] ─────────────────────────────────────
// Updates the amount of a visit and recalculates pointsEarned
export async function PATCH(
  req: NextRequest,
  { params }: { params: { visitId: string } }
) {
  try {
    const { visitId } = params;
    const body = await req.json();
    const amount = parseFloat(body.amount);

    if (!visitId) {
      return NextResponse.json({ error: "Visit ID manquant" }, { status: 400 });
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    // Fetch the existing visit (to get the linked customer)
    const existingVisit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: { id: true, pointsEarned: true, customerId: true },
    });

    if (!existingVisit) {
      return NextResponse.json({ error: "Visite introuvable" }, { status: 404 });
    }

    // Fetch the active loyalty rule
    const loyaltyProgram = await prisma.loyaltyProgram.findFirst({
      where: { isActive: true },
    });

    const spendThreshold = loyaltyProgram?.spendThreshold ?? 1;
    const pointsEarned_per_threshold = loyaltyProgram?.pointsEarned ?? 10;

    const newPointsEarned = Math.floor(
      (amount / spendThreshold) * pointsEarned_per_threshold
    );

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
      prisma.customer.update({
        where: { id: existingVisit.customerId },
        data: {
          points: { increment: pointsDiff },
          lastVisit: new Date(),
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
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// ── DELETE /api/customer/visits/[visitId] ────────────────────────────────────
// Deletes a visit and subtracts its points from the customer
export async function DELETE(
  req: NextRequest,
  { params }: { params: { visitId: string } }
) {
  try {
    const { visitId } = params;

    if (!visitId) {
      return NextResponse.json({ error: "Visit ID manquant" }, { status: 400 });
    }

    // Fetch first so we know how many points to subtract
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: { id: true, pointsEarned: true, customerId: true },
    });

    if (!visit) {
      return NextResponse.json({ error: "Visite introuvable" }, { status: 404 });
    }

    // Delete visit + subtract points in a transaction
    await prisma.$transaction([
      prisma.visit.delete({
        where: { id: visitId },
      }),
      prisma.customer.update({
        where: { id: visit.customerId },
        data: {
          points: { decrement: visit.pointsEarned },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/customer/visits]", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}