"use client";

import * as React from "react";
import Link from "next/link";
import { Upload, Search, LayoutGrid } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { SAMPLE_PROJECTS } from "@/lib/data/sample";
import type { ProjectStatus } from "@/lib/types";

const FILTERS: { id: "all" | ProjectStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "done", label: "Done" },
  { id: "ready", label: "Ready" },
  { id: "rendering", label: "Rendering" },
];

export default function ProjectsPage() {
  const [filter, setFilter] = React.useState<"all" | ProjectStatus>("all");
  const [q, setQ] = React.useState("");

  const projects = SAMPLE_PROJECTS.filter(
    (p) => (filter === "all" || p.status === filter) && p.title.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">{SAMPLE_PROJECTS.length} projects</p>
        </div>
        <Button asChild>
          <Link href="/upload"><Upload className="h-4 w-4" /> New video</Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects…"
            className="h-9 w-full rounded-full border border-border bg-secondary/60 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center gap-3 text-center text-muted-foreground">
          <LayoutGrid className="h-10 w-10" />
          <p>No projects here yet.</p>
          <Button asChild variant="outline"><Link href="/upload">Upload your first video</Link></Button>
        </div>
      )}
    </div>
  );
}
