"use client";

import { create } from "zustand";
import type { AspectRatio, CaptionSegment, RenderSpec } from "@/lib/types";
import { DEFAULT_SPEC } from "@/lib/render/defaults";

interface Snapshot {
  segments: CaptionSegment[];
  spec: RenderSpec;
}

interface EditorState {
  segments: CaptionSegment[];
  spec: RenderSpec;
  aspect: AspectRatio;
  background: string;
  language: string;
  currentTime: number;
  duration: number;
  playing: boolean;
  selectedSegmentId: string | null;
  past: Snapshot[];
  future: Snapshot[];

  init: (p: Partial<EditorState>) => void;
  setSpec: (spec: RenderSpec) => void;
  patchSpec: (fn: (s: RenderSpec) => void) => void;
  setTime: (t: number) => void;
  setPlaying: (v: boolean) => void;
  setAspect: (a: AspectRatio) => void;
  selectSegment: (id: string | null) => void;

  updateSegmentText: (id: string, text: string) => void;
  retimeSegment: (id: string, start: number, end: number) => void;
  splitSegment: (id: string, atTime: number) => void;
  mergeWithNext: (id: string) => void;
  addSegment: () => void;
  deleteSegment: (id: string) => void;

  undo: () => void;
  redo: () => void;
  commit: () => void;
}

function reWord(text: string, start: number, end: number) {
  const parts = text.split(/\s+/).filter(Boolean);
  const step = (end - start) / Math.max(1, parts.length);
  return parts.map((t, i) => ({
    text: t,
    start: +(start + i * step).toFixed(2),
    end: +(start + (i + 1) * step).toFixed(2),
  }));
}

export const useEditor = create<EditorState>((set, get) => ({
  segments: [],
  spec: DEFAULT_SPEC,
  aspect: "9:16",
  background: "grad:violet",
  language: "en",
  currentTime: 0,
  duration: 10,
  playing: false,
  selectedSegmentId: null,
  past: [],
  future: [],

  init: (p) => set({ ...p, past: [], future: [] }),
  setSpec: (spec) => {
    get().commit();
    set({ spec });
  },
  patchSpec: (fn) => {
    get().commit();
    set((state) => {
      const next = structuredClone(state.spec);
      fn(next);
      return { spec: next };
    });
  },
  setTime: (t) => set({ currentTime: t }),
  setPlaying: (v) => set({ playing: v }),
  setAspect: (a) => set({ aspect: a }),
  selectSegment: (id) => set({ selectedSegmentId: id }),

  updateSegmentText: (id, text) => {
    get().commit();
    set((state) => ({
      segments: state.segments.map((s) =>
        s.id === id ? { ...s, text, words: reWord(text, s.start, s.end) } : s
      ),
    }));
  },
  retimeSegment: (id, start, end) => {
    set((state) => ({
      segments: state.segments.map((s) =>
        s.id === id ? { ...s, start, end, words: reWord(s.text, start, end) } : s
      ),
    }));
  },
  splitSegment: (id, atTime) => {
    get().commit();
    set((state) => {
      const idx = state.segments.findIndex((s) => s.id === id);
      if (idx < 0) return {};
      const seg = state.segments[idx];
      const t = Math.min(Math.max(atTime, seg.start + 0.2), seg.end - 0.2);
      const words = seg.words.length ? seg.words : reWord(seg.text, seg.start, seg.end);
      const firstWords = words.filter((w) => w.end <= t);
      const secondWords = words.filter((w) => w.end > t);
      const a: CaptionSegment = {
        ...seg,
        id: `${seg.id}-a`,
        end: t,
        text: firstWords.map((w) => w.text).join(" ") || seg.text,
        words: firstWords,
      };
      const b: CaptionSegment = {
        ...seg,
        id: `${seg.id}-b-${Date.now()}`,
        start: t,
        text: secondWords.map((w) => w.text).join(" ") || "…",
        words: secondWords,
      };
      const segments = [...state.segments];
      segments.splice(idx, 1, a, b);
      return { segments };
    });
  },
  mergeWithNext: (id) => {
    get().commit();
    set((state) => {
      const idx = state.segments.findIndex((s) => s.id === id);
      if (idx < 0 || idx >= state.segments.length - 1) return {};
      const a = state.segments[idx];
      const b = state.segments[idx + 1];
      const merged: CaptionSegment = {
        ...a,
        end: b.end,
        text: `${a.text} ${b.text}`,
        words: [...a.words, ...b.words],
      };
      const segments = [...state.segments];
      segments.splice(idx, 2, merged);
      return { segments };
    });
  },
  addSegment: () => {
    get().commit();
    set((state) => {
      const t = state.currentTime;
      const seg: CaptionSegment = {
        id: `seg-${Date.now()}`,
        start: +t.toFixed(2),
        end: +Math.min(state.duration, t + 2).toFixed(2),
        text: "New caption",
        words: reWord("New caption", t, Math.min(state.duration, t + 2)),
        language: state.language,
      };
      return { segments: [...state.segments, seg].sort((x, y) => x.start - y.start), selectedSegmentId: seg.id };
    });
  },
  deleteSegment: (id) => {
    get().commit();
    set((state) => ({ segments: state.segments.filter((s) => s.id !== id) }));
  },

  commit: () =>
    set((state) => ({
      past: [...state.past, { segments: structuredClone(state.segments), spec: structuredClone(state.spec) }].slice(-50),
      future: [],
    })),
  undo: () =>
    set((state) => {
      const prev = state.past[state.past.length - 1];
      if (!prev) return {};
      return {
        past: state.past.slice(0, -1),
        future: [{ segments: state.segments, spec: state.spec }, ...state.future],
        segments: prev.segments,
        spec: prev.spec,
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) return {};
      return {
        future: state.future.slice(1),
        past: [...state.past, { segments: state.segments, spec: state.spec }],
        segments: next.segments,
        spec: next.spec,
      };
    }),
}));
