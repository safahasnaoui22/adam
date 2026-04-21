import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ clientId: string }> }
) {
    const { clientId } = await context.params;

    try {
        // Search by the public customerId field, not the internal id
        const client = await prisma.customerProfile.findUnique({
            where: { customerId: clientId },   // ← changed from 'id' to 'customerId'
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

        // Include the customerId in the response (already present, but explicit)
        return NextResponse.json({
            ...client,
            visits: client.visits.length,
            customerId: client.customerId,   // ensure it's returned
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch client" },
            { status: 500 }
        );
    }
}