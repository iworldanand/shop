"use client";

import * as React from "react";
import { ZoomIn, ZoomOut, Scissors, Merge } from "lucide-react";
import { useEditor } from "@/lib/store/editor";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";

// Deterministic pseudo-waveform so SSR/CSR match.
function wave(i: number) {
  const x = Math.sin(i * 0.7) * 0.5 + Math.sin(i * 1.9) * 0.3 + Math.sin(i * 0.3) * 0.2;
  return 0.25 + Math.abs(x) * 0.7;
}

export function Timeline() {
  const { segments, duration, currentTime, setTime, selectedSegmentId, selectSegment, splitSegment, mergeWithNext, retimeSegment } =
    useEditor();
  const [zoom, setZoom] = React.useState(1);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const width = 1000 * zoom;
  const bars = Math.floor(width / 4);

  const timeToX = (t: number) => (t / duration) * width;
  const xToTime = (x: number) => (x / width) * duration;

  function scrub(clientX: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = el.scrollLeft + clientX - rect.left;
    setTime(Math.max(0, Math.min(duration, xToTime(x))));
  }

  const dragRef = React.useRef<{ id: string; edge: "start" | "end" | "move"; startX: number; s: number; e: number } | null>(null);

  function onBlockDown(e: React.PointerEvent, id: string, edge: "start" | "end" | "move") {
    e.stopPropagation();
    const seg = segments.find((s) => s.id === id);
    if (!seg) return;
    dragRef.current = { id, edge, startX: e.clientX, s: seg.start, e: seg.end };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onBlockMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const dt = xToTime(e.clientX - d.startX);
    let start = d.s;
    let end = d.e;
    if (d.edge === "start") start = Math.min(end - 0.3, Math.max(0, d.s + dt));
    else if (d.edge === "end") end = Math.max(start + 0.3, Math.min(duration, d.e + dt));
    else {
      const len = d.e - d.s;
      start = Math.max(0, Math.min(duration - len, d.s + dt));
      end = start + len;
    }
    retimeSegment(d.id, +start.toFixed(2), +end.toFixed(2));
  }
  function onBlockUp() {
    dragRef.current = null;
  }

  return (
    <div className="border-t border-border bg-card/40">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Timeline</span>
          <span className="tabular-nums text-xs text-foreground">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!selectedSegmentId}
            onClick={() => selectedSegmentId && splitSegment(selectedSegmentId, currentTime)}
            title="Split at playhead"
          >
            <Scissors className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!selectedSegmentId}
            onClick={() => selectedSegmentId && mergeWithNext(selectedSegmentId)}
            title="Merge with next"
          >
            <Merge className="h-4 w-4" />
          </Button>
          <div className="mx-1 h-4 w-px bg-border" />
          <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => Math.max(0.5, z - 0.5))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => Math.min(4, z + 0.5))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={trackRef} className="scrollbar-thin relative overflow-x-auto px-4 pb-4" onPointerMove={onBlockMove} onPointerUp={onBlockUp}>
        <div className="relative" style={{ width }}>
          {/* Ruler */}
          <div className="relative mb-1 h-4">
            {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
              <span key={i} className="absolute top-0 text-[9px] tabular-nums text-muted-foreground" style={{ left: timeToX(i) }}>
                {i}s
              </span>
            ))}
          </div>

          {/* Waveform */}
          <div className="relative flex h-16 items-center gap-[2px] overflow-hidden rounded-lg bg-secondary/50 px-1" onPointerDown={(e) => scrub(e.clientX)}>
            {Array.from({ length: bars }).map((_, i) => (
              <span
                key={i}
                className="w-[2px] shrink-0 rounded-full bg-primary/40"
                style={{ height: `${wave(i) * 100}%` }}
              />
            ))}
          </div>

          {/* Caption blocks */}
          <div className="relative mt-2 h-10">
            {segments.map((seg) => {
              const left = timeToX(seg.start);
              const w = timeToX(seg.end) - left;
              const active = seg.id === selectedSegmentId;
              return (
                <div
                  key={seg.id}
                  onPointerDown={(e) => {
                    selectSegment(seg.id);
                    onBlockDown(e, seg.id, "move");
                  }}
                  className={cn(
                    "group absolute top-0 flex h-9 cursor-grab items-center overflow-hidden rounded-lg border px-2 text-xs active:cursor-grabbing",
                    active ? "border-primary bg-primary/20 text-foreground" : "border-border bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                  style={{ left, width: Math.max(24, w) }}
                >
                  <span
                    onPointerDown={(e) => onBlockDown(e, seg.id, "start")}
                    className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize bg-primary/0 group-hover:bg-primary/60"
                  />
                  <span className="truncate">{seg.text}</span>
                  <span
                    onPointerDown={(e) => onBlockDown(e, seg.id, "end")}
                    className="absolute right-0 top-0 h-full w-1.5 cursor-ew-resize bg-primary/0 group-hover:bg-primary/60"
                  />
                </div>
              );
            })}
          </div>

          {/* Playhead */}
          <div className="pointer-events-none absolute top-4 bottom-0 z-10 w-0.5 bg-primary" style={{ left: timeToX(currentTime) }}>
            <span className="absolute -left-1.5 -top-1 h-3 w-3 rounded-full bg-primary shadow" />
          </div>
        </div>
      </div>
    </div>
  );
}
