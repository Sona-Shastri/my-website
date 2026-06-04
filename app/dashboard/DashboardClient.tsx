"use client";

import { useMemo, useRef, useState } from "react";
import type { SessionUser } from "@/lib/auth";

export type SiteData = {
  id: string;
  student: string;
  city: string;
  name: string;
  address: string;
  phone: string;
  priority: string;
  done: boolean;
  status: string;
  notes: string;
};

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

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join(".")
    .toUpperCase() + ".";
}

function statusClass(status: string) {
  const key = status.replace(/\s+/g, "");
  return ["PLACED", "Interested", "Declined", "Callbackscheduled"].includes(key)
    ? `st-${key}`
    : "";
}

export default function DashboardClient({
  user,
  sites,
  notes,
}: {
  user: SessionUser;
  sites: SiteData[];
  notes: Record<string, string>;
}) {
  const [rows, setRows] = useState<SiteData[]>(sites);

  // group by student preserving order
  const groups = useMemo(() => {
    const map = new Map<string, SiteData[]>();
    for (const r of rows) {
      if (!map.has(r.student)) map.set(r.student, []);
      map.get(r.student)!.push(r);
    }
    return [...map.entries()];
  }, [rows]);

  const summary = useMemo(() => {
    const total = rows.length;
    const done = rows.filter((r) => r.done).length;
    const placed = rows.filter((r) => r.status === "PLACED").length;
    const interested = rows.filter((r) => r.status === "Interested").length;
    return { total, done, placed, interested };
  }, [rows]);

  function update(id: string, patch: Partial<SiteData>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <>
      <header className="topbar">
        <span className="brand">Tesla MRI Tracker</span>
        <span className="who">{user.name || user.email}</span>
        <form action="/api/logout" method="post">
          <button className="logout" type="submit">
            Log out
          </button>
        </form>
      </header>

      <main className="dash">
        <h2>Call Tracker 📞</h2>
        <p className="panel-sub">Your progress saves automatically as you go.</p>

        <div className="summary">
          <span className="chip">
            <b>{summary.done}</b>/{summary.total} done
          </span>
          <span className="chip">
            Interested: <b>{summary.interested}</b>
          </span>
          <span className="chip">
            Placed: <b>{summary.placed}</b>
          </span>
        </div>

        <div className="grid">
          {groups.map(([student, list]) => (
            <section className="col-card" key={student}>
              <div className="col-head">
                <span className="initials">{initials(student)}</span>
                <div>
                  <h3>{student}</h3>
                  <span className="city">
                    {list[0]?.city} · {list.length} sites
                  </span>
                </div>
              </div>
              {notes[student] && <p className="col-note">{notes[student]}</p>}
              {list.map((site) => (
                <SiteRow key={site.id} site={site} onChange={update} />
              ))}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}

function SiteRow({
  site,
  onChange,
}: {
  site: SiteData;
  onChange: (id: string, patch: Partial<SiteData>) => void;
}) {
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function save(patch: Partial<SiteData>) {
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: site.id, ...patch }),
      });
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 1200);
    } catch {
      /* keep local change; will retry on next edit */
    }
  }

  return (
    <div className={`site${site.done ? " done" : ""}`}>
      <div className="site-top">
        <input
          type="checkbox"
          className="site-check"
          checked={site.done}
          aria-label="Mark as done"
          onChange={(e) => {
            const done = e.target.checked;
            onChange(site.id, { done });
            save({ done });
          }}
        />
        <div className="site-info">
          <div className="site-name">
            {site.name}
            {saved && <span className="saved-dot">✓ saved</span>}
          </div>
          <div className="site-meta">
            {site.address} · 📞 {site.phone}
          </div>
        </div>
      </div>
      <div className="site-controls">
        <select
          className={`status-select ${statusClass(site.status)}`}
          value={site.status}
          onChange={(e) => {
            const status = e.target.value;
            onChange(site.id, { status });
            save({ status });
          }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          className="notes-input"
          type="text"
          placeholder="Notes…"
          defaultValue={site.notes}
          onChange={(e) => {
            const notes = e.target.value;
            onChange(site.id, { notes });
            if (notesTimer.current) clearTimeout(notesTimer.current);
            notesTimer.current = setTimeout(() => save({ notes }), 600);
          }}
        />
      </div>
    </div>
  );
}
