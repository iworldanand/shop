"use client";

import * as React from "react";
import {
  Users, DollarSign, Repeat, Film, Flag, ShieldAlert, LayoutTemplate, AlertOctagon, Search, Check, X, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AnimatedCounter } from "@/components/animated-counter";
import { CaptionPreview } from "@/components/caption-preview";
import { ADMIN_STATS, REVENUE_MONTHS, ADMIN_USERS, FAILED_RENDERS, PENDING_STYLES, FEATURE_FLAGS } from "@/lib/data/admin";
import { TEMPLATES } from "@/lib/data/templates";
import { CATEGORY_LABEL } from "@/lib/data/categories";
import { SAMPLE_SEGMENTS, SAMPLE_DURATION } from "@/lib/data/sample";
import type { Template } from "@/lib/types";
import { formatCurrency, relativeTime, cn } from "@/lib/utils";

export default function AdminPage() {
  const [flags, setFlags] = React.useState(FEATURE_FLAGS);
  const [pending, setPending] = React.useState(PENDING_STYLES);
  const [editTemplate, setEditTemplate] = React.useState<Template | null>(null);
  const [published, setPublished] = React.useState<Record<string, boolean>>(
    Object.fromEntries(TEMPLATES.map((t) => [t.id, t.published]))
  );
  const [q, setQ] = React.useState("");
  const maxRev = Math.max(...REVENUE_MONTHS.map((r) => r.v));

  const filteredTemplates = TEMPLATES.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())).slice(0, 40);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <Badge variant="pro" className="ml-2">Restricted</Badge>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: DollarSign, label: "MRR", value: ADMIN_STATS.mrr, prefix: "$", color: "text-emerald-500" },
          { icon: Users, label: "Total users", value: ADMIN_STATS.users, color: "text-primary" },
          { icon: Repeat, label: "Active subscriptions", value: ADMIN_STATS.activeSubs, color: "text-cyan-500" },
          { icon: Film, label: "Renders today", value: ADMIN_STATS.rendersToday, color: "text-amber-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-secondary", s.color)}><s.icon className="h-4 w-4" /></span>
              <div className="mt-3 text-2xl font-semibold tracking-tight">
                <AnimatedCounter value={s.value} prefix={s.prefix ?? ""} />
              </div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="mt-8">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="revenue"><DollarSign className="mr-1.5 h-3.5 w-3.5" /> Revenue</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-1.5 h-3.5 w-3.5" /> Users</TabsTrigger>
          <TabsTrigger value="templates"><LayoutTemplate className="mr-1.5 h-3.5 w-3.5" /> Templates</TabsTrigger>
          <TabsTrigger value="moderation"><ShieldAlert className="mr-1.5 h-3.5 w-3.5" /> Moderation</TabsTrigger>
          <TabsTrigger value="flags"><Flag className="mr-1.5 h-3.5 w-3.5" /> Flags</TabsTrigger>
          <TabsTrigger value="renders"><AlertOctagon className="mr-1.5 h-3.5 w-3.5" /> Renders</TabsTrigger>
        </TabsList>

        {/* Revenue */}
        <TabsContent value="revenue">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly recurring revenue</p>
                  <p className="text-2xl font-semibold">{formatCurrency(ADMIN_STATS.mrr)}</p>
                </div>
                <div className="flex gap-6 text-right text-sm">
                  <div><p className="text-muted-foreground">Churn</p><p className="font-semibold">{ADMIN_STATS.churnRate}%</p></div>
                  <div><p className="text-muted-foreground">ARPU</p><p className="font-semibold">{formatCurrency(ADMIN_STATS.arpu)}</p></div>
                </div>
              </div>
              <div className="flex h-48 items-end gap-4">
                {REVENUE_MONTHS.map((r) => (
                  <div key={r.m} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full items-end justify-center" style={{ height: "100%" }}>
                      <div className="w-full max-w-[48px] rounded-t-lg accent-gradient transition-all" style={{ height: `${(r.v / maxRev) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{r.m}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">User</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Role</th><th className="px-4 py-3">Lifetime</th><th className="px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ADMIN_USERS.map((u) => (
                      <tr key={u.id} className="hover:bg-secondary/40">
                        <td className="px-4 py-3">
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="px-4 py-3 capitalize"><Badge variant={u.plan === "free" ? "secondary" : "default"}>{u.plan}</Badge></td>
                        <td className="px-4 py-3">
                          <Badge variant={u.status === "active" ? "success" : u.status === "past_due" ? "warning" : "outline"}>{u.status.replace("_", " ")}</Badge>
                        </td>
                        <td className="px-4 py-3">{u.role === "admin" ? <Badge variant="pro">admin</Badge> : <span className="text-muted-foreground">user</span>}</td>
                        <td className="px-4 py-3 tabular-nums">{formatCurrency(u.spend)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(u.joined).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates manager */}
        <TabsContent value="templates">
          <div className="relative mb-4 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates…" className="h-9 w-full rounded-full border border-border bg-secondary/60 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {filteredTemplates.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="h-12 w-8 shrink-0 overflow-hidden rounded-md border border-border">
                    <CaptionPreview spec={t.spec} segments={SAMPLE_SEGMENTS} duration={SAMPLE_DURATION} aspect="9:16" background="grad:violet" quality={0.4} playing={false} time={1.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[t.category]} · {t.is_pro ? "Pro" : "Free"} · {t.credits_per_min} cr/min</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Published
                    <Switch checked={published[t.id]} onCheckedChange={(v) => { setPublished((p) => ({ ...p, [t.id]: v })); toast.success(`${t.name} ${v ? "published" : "unpublished"}`); }} />
                  </label>
                  <Button variant="outline" size="sm" onClick={() => setEditTemplate(t)}><Eye className="h-3.5 w-3.5" /> Edit</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation */}
        <TabsContent value="moderation">
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {pending.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No community styles pending review. 🎉</p>}
              {pending.map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">by {s.author} · {s.category} · submitted {new Date(s.submitted).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setPending((p) => p.filter((x) => x.id !== s.id)); toast.error(`Rejected "${s.name}"`); }}>
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => { setPending((p) => p.filter((x) => x.id !== s.id)); toast.success(`Approved & published "${s.name}"`); }}>
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature flags */}
        <TabsContent value="flags">
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {flags.map((f) => (
                <div key={f.id} className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                  <Switch checked={f.on} onCheckedChange={(v) => { setFlags((fs) => fs.map((x) => x.id === f.id ? { ...x, on: v } : x)); toast.success(`${f.label} ${v ? "enabled" : "disabled"}`); }} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failed renders */}
        <TabsContent value="renders">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <tr><th className="px-4 py-3">Job</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Res</th><th className="px-4 py-3">Error</th><th className="px-4 py-3">When</th><th className="px-4 py-3" /></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {FAILED_RENDERS.map((r) => (
                      <tr key={r.id} className="hover:bg-secondary/40">
                        <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                        <td className="px-4 py-3">{r.project}</td>
                        <td className="px-4 py-3"><Badge variant="secondary">{r.res}</Badge></td>
                        <td className="px-4 py-3 text-destructive">{r.error}</td>
                        <td className="px-4 py-3 text-muted-foreground">{relativeTime(r.at)}</td>
                        <td className="px-4 py-3"><Button size="sm" variant="outline" onClick={() => toast.success(`Requeued ${r.id}`)}>Retry</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template edit sheet with live preview */}
      <Sheet open={!!editTemplate} onOpenChange={(o) => !o && setEditTemplate(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>{editTemplate?.name}</SheetTitle></SheetHeader>
          {editTemplate && (
            <div className="space-y-4 p-6">
              <div className="mx-auto w-40 overflow-hidden rounded-2xl border border-border shadow-lg">
                <CaptionPreview spec={editTemplate.spec} segments={SAMPLE_SEGMENTS} duration={SAMPLE_DURATION} aspect="9:16" background="grad:violet" />
              </div>
              <div className="space-y-2 text-sm">
                <Row k="Category" v={CATEGORY_LABEL[editTemplate.category]} />
                <Row k="Tier" v={editTemplate.is_pro ? "Pro" : "Free"} />
                <Row k="Credits / min" v={String(editTemplate.credits_per_min)} />
                <Row k="Font" v={`${editTemplate.spec.font.family} ${editTemplate.spec.font.weight}`} />
                <Row k="Animation" v={editTemplate.spec.animation.in} />
                <Row k="Word effect" v={editTemplate.spec.animation.wordEffect} />
              </div>
              <p className="text-xs text-muted-foreground">Full spec editing uses the same controls as the creator “Customize” drawer. Changes are versioned in <code>admin_logs</code>.</p>
              <Button className="w-full" onClick={() => { toast.success("Template saved"); setEditTemplate(null); }}>Save changes</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium capitalize">{v}</span>
    </div>
  );
}
