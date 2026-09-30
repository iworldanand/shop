"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Pause,
  Undo2,
  Redo2,
  Download,
  Type,
  ListOrdered,
  Eye,
  SkipBack,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CaptionPreview } from "@/components/caption-preview";
import { Timeline } from "@/components/editor/timeline";
import { StylePanel } from "@/components/editor/style-panel";
import { CaptionList } from "@/components/editor/caption-list";
import { ExportDialog } from "@/components/editor/export-dialog";
import { useEditor } from "@/lib/store/editor";
import { TEMPLATES_BY_ID } from "@/lib/data/templates";
import { SAMPLE_SEGMENTS, SAMPLE_DURATION, SAMPLE_PROJECTS } from "@/lib/data/sample";
import { DEFAULT_SPEC } from "@/lib/render/defaults";
import { cn, formatDuration } from "@/lib/utils";

export default function EditorPage() {
  const params = useParams<{ projectId: string }>();
  const search = useSearchParams();
  const styleId = search.get("style");
  const lang = search.get("lang") ?? "en";

  const {
    segments, spec, aspect, background, currentTime, duration, playing,
    init, setTime, setPlaying, undo, redo, past, future,
  } = useEditor();

  const project = SAMPLE_PROJECTS.find((p) => p.id === params.projectId);

  // Initialize editor state on mount.
  React.useEffect(() => {
    const template = styleId ? TEMPLATES_BY_ID[styleId] : project?.templateId ? TEMPLATES_BY_ID[project.templateId] : null;
    init({
      segments: structuredClone(SAMPLE_SEGMENTS),
      spec: structuredClone(template?.spec ?? DEFAULT_SPEC),
      duration: project?.durationSec && project.durationSec < 30 ? project.durationSec : SAMPLE_DURATION,
      aspect: project?.aspectRatio ?? "9:16",
      background: project?.thumbnailUrl ?? "grad:violet",
      language: lang,
      currentTime: 0,
      playing: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleId, params.projectId]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " ") {
        e.preventDefault();
        setPlaying(!useEditor.getState().playing);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        redo();
      } else if (e.key === "ArrowRight") {
        setTime(Math.min(duration, useEditor.getState().currentTime + 0.5));
      } else if (e.key === "ArrowLeft") {
        setTime(Math.max(0, useEditor.getState().currentTime - 0.5));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [duration, setPlaying, setTime, undo, redo]);

  const template = styleId ? TEMPLATES_BY_ID[styleId] : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-3">
        <Button asChild variant="ghost" size="icon-sm">
          <Link href="/projects"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="hidden sm:block"><Logo showText={false} /></div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{project?.title ?? "Untitled project"}</p>
          <p className="text-[11px] text-muted-foreground">
            {template ? `Style: ${template.name}` : "Custom style"} · {lang.toUpperCase()}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon-sm" onClick={undo} disabled={past.length === 0} title="Undo (⌘Z)">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={redo} disabled={future.length === 0} title="Redo (⌘⇧Z)">
            <Redo2 className="h-4 w-4" />
          </Button>
          <div className="mx-1 h-5 w-px bg-border" />
          <Button variant="ghost" size="sm" onClick={() => toast.success("Draft saved")}>Save</Button>
          <ThemeToggle />
          <ExportDialog segments={segments} spec={spec} aspect={aspect}>
            <Button size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
          </ExportDialog>
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Left: captions */}
        <aside className="hidden w-80 shrink-0 border-r border-border lg:block">
          <CaptionList />
        </aside>

        {/* Center: preview + timeline */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,hsl(var(--secondary))_0%,transparent_70%)] p-6">
            <div className="relative h-full max-h-[62vh]">
              <div className="h-full overflow-hidden rounded-2xl border border-border shadow-2xl">
                <CaptionPreview
                  spec={spec}
                  segments={segments}
                  duration={duration}
                  aspect={aspect}
                  background={background}
                  time={currentTime}
                  playing={playing}
                  showSafeZone={spec.layout.safeZone}
                  className="h-full"
                  onTimeUpdate={() => {}}
                />
              </div>
            </div>

            {/* Playhead driver */}
            <PlaybackDriver />
          </div>

          {/* Transport */}
          <div className="flex items-center gap-3 border-t border-border px-4 py-2">
            <Button variant="ghost" size="icon-sm" onClick={() => setTime(0)}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="icon" className="rounded-full" onClick={() => setPlaying(!playing)}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            </Button>
            <span className="tabular-nums text-xs text-muted-foreground">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.01}
              value={currentTime}
              onChange={(e) => setTime(parseFloat(e.target.value))}
              className="h-1 flex-1 cursor-pointer accent-[hsl(var(--primary))]"
            />
            <Badge variant="secondary">{aspect}</Badge>
          </div>

          <Timeline />
        </div>

        {/* Right: style panel */}
        <aside className="hidden w-80 shrink-0 border-l border-border xl:block">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Style</h3>
          </div>
          <div className="h-[calc(100%-49px)]">
            <StylePanel />
          </div>
        </aside>
      </div>

      {/* Mobile panel switcher */}
      <div className="border-t border-border p-2 lg:hidden">
        <Tabs defaultValue="captions">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="captions"><ListOrdered className="mr-1 h-3.5 w-3.5" /> Captions</TabsTrigger>
            <TabsTrigger value="style"><Type className="mr-1 h-3.5 w-3.5" /> Style</TabsTrigger>
            <TabsTrigger value="preview"><Eye className="mr-1 h-3.5 w-3.5" /> Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="captions" className="h-72 overflow-hidden rounded-xl border border-border">
            <CaptionList />
          </TabsContent>
          <TabsContent value="style" className="h-72 overflow-hidden rounded-xl border border-border">
            <StylePanel />
          </TabsContent>
          <TabsContent value="preview" className="h-72 rounded-xl border border-border p-4 text-center text-sm text-muted-foreground">
            Use the player above to preview.
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/** Advances the store's currentTime when playing (drives preview + timeline). */
function PlaybackDriver() {
  const { playing, duration } = useEditor();
  React.useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const state = useEditor.getState();
      let t = state.currentTime + dt;
      if (t > duration) t = 0;
      state.setTime(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration]);
  return null;
}
