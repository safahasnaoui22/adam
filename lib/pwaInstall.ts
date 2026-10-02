"use client";

// Captures the browser's `beforeinstallprompt` event as early as possible —
// imported for its side effect from app/providers.tsx, which mounts on
// every single page. That matters because Chrome fires this event once,
// and often *before* the customer ever reaches /client/dashboard (while
// still on "/", "/auth/signin", or "/[slug]" during redirects). A listener
// that only exists inside the dashboard page's module misses it entirely,
// which is why the install button was always falling back to the manual
// "share → add to home screen" instructions instead of the native prompt.

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    installed = true;
    deferredPrompt = null;
    notify();
  });
}

export function getDeferredPrompt() {
  return deferredPrompt;
}

/** Fires the native prompt and clears it — a captured prompt can only be used once. */
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredPrompt) return "unavailable";
  const prompt = deferredPrompt;
  deferredPrompt = null;
  notify();
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  return outcome;
}

export function isPwaInstalled() {
  return installed;
}

/** Subscribe to changes (prompt captured/consumed, app installed). Returns an unsubscribe fn. */
export function onPwaStateChange(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}