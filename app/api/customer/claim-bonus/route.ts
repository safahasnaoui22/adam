import { NextResponse } from "next/server";

// Disabled on purpose: this endpoint used to give points on a simple "Oui"
// tap, which anyone could abuse. Points are now only given by
// /api/customer/verify-bonus after the proof screenshot is checked.
export async function POST() {
  return NextResponse.json({ error: "Gone — use /api/customer/verify-bonus" }, { status: 410 });
}
