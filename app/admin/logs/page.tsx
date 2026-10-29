// app/admin/logs/page.tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 25;

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/auth/signin");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const type = sp.type || undefined;
  const where = type ? { targetType: type } : {};

  const [logs, total, types] = await Promise.all([
    prisma.adminLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { admin: { select: { name: true, email: true } } },
    }),
    prisma.adminLog.count({ where }),
    prisma.adminLog.findMany({ distinct: ["targetType"], select: { targetType: true } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) => `/admin/logs?page=${p}${type ? `&type=${type}` : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#282424] sm:text-3xl">Journal d'activité</h1>
          <p className="mt-1 text-sm text-gray-500">{total} action(s) enregistrée(s)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/logs" className={`rounded-full px-3 py-1.5 text-xs font-medium ${!type ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
            Tous
          </Link>
          {types.map((t) => (
            <Link key={t.targetType} href={`/admin/logs?type=${t.targetType}`} className={`rounded-full px-3 py-1.5 text-xs font-medium ${type === t.targetType ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
              {t.targetType}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Cible</th>
                <th className="px-4 py-3">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((l) => (
                <tr key={l.id} className="align-top hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {l.createdAt.toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{l.admin?.name || l.admin?.email || "Système"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{l.action}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {l.targetType}
                    <span className="ml-1 text-xs text-gray-400">#{l.targetId.slice(0, 8)}</span>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-xs text-gray-500">
                    <span className="line-clamp-2 break-all">{l.details ? JSON.stringify(l.details) : "—"}</span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Aucune action enregistrée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Page {page} / {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={href(page - 1)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50">← Précédent</Link>}
            {page < pages && <Link href={href(page + 1)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50">Suivant →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
