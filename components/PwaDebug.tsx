"use client";

// Install diagnostic. Invisible unless the URL contains ?pwa=debug, e.g.
//   https://adamrestaurents.vercel.app/client/dashboard?pwa=debug
// It checks, from the phone itself, the things that decide whether Chrome
// offers "Install app": the manifest link, the manifest file, its icons, the
// service worker, and whether Chrome handed the page an install prompt.

import { useEffect, useState } from "react";
import { getDeferredPrompt, getPromptFiredAt, onPwaStateChange } from "@/lib/pwaInstall";

type Report = Record<string, unknown>;

async function probe(url: string) {
  const t0 = performance.now();
  const res = await fetch(url, { cache: "no-store" });
  return { status: res.status, type: res.headers.get("content-type"), redirected: res.redirected, ms: Math.round(performance.now() - t0), res };
}

// A step that stalls must not block the whole report.
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000} s`)), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

export default function PwaDebug({ forceOpen = false, onClose }: { forceOpen?: boolean; onClose?: () => void }) {
  const [enabled, setEnabled] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [, tick] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEnabled(forceOpen || new URLSearchParams(window.location.search).get("pwa") === "debug");
  }, [forceOpen]);

  useEffect(() => onPwaStateChange(() => tick((n) => n + 1)), []);

  useEffect(() => {
    if (!enabled) return;
    (async () => {
      const r: Report = {
        page: location.href,
        secureContext: window.isSecureContext,
        runningAsInstalledApp: window.matchMedia("(display-mode: standalone)").matches,
        userAgent: navigator.userAgent,
      };

      try {
        const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
        r.manifestLink = link ? link.href : "MISSING: no <link rel=manifest> in the page";
        if (link) {
          try {
            const m = await withTimeout(probe(link.href), 8000, "manifest download");
            r.manifestHttp = `${m.status} ${m.type} in ${m.ms} ms${m.redirected ? " (REDIRECTED)" : ""}`;
            const text = await m.res.text();
            let j: any = null;
            try {
              j = JSON.parse(text);
            } catch {
              r.manifestBody = "NOT JSON → " + text.slice(0, 80).replace(/\s+/g, " ");
            }
            if (j) {
              r.manifestName = j.name;
              r.manifestStartUrl = j.start_url;
              r.manifestDisplay = j.display;
              const icons: any[] = j.icons || [];
              r.manifestIconCount = icons.length;
              for (const size of ["192", "512"]) {
                const icon = icons.find((i) => String(i.sizes).startsWith(size));
                if (!icon) { r[`icon${size}`] = "MISSING from manifest"; continue; }
                try {
                  const u = new URL(icon.src, link.href);
                  // Our own icon route can explain itself (which renderer it used, or why it fell back).
                  if (u.pathname.startsWith("/api/pwa/")) u.searchParams.set("debug", "1");
                  const i = await withTimeout(probe(u.toString()), 10000, `icon ${size} download`);
                  r[`icon${size}`] = i.type?.includes("application/json")
                    ? `${i.status} in ${i.ms} ms → ${await i.res.text()}`
                    : `${i.status} ${i.type} in ${i.ms} ms${i.redirected ? " (REDIRECTED)" : ""}`;
                } catch (e) {
                  r[`icon${size}`] = `FAILED: ${String(e)}`;
                }
              }
            }
          } catch (e) {
            r.manifestFetchError = String(e);
          }
        }

        if ("serviceWorker" in navigator) {
          const reg = await withTimeout(navigator.serviceWorker.getRegistration(), 3000, "service worker check");
          r.serviceWorker = reg
            ? `${reg.active?.state ?? reg.installing?.state ?? reg.waiting?.state ?? "?"} · scope ${reg.scope}`
            : "NOT registered";
          r.serviceWorkerControlsPage = !!navigator.serviceWorker.controller;
        } else {
          r.serviceWorker = "not supported by this browser";
        }

      } catch (e) {
        r.diagnosticError = String(e);
      } finally {
        setReport(r);
      }
    })();
  }, [enabled]);

  if (!enabled) return null;

  const firedAt = getPromptFiredAt();
  const text = JSON.stringify(
    {
      installPromptFromChrome: !!getDeferredPrompt(),
      chromeFiredPromptAfter: firedAt === null ? `never (page open for ${Math.round(performance.now() / 1000)} s)` : `${firedAt} ms after page load`,
      ...report,
    },
    null,
    2
  );

  return (
    <div
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 9999, maxHeight: "55vh", overflow: "auto",
        background: "rgba(0,0,0,0.92)", color: "#7CFC9A", fontFamily: "monospace", fontSize: 11,
        padding: 12, whiteSpace: "pre-wrap", wordBreak: "break-all",
      }}
    >
      <button
        onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }}
        style={{ float: "right", background: "#fff", color: "#000", borderRadius: 8, padding: "4px 10px", fontWeight: 700, border: "none" }}
      >
        {copied ? "Copié ✓" : "Copier"}
      </button>
      {onClose && (
        <button
          onClick={onClose}
          style={{ float: "right", marginRight: 8, background: "#444", color: "#fff", borderRadius: 8, padding: "4px 10px", fontWeight: 700, border: "none" }}
        >
          Fermer
        </button>
      )}
      <strong style={{ color: "#fff" }}>Diagnostic installation</strong>
      {"\n"}
      {report ? text : "Analyse en cours…"}
    </div>
  );
}