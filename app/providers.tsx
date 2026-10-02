"use client";

import { SessionProvider } from "next-auth/react";
// Side-effect import: attaches the beforeinstallprompt/appinstalled
// listeners as soon as this provider mounts, i.e. on every page of the
// app from the very first load — see lib/pwaInstall.ts for why that
// timing matters.
import "@/lib/pwaInstall";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
