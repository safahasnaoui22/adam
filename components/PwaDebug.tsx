"use client";

// Install diagnostic. Invisible unless the URL contains ?pwa=debug, e.g.
//   https://adamrestaurents.vercel.app/client/dashboard?pwa=debug
// It checks, from the phone itself, the things that decide whether Chrome
// offers "Install app": the manifest link, the manifest file, its icons, the
// service worker, and whether Chrome handed the page an install prompt.

import { useEffect, useState } from "react";
import { getDeferredPrompt, onPwaStateChange } from "@/lib/pwaInstall";

type Report = Record<string, unknown>;

async function probe(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  return { status: res.status, type: res.headers.get("content-type"), redirected: res.redirected, res };
}

export default function PwaDebug() {
  const [enabled, setEnabled] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [, tick] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEnabled(new URLSearchParams(window.location.search).get("pwa") === "debug");
  }, []);

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

      const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      r.manifestLink = link ? link.href : "MISSING: no <link rel=manifest> in the page";
      if (link) {
        try {
          const m = await probe(link.href);
          r.manifestHttp = `${m.status} ${m.type}${m.redirected ? " (REDIRECTED)" : ""}`;
          const text = await m.res.text();
          try {
            const j = JSON.parse(text);
            r.manifestName = j.name;
            r.manifestStartUrl = j.start_url;
            r.manifestDisplay = j.display;
            const icons: any[] = j.icons || [];
            r.manifestIconCount = icons.length;
            for (const size of ["192", "512"]) {
              const icon = icons.find((i) => String(i.sizes).startsWith(size));
              if (!icon) { r[`icon${size}`] = "MISSING from manifest"; continue; }
              const i = await probe(new URL(icon.src, link.href).toString());
              r[`icon${size}`] = `${i.status} ${i.type}${i.redirected ? " (REDIRECTED)" : ""}`;
            }
          } catch {
            r.manifestBody = "NOT JSON → " + text.slice(0, 80).replace(/\s+/g, " ");
          }
        } catch (e) {
          r.manifestFetchError = String(e);
        }
      }

      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        r.serviceWorker = reg
          ? `${reg.active?.state ?? reg.installing?.state ?? reg.waiting?.state ?? "?"} · scope ${reg.scope}`
          : "NOT registered";
        r.serviceWorkerControlsPage = !!navigator.serviceWorker.controller;
      } else {
        r.serviceWorker = "not supported by this browser";
      }
      setReport(r);
    })();
  }, [enabled]);

  if (!enabled) return null;

  const text = JSON.stringify({ installPromptFromChrome: !!getDeferredPrompt(), ...report }, null, 2);

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
      <strong style={{ color: "#fff" }}>Diagnostic installation</strong>
      {"\n"}
      {report ? text : "Analyse en cours…"}
    </div>
  );
}