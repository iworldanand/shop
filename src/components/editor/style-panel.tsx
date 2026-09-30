"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { useEditor } from "@/lib/store/editor";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GOOGLE_FONTS } from "@/lib/data/fonts";
import type { AspectRatio, BoxStyle, CaptionInAnimation, CaptionPosition, TextAlign, WordEffect } from "@/lib/types";
import { cn } from "@/lib/utils";

const IN_ANIMATIONS: CaptionInAnimation[] = ["none", "fade", "pop", "bounce", "slide-up", "slide-down", "typewriter", "zoom", "wave", "glitch"];
const WORD_EFFECTS: WordEffect[] = ["none", "color", "scale", "underline", "box", "glow", "karaoke", "bounce"];
const POSITIONS: CaptionPosition[] = ["top", "upper-third", "center", "lower-third", "bottom"];
const BOX_STYLES: BoxStyle[] = ["none", "solid", "blur", "glass", "gradient", "glow"];

const PRESETS: { id: string; label: string; aspect: AspectRatio; sub: string }[] = [
  { id: "reels", label: "Reels", aspect: "9:16", sub: "Instagram" },
  { id: "tiktok", label: "TikTok", aspect: "9:16", sub: "9:16" },
  { id: "shorts", label: "Shorts", aspect: "9:16", sub: "YouTube" },
  { id: "square", label: "Square", aspect: "1:1", sub: "1:1" },
  { id: "wide", label: "Wide", aspect: "16:9", sub: "16:9" },
  { id: "portrait", label: "Portrait", aspect: "4:5", sub: "4:5" },
];

const BACKGROUNDS = ["grad:violet", "grad:amber", "grad:emerald", "grad:pink", "grad:cyan", "grad:indigo"];

export function StylePanel() {
  const { spec, patchSpec, aspect, setAspect, background, init } = useEditor();
  const [fontQuery, setFontQuery] = React.useState("");
  const fonts = GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(fontQuery.toLowerCase()));

  return (
    <div className="scrollbar-thin flex h-full flex-col gap-6 overflow-y-auto p-4">
      {/* Platform presets */}
      <Section title="Platform preset">
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setAspect(p.aspect)}
              className={cn(
                "rounded-xl border p-2 text-center transition-colors",
                aspect === p.aspect ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
              )}
            >
              <p className="text-xs font-semibold">{p.label}</p>
              <p className="text-[10px] text-muted-foreground">{p.sub}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Background (preview) */}
      <Section title="Preview background">
        <div className="flex flex-wrap gap-2">
          {BACKGROUNDS.map((b) => (
            <button
              key={b}
              onClick={() => init({ background: b })}
              className={cn(
                "h-8 w-8 rounded-lg border-2 bg-gradient-to-br",
                background === b ? "border-primary" : "border-transparent",
                b === "grad:violet" && "from-violet-500 to-indigo-600",
                b === "grad:amber" && "from-amber-400 to-rose-500",
                b === "grad:emerald" && "from-emerald-400 to-cyan-600",
                b === "grad:pink" && "from-pink-500 to-purple-600",
                b === "grad:cyan" && "from-cyan-400 to-blue-600",
                b === "grad:indigo" && "from-indigo-500 to-violet-600"
              )}
            />
          ))}
        </div>
      </Section>

      {/* Typography with font search */}
      <Section title="Font">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={fontQuery} onChange={(e) => setFontQuery(e.target.value)} placeholder="Search 100+ fonts…" className="h-8 pl-8 text-xs" />
        </div>
        <div className="scrollbar-thin max-h-40 space-y-0.5 overflow-y-auto rounded-lg border border-border p-1">
          {fonts.slice(0, 40).map((f) => (
            <button
              key={f}
              onClick={() => patchSpec((s) => (s.font.family = f))}
              className={cn(
                "block w-full truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                spec.font.family === f ? "bg-primary/10 text-primary" : "hover:bg-secondary"
              )}
              style={{ fontFamily: f }}
            >
              {f}
            </button>
          ))}
        </div>
        <SliderRow label="Size" value={spec.font.size} min={28} max={130} suffix="px" onChange={(v) => patchSpec((s) => (s.font.size = v))} />
        <SliderRow label="Weight" value={spec.font.weight} min={300} max={900} step={100} onChange={(v) => patchSpec((s) => (s.font.weight = v))} />
        <SliderRow label="Letter spacing" value={spec.font.letterSpacing} min={-4} max={12} step={0.5} suffix="px" onChange={(v) => patchSpec((s) => (s.font.letterSpacing = v))} />
        <SwitchRow label="Uppercase" checked={spec.font.uppercase} onChange={(v) => patchSpec((s) => (s.font.uppercase = v))} />
      </Section>

      <Section title="Colors">
        <ColorRow label="Text" value={spec.colors.text} onChange={(v) => patchSpec((s) => (s.colors.text = v))} />
        <ColorRow label="Active word" value={spec.colors.highlight} onChange={(v) => patchSpec((s) => (s.colors.highlight = v))} />
        <ColorRow label="Stroke" value={spec.colors.stroke} onChange={(v) => patchSpec((s) => (s.colors.stroke = v))} />
        <SliderRow label="Stroke width" value={spec.colors.strokeWidth} min={0} max={16} suffix="px" onChange={(v) => patchSpec((s) => (s.colors.strokeWidth = v))} />
      </Section>

      <Section title="Layout">
        <SelectRow label="Position" value={spec.layout.position} options={POSITIONS} onChange={(v) => patchSpec((s) => (s.layout.position = v as CaptionPosition))} />
        <SelectRow label="Alignment" value={spec.layout.alignment} options={["left", "center", "right"] as TextAlign[]} onChange={(v) => patchSpec((s) => (s.layout.alignment = v as TextAlign))} />
        <SliderRow label="Max lines" value={spec.layout.maxLines} min={1} max={4} onChange={(v) => patchSpec((s) => (s.layout.maxLines = v))} />
        <SliderRow label="Words / line" value={spec.layout.maxWordsPerLine} min={1} max={8} onChange={(v) => patchSpec((s) => (s.layout.maxWordsPerLine = v))} />
      </Section>

      <Section title="Animation">
        <SelectRow label="Entrance" value={spec.animation.in} options={IN_ANIMATIONS} onChange={(v) => patchSpec((s) => (s.animation.in = v as CaptionInAnimation))} />
        <SelectRow label="Word effect" value={spec.animation.wordEffect} options={WORD_EFFECTS} onChange={(v) => patchSpec((s) => (s.animation.wordEffect = v as WordEffect))} />
      </Section>

      <Section title="Effects">
        <SelectRow label="Background box" value={spec.effects.boxStyle} options={BOX_STYLES} onChange={(v) => patchSpec((s) => (s.effects.boxStyle = v as BoxStyle))} />
        <SliderRow label="Glow" value={spec.effects.glow} min={0} max={1} step={0.05} onChange={(v) => patchSpec((s) => (s.effects.glow = v))} />
        <SliderRow label="3D depth" value={spec.effects.depth3d} min={0} max={1} step={0.05} onChange={(v) => patchSpec((s) => (s.effects.depth3d = v))} />
        <SwitchRow label="Gradient fill" checked={spec.effects.gradient} onChange={(v) => patchSpec((s) => (s.effects.gradient = v))} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function SliderRow({ label, value, min, max, step = 1, suffix = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs tabular-nums">{value}{suffix}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}
function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = value.startsWith("#") ? value : "#ffffff";
  return (
    <div className="flex items-center justify-between gap-3">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} className="h-8 w-8 cursor-pointer rounded-lg border border-border bg-transparent" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-24 text-xs" />
      </div>
    </div>
  );
}
function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-36 capitalize"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o} className="capitalize">{o.replace(/-/g, " ")}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
