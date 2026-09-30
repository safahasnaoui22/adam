// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/app/lib/prisma";
import { buildResetUrl, sendPasswordResetEmail } from "@/app/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const THROTTLE_MS = 60 * 1000; // 1 request / minute / account

// Always the same answer, whether or not the account exists, so this
// endpoint can't be used to find out which emails are registered.
const GENERIC_RESPONSE = {
  message: "If an account exists for this email, a reset link has been sent.",
};

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
      select: { id: true, email: true, password: true },
    });

    // No account, or a customer account (customers log in by QR and have no password).
    if (!user || !user.password) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    // Throttle repeated requests for the same account.
    const recent = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id, createdAt: { gt: new Date(Date.now() - THROTTLE_MS) } },
      select: { id: true },
    });
    if (recent) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    // Only the newest link stays valid.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash, // only the hash is stored, the raw token only exists in the email
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });

    try {
      await sendPasswordResetEmail(user.email, buildResetUrl(token));
    } catch (mailError) {
      console.error("Failed to send password reset email:", mailError);
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}