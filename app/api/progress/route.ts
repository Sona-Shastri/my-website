import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const STATUSES = [
  "Not started",
  "Voicemail left",
  "Emailed info",
  "Callback scheduled",
  "Interested",
  "Declined",
  "Referred elsewhere",
  "PLACED",
];

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let siteId = "";
  let done: boolean | undefined;
  let status: string | undefined;
  let notes: string | undefined;
  try {
    const body = await req.json();
    siteId = String(body.siteId || "");
    if (typeof body.done === "boolean") done = body.done;
    if (typeof body.status === "string" && STATUSES.includes(body.status)) status = body.status;
    if (typeof body.notes === "string") notes = body.notes.slice(0, 2000);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!siteId) return NextResponse.json({ error: "Missing siteId" }, { status: 400 });

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return NextResponse.json({ error: "Unknown site" }, { status: 404 });

  const data: { done?: boolean; status?: string; notes?: string } = {};
  if (done !== undefined) data.done = done;
  if (status !== undefined) data.status = status;
  if (notes !== undefined) data.notes = notes;

  const saved = await prisma.progress.upsert({
    where: { userId_siteId: { userId: user.id, siteId } },
    create: { userId: user.id, siteId, ...data },
    update: data,
  });

  return NextResponse.json({ ok: true, progress: saved });
}
