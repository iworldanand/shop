"use client";

import * as React from "react";
import { Download, Film, FileText, Loader2, CheckCircle2, Mail, Crown } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AspectRatio, CaptionSegment, RenderSpec } from "@/lib/types";
import { segmentsToSrt, segmentsToVtt, specToAss } from "@/lib/render/ass";

const RES = [
  { id: "720p", label: "720p", sub: "HD · Free", pro: false },
  { id: "1080p", label: "1080p", sub: "Full HD", pro: false },
  { id: "4k", label: "4K", sub: "Ultra HD · Pro", pro: true },
] as const;

export function ExportDialog({
  segments,
  spec,
  aspect,
  children,
}: {
  segments: CaptionSegment[];
  spec: RenderSpec;
  aspect: AspectRatio;
  children: React.ReactNode;
}) {
  const [res, setRes] = React.useState<"720p" | "1080p" | "4k">("1080p");
  const [watermark, setWatermark] = React.useState(false);
  const [phase, setPhase] = React.useState<"config" | "rendering" | "done">("config");
  const [progress, setProgress] = React.useState(0);

  function download(filename: string, content: string, type = "text/plain") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded`);
  }

  function startRender() {
    setPhase("rendering");
    setProgress(0);
    // In production this POSTs to /api/render which enqueues an FFmpeg worker job
    // and streams progress over SSE / polling. Here we simulate the queue.
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setPhase("done");
          return 100;
        }
        return Math.min(100, p + Math.random() * 12);
      });
    }, 300);
  }

  return (
    <Dialog onOpenChange={(o) => !o && setTimeout(() => { setPhase("config"); setProgress(0); }, 200)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        {phase === "config" && (
          <>
            <DialogHeader>
              <DialogTitle>Export video</DialogTitle>
              <DialogDescription>Burn captions into your video, or download subtitle files.</DialogDescription>
            </DialogHeader>

            <div>
              <p className="mb-2 text-sm font-medium">Resolution</p>
              <div className="grid grid-cols-3 gap-2">
                {RES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRes(r.id)}
                    className={cn(
                      "relative rounded-xl border p-3 text-left transition-colors",
                      res === r.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
                    )}
                  >
                    {r.pro && <Crown className="absolute right-2 top-2 h-3.5 w-3.5 text-amber-400" />}
                    <p className="text-sm font-semibold">{r.label}</p>
                    <p className="text-[11px] text-muted-foreground">{r.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
              <span>
                Add watermark <span className="text-muted-foreground">(required on Free plan)</span>
              </span>
              <input type="checkbox" checked={watermark} onChange={(e) => setWatermark(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
            </label>

            <Button onClick={startRender} className="w-full">
              <Film className="h-4 w-4" /> Render MP4 ({res})
            </Button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or subtitle files</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => download("captions.srt", segmentsToSrt(segments))}>
                <FileText className="h-4 w-4" /> SRT
              </Button>
              <Button variant="outline" size="sm" onClick={() => download("captions.vtt", segmentsToVtt(segments))}>
                <FileText className="h-4 w-4" /> VTT
              </Button>
              <Button variant="outline" size="sm" onClick={() => download("captions.ass", specToAss(spec, segments, aspect))}>
                <FileText className="h-4 w-4" /> ASS
              </Button>
            </div>
          </>
        )}

        {phase === "rendering" && (
          <div className="py-6 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Rendering {res} MP4…</h3>
            <p className="mt-1 text-sm text-muted-foreground">Queued on an FFmpeg worker. You can leave this page.</p>
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full accent-gradient transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-sm tabular-nums text-muted-foreground">{Math.round(progress)}%</p>
          </div>
        )}

        {phase === "done" && (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h3 className="mt-4 text-lg font-semibold">Export ready!</h3>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> We also emailed you the download link.
            </p>
            <Button className="mt-5 w-full" onClick={() => toast.success("Downloading rendered MP4 (demo)")}>
              <Download className="h-4 w-4" /> Download {res} MP4
            </Button>
            <Badge variant="secondary" className="mt-3">captionforge_export_{res}.mp4</Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
