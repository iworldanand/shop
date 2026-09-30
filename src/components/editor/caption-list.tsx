"use client";

import * as React from "react";
import { Plus, Trash2, Scissors, Play } from "lucide-react";
import { useEditor } from "@/lib/store/editor";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";

export function CaptionList() {
  const { segments, selectedSegmentId, selectSegment, updateSegmentText, addSegment, deleteSegment, splitSegment, currentTime, setTime, setPlaying } = useEditor();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Captions ({segments.length})</h3>
        <Button size="sm" variant="outline" onClick={addSegment}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">
        {segments.map((seg) => {
          const active = seg.id === selectedSegmentId;
          const isPlaying = currentTime >= seg.start && currentTime <= seg.end;
          return (
            <div
              key={seg.id}
              onClick={() => selectSegment(seg.id)}
              className={cn(
                "rounded-xl border p-3 transition-colors",
                active ? "border-primary bg-primary/[0.04]" : isPlaying ? "border-primary/40 bg-secondary/60" : "border-border hover:bg-secondary/40"
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTime(seg.start);
                    setPlaying(true);
                  }}
                  className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground hover:text-foreground"
                >
                  <Play className="h-3 w-3" /> {formatDuration(seg.start)} → {formatDuration(seg.end)}
                </button>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      splitSegment(seg.id, (seg.start + seg.end) / 2);
                    }}
                    className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    title="Split"
                  >
                    <Scissors className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSegment(seg.id);
                    }}
                    className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <textarea
                value={seg.text}
                onChange={(e) => updateSegmentText(seg.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                rows={2}
                className="w-full resize-none rounded-lg border border-transparent bg-transparent text-sm outline-none focus:border-border focus:bg-background focus:px-2 focus:py-1.5"
              />
            </div>
          );
        })}
        {segments.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No captions yet. Click “Add” to create one.
          </div>
        )}
      </div>
    </div>
  );
}
