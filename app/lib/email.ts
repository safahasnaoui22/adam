// app/lib/email.ts
import nodemailer from "nodemailer";

const APP_NAME = "Adam";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://adamrestaurents.vercel.app"
  );
}

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587 (STARTTLS)
    auth: { user, pass },
  });
}

export function buildResetUrl(token: string) {
  return `${getBaseUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transport = getTransport();

  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      // Dev convenience: no SMTP configured, print the link instead.
      console.warn("[email] SMTP not configured. Reset link for", to, "->", resetUrl);
      return;
    }
    throw new Error("SMTP is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS)");
  }

  const from = process.env.EMAIL_FROM || `${APP_NAME} <${process.env.SMTP_USER}>`;

  await transport.sendMail({
    from,
    to,
    subject: `Reset your ${APP_NAME} password`,
    text:
      `We received a request to reset your ${APP_NAME} password.\n\n` +
      `Open this link to choose a new one (valid for 1 hour):\n${resetUrl}\n\n` +
      `If you didn't ask for this, you can safely ignore this email.`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#282424">
        <h2 style="color:#fe5502;margin:0 0 16px">${APP_NAME}</h2>
        <p style="font-size:15px;line-height:1.5">We received a request to reset your password. Click the button below to choose a new one. This link is valid for <strong>1 hour</strong>.</p>
        <p style="margin:28px 0">
          <a href="${resetUrl}" style="background:#fe5502;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block">Reset my password</a>
        </p>
        <p style="font-size:12px;color:#7f8489;line-height:1.5">If the button doesn't work, copy this link into your browser:<br/>${resetUrl}</p>
        <p style="font-size:12px;color:#7f8489">If you didn't request this, you can safely ignore this email.</p>
      </div>`,
  });
}