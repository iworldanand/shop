"use client";

import Link from "next/link";
import { BookOpen, MessageCircle, Keyboard, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SHORTCUTS = [
  ["Space", "Play / pause"],
  ["← / →", "Nudge playhead 0.5s"],
  ["⌘ / Ctrl + Z", "Undo"],
  ["⌘ / Ctrl + ⇧ + Z", "Redo"],
  ["S", "Split caption at playhead"],
  ["M", "Merge with next caption"],
];

const FAQ = [
  { q: "How do I change the caption language?", a: "Open the style picker after upload and use the language dropdown, or switch it in the editor toolbar. We re-run translation and keep your timing." },
  { q: "Why is there a watermark?", a: "Free plan exports include a watermark. Upgrade to Starter or higher to remove it and unlock 1080p/4K." },
  { q: "Do my custom styles sync?", a: "Yes — saved styles appear under ‘My styles’ in the picker and are available on any project." },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Help & resources</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everything you need to get the most out of CaptionForge.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, title: "Docs", body: "Guides & tutorials", href: "#" },
          { icon: MessageCircle, title: "Contact support", body: "We reply within a day", href: "#" },
          { icon: Zap, title: "What's new", body: "Latest features", href: "#" },
        ].map((c) => (
          <Card key={c.title} className="transition-transform hover:-translate-y-1">
            <CardContent className="p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary"><c.icon className="h-5 w-5" /></span>
              <h3 className="mt-3 font-semibold">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="flex items-center gap-2 font-semibold"><Keyboard className="h-4 w-4" /> Keyboard shortcuts</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {SHORTCUTS.map(([k, d]) => (
              <div key={k} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span className="text-muted-foreground">{d}</span>
                <kbd className="rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-xs">{k}</kbd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        <h2 className="font-semibold">FAQ</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                {f.q}<span className="text-muted-foreground transition-transform group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline"><Link href="/dashboard">Back to dashboard</Link></Button>
      </div>
    </div>
  );
}
