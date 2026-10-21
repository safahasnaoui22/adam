"use client";

import { signOut } from "next-auth/react";
import { IconLogOut } from "@/components/DashboardIcons";

export default function SignOutButton({ label = "Se déconnecter" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-[#fe5502] hover:bg-[#e0682e] transition-colors"
    >
      <IconLogOut size={16} />
      {label}
    </button>
  );
}
