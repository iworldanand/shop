"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { RotateCcw, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import type { RenderSpec, Template, CaptionInAnimation, WordEffect, CaptionPosition, TextAlign, BoxStyle } from "@/lib/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaptionPreview } from "@/components/caption-preview";
import { SAMPLE_SEGMENTS, SAMPLE_DURATION } from "@/lib/data/sample";
import { GOOGLE_FONTS } from "@/lib/data/fonts";

const IN_ANIMATIONS: CaptionInAnimation[] = ["none", "fade", "pop", "bounce", "slide-up", "slide-down", "typewriter", "zoom", "wave", "glitch"];
const WORD_EFFECTS: WordEffect[] = ["none", "color", "scale", "underline", "box", "glow", "karaoke", "bounce"];
const POSITIONS: CaptionPosition[] = ["top", "upper-third", "center", "lower-third", "bottom"];
const ALIGNMENTS: TextAlign[] = ["left", "center", "right"];
const BOX_STYLES: BoxStyle[] = ["none", "solid", "blur", "glass", "gradient", "glow"];

interface Props {
  template: Template | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (name: string, spec: RenderSpec) => void;
  background: string;
}

export function CustomizeDrawer({ template, open, onOpenChange, onSave, background }: Props) {
  const [spec, setSpec] = React.useState<RenderSpec | null>(null);
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (template) {
      setSpec(structuredClone(template.spec));
      setName(`My ${template.name}`);
    }
  }, [template]);

  if (!template || !spec) return null;

  const patch = (updater: (s: RenderSpec) => void) => {
    setSpec((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      updater(next);
      return next;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" /> Customize style
          </SheetTitle>
          <SheetDescription>Override any property, then save it to your styles.</SheetDescription>
        </SheetHeader>

        {/* Live preview */}
        <div className="border-b border-border bg-card/40 p-4">
          <div className="mx-auto w-40 overflow-hidden rounded-2xl border border-border shadow-lg">
            <CaptionPreview spec={spec} segments={SAMPLE_SEGMENTS} duration={SAMPLE_DURATION} aspect="9:16" background={background} />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-5">
            {/* Font */}
            <Section title="Typography">
              <Row label="Font family">
                <Select value={spec.font.family} onValueChange={(v) => patch((s) => (s.font.family = v))}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GOOGLE_FONTS.map((f) => (
                      <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
              <SliderRow label="Size" value={spec.font.size} min={28} max={130} onChange={(v) => patch((s) => (s.font.size = v))} suffix="px" />
              <SliderRow label="Weight" value={spec.font.weight} min={300} max={900} step={100} onChange={(v) => patch((s) => (s.font.weight = v))} />
              <SliderRow label="Letter spacing" value={spec.font.letterSpacing} min={-4} max={10} step={0.5} onChange={(v) => patch((s) => (s.font.letterSpacing = v))} suffix="px" />
              <SliderRow label="Line height" value={spec.font.lineHeight} min={0.85} max={1.6} step={0.05} onChange={(v) => patch((s) => (s.font.lineHeight = v))} />
              <SwitchRow label="Uppercase" checked={spec.font.uppercase} onChange={(v) => patch((s) => (s.font.uppercase = v))} />
            </Section>

            {/* Colors */}
            <Section title="Colors">
              <ColorRow label="Text" value={spec.colors.text} onChange={(v) => patch((s) => (s.colors.text = v))} />
              <ColorRow label="Active word" value={spec.colors.highlight} onChange={(v) => patch((s) => (s.colors.highlight = v))} />
              <ColorRow label="Stroke" value={spec.colors.stroke} onChange={(v) => patch((s) => (s.colors.stroke = v))} />
              <SliderRow label="Stroke width" value={spec.colors.strokeWidth} min={0} max={16} onChange={(v) => patch((s) => (s.colors.strokeWidth = v))} suffix="px" />
            </Section>

            {/* Layout */}
            <Section title="Layout">
              <Row label="Position">
                <SelectMini value={spec.layout.position} options={POSITIONS} onChange={(v) => patch((s) => (s.layout.position = v as CaptionPosition))} />
              </Row>
              <Row label="Alignment">
                <SelectMini value={spec.layout.alignment} options={ALIGNMENTS} onChange={(v) => patch((s) => (s.layout.alignment = v as TextAlign))} />
              </Row>
              <SliderRow label="Max lines" value={spec.layout.maxLines} min={1} max={4} onChange={(v) => patch((s) => (s.layout.maxLines = v))} />
              <SliderRow label="Words / line" value={spec.layout.maxWordsPerLine} min={1} max={8} onChange={(v) => patch((s) => (s.layout.maxWordsPerLine = v))} />
              <SwitchRow label="Safe zone" checked={spec.layout.safeZone} onChange={(v) => patch((s) => (s.layout.safeZone = v))} />
            </Section>

            {/* Animation */}
            <Section title="Animation">
              <Row label="Entrance">
                <SelectMini value={spec.animation.in} options={IN_ANIMATIONS} onChange={(v) => patch((s) => (s.animation.in = v as CaptionInAnimation))} />
              </Row>
              <Row label="Word effect">
                <SelectMini value={spec.animation.wordEffect} options={WORD_EFFECTS} onChange={(v) => patch((s) => (s.animation.wordEffect = v as WordEffect))} />
              </Row>
              <SliderRow label="Duration" value={spec.animation.duration} min={80} max={600} step={10} onChange={(v) => patch((s) => (s.animation.duration = v))} suffix="ms" />
            </Section>

            {/* Effects */}
            <Section title="Effects">
              <Row label="Background box">
                <SelectMini value={spec.effects.boxStyle} options={BOX_STYLES} onChange={(v) => patch((s) => (s.effects.boxStyle = v as BoxStyle))} />
              </Row>
              <SliderRow label="Glow" value={spec.effects.glow} min={0} max={1} step={0.05} onChange={(v) => patch((s) => (s.effects.glow = v))} />
              <SliderRow label="3D depth" value={spec.effects.depth3d} min={0} max={1} step={0.05} onChange={(v) => patch((s) => (s.effects.depth3d = v))} />
              <SwitchRow label="Gradient fill" checked={spec.effects.gradient} onChange={(v) => patch((s) => (s.effects.gradient = v))} />
            </Section>

            {/* AI */}
            <Section title="AI enhancements">
              <SwitchRow label="Auto emphasis" checked={spec.ai.autoEmphasis} onChange={(v) => patch((s) => (s.ai.autoEmphasis = v))} />
              <SwitchRow label="Keyword highlight" checked={spec.ai.keywordHighlight} onChange={(v) => patch((s) => (s.ai.keywordHighlight = v))} />
              <SwitchRow label="Emoji insert" checked={spec.ai.emojiInsert} onChange={(v) => patch((s) => (s.ai.emojiInsert = v))} />
              <SwitchRow label="Scene-aware title" checked={spec.ai.sceneAwareTitle} onChange={(v) => patch((s) => (s.ai.sceneAwareTitle = v))} />
            </Section>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Style name" className="mb-3" />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setSpec(structuredClone(template.spec))}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                onSave(name, spec);
                toast.success("Saved to your styles");
                onOpenChange(false);
              }}
            >
              <Save className="h-4 w-4" /> Save as my style
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SliderRow({ label, value, min, max, step = 1, suffix = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs tabular-nums text-foreground">{value}{suffix}</span>
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
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-lg border border-border bg-transparent"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-24 text-xs" />
      </div>
    </div>
  );
}

function SelectMini({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-36 capitalize"><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="capitalize">{o.replace(/-/g, " ")}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
