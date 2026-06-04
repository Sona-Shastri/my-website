import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import DashboardClient, { type SiteData } from "./DashboardClient";

export const dynamic = "force-dynamic";

const NOTES: Record<string, string> = {
  "Margaret Ampomah": "STRIC main scheduling: 📞 (210) 617-9000",
  "Lidia Kelati": "Note: Novant sites share a parent org listed once on the master list.",
  "Lars Swanson":
    "Summit scheduling 📞 651-968-5201. TRIA is HealthPartners-affiliated; Children's MN is pediatric.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [sites, progress] = await Promise.all([
    prisma.site.findMany({ orderBy: { order: "asc" } }),
    prisma.progress.findMany({ where: { userId: user.id } }),
  ]);

  const pmap = new Map(progress.map((p) => [p.siteId, p]));

  const data: SiteData[] = sites.map((s) => {
    const p = pmap.get(s.id);
    return {
      id: s.id,
      student: s.student,
      city: s.city,
      name: s.name,
      address: s.address,
      phone: s.phone,
      priority: s.priority,
      done: p?.done ?? false,
      status: p?.status ?? "Not started",
      notes: p?.notes ?? "",
    };
  });

  return <DashboardClient user={user} sites={data} notes={NOTES} />;
}
