import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. Vérifier que l'utilisateur est authentifié (serveur valide)
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 2. Extraire et valider les données de la requête
    const { customerId, rewardId } = await req.json();
    if (!customerId || !rewardId) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    // 3. Récupérer les informations de la récompense
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      include: { loyaltyProgram: true },
    });
    if (!reward) {
      return NextResponse.json({ error: "Récompense non trouvée" }, { status: 404 });
    }

    // 4. Récupérer les informations du client (et vérifier qu'il existe)
    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    // 5. Vérifier que le client a assez de points
    if (customer.points < reward.pointsRequired) {
      return NextResponse.json({ error: "Points insuffisants" }, { status: 400 });
    }

    // 6. Mettre à jour les points du client (les décrémenter)
    const updatedCustomer = await prisma.customerProfile.update({
      where: { id: customerId },
      data: {
        points: { decrement: reward.pointsRequired },
      },
    });

    // 7. Enregistrer la récompense gagnée (optionnel, mais recommandé)
    await prisma.earnedReward.create({
      data: {
        rewardId,
        customerId,
        earnedAt: new Date(),
      },
    });

    // 8. Retourner le nouveau solde de points
    return NextResponse.json({
      success: true,
      newPoints: updatedCustomer.points,
    });
  } catch (error) {
    console.error("Erreur lors de l'échange de récompense:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}