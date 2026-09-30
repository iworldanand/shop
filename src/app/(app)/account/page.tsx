"use client";

import * as React from "react";
import { User, CreditCard, Gauge, KeyRound, Palette, Copy, Plus, Trash2, Download, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DEMO_USAGE, DEMO_SUBSCRIPTION } from "@/lib/data/sample";
import { formatCurrency, relativeTime } from "@/lib/utils";

const INVOICES = [
  { id: "in_2026_09", date: "2026-09-28", amount: 29, plan: "Pro" },
  { id: "in_2026_08", date: "2026-08-28", amount: 29, plan: "Pro" },
  { id: "in_2026_07", date: "2026-07-28", amount: 12, plan: "Starter" },
];

export default function AccountPage() {
  const [apiKeys, setApiKeys] = React.useState([
    { id: "1", name: "Production", key: "cf_live_9f2a8b1c4d7e0a3f6b9c2d5e8f1a4b7c", created: "2026-08-01", show: false },
  ]);

  function addKey() {
    const key = "cf_live_" + Array.from({ length: 32 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    setApiKeys((k) => [...k, { id: Date.now().toString(), name: "New key", key, created: new Date().toISOString(), show: true }]);
    toast.success("API key created — copy it now, it won't be shown again.");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Account</h1>

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="profile"><User className="mr-1.5 h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="usage"><Gauge className="mr-1.5 h-3.5 w-3.5" /> Usage</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="mr-1.5 h-3.5 w-3.5" /> Billing</TabsTrigger>
          <TabsTrigger value="brand"><Palette className="mr-1.5 h-3.5 w-3.5" /> Brand kit</TabsTrigger>
          <TabsTrigger value="api"><KeyRound className="mr-1.5 h-3.5 w-3.5" /> API keys</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Update your personal information.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16"><AvatarFallback className="text-lg">CF</AvatarFallback></Avatar>
                <Button variant="outline" size="sm">Change avatar</Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Full name</Label><Input defaultValue="Creator" /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input defaultValue="creator@captionforge.app" type="email" /></div>
              </div>
              <Button onClick={() => toast.success("Profile updated")}>Save changes</Button>
            </CardContent>
          </Card>

          <Card className="mt-4 border-destructive/40">
            <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /> Danger zone</CardTitle><CardDescription>Permanently delete your account and all data.</CardDescription></CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => toast.error("Account deletion requires email confirmation (demo)")}>
                <Trash2 className="h-4 w-4" /> Delete account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage */}
        <TabsContent value="usage">
          <div className="grid gap-4 sm:grid-cols-2">
            <UsageCard label="AI credits" used={DEMO_USAGE.creditsUsed} total={DEMO_USAGE.creditsTotal} />
            <UsageCard label="Preview minutes" used={DEMO_USAGE.previewMinutesUsed} total={DEMO_USAGE.previewMinutesTotal} />
          </div>
          <Card className="mt-4">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium">Plan renews</p>
                <p className="text-sm text-muted-foreground">{new Date(DEMO_USAGE.expiresAt).toLocaleDateString()}</p>
              </div>
              <Badge variant="pro" className="capitalize">{DEMO_SUBSCRIPTION.plan}</Badge>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <Card>
            <CardHeader><CardTitle>Billing history</CardTitle><CardDescription>Download invoices for your records.</CardDescription></CardHeader>
            <CardContent className="divide-y divide-border">
              {INVOICES.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(inv.amount)} · {inv.plan}</p>
                    <p className="text-xs text-muted-foreground">{new Date(inv.date).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toast.success(`Downloading ${inv.id}.pdf`)}>
                    <Download className="h-4 w-4" /> Invoice
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand kit */}
        <TabsContent value="brand">
          <Card>
            <CardHeader><CardTitle>Brand kit</CardTitle><CardDescription>Save fonts, colors, logo and a default style to reuse across projects.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5"><Label>Brand name</Label><Input defaultValue="My Channel" /></div>
              <div>
                <Label>Brand colors</Label>
                <div className="mt-2 flex gap-2">
                  {["#8b5cf6", "#fbbf24", "#0a0a0a", "#ffffff"].map((c) => (
                    <span key={c} className="h-9 w-9 rounded-lg border border-border" style={{ background: c }} />
                  ))}
                  <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Default font</Label><Input defaultValue="Inter" /></div>
              <div>
                <Label>Logo</Label>
                <div className="mt-2 flex h-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/50">
                  Drop logo (PNG/SVG)
                </div>
              </div>
              <Button onClick={() => toast.success("Brand kit saved")}>Save brand kit</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API keys */}
        <TabsContent value="api">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div><CardTitle>API keys</CardTitle><CardDescription>Use the CaptionForge API to automate captioning.</CardDescription></div>
              <Button size="sm" onClick={addKey}><Plus className="h-4 w-4" /> New key</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {apiKeys.map((k) => (
                <div key={k.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{k.name}</p>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setApiKeys((ks) => ks.map((x) => x.id === k.id ? { ...x, show: !x.show } : x))}>
                        {k.show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => { navigator.clipboard?.writeText(k.key); toast.success("Copied"); }}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setApiKeys((ks) => ks.filter((x) => x.id !== k.id))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <code className="mt-1 block truncate font-mono text-xs text-muted-foreground">
                    {k.show ? k.key : "cf_live_" + "•".repeat(24)}
                  </code>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsageCard({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = Math.round((used / total) * 100);
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{label}</p>
          <span className="text-sm tabular-nums text-muted-foreground">{used.toLocaleString()} / {total.toLocaleString()}</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full accent-gradient" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{100 - pct}% remaining this cycle</p>
      </CardContent>
    </Card>
  );
}
