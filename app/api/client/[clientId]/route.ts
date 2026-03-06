import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ clientId: string }> }
) {
    const { clientId } = await context.params;

    try {
        const client = await prisma.customerProfile.findUnique({
            where: { id: clientId },
            include: {
                visits: {
                    orderBy: { date: "desc" },
                    take: 10,
                },
                earnedRewards: {
                    include: { reward: true },
                    where: { usedAt: null },
                },
            },
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        return NextResponse.json({
            ...client,
            visits: client.visits.length,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch client" },
            { status: 500 }
        );
    }
}