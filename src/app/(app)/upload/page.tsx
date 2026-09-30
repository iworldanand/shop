"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadCloud, FileVideo, Loader2, CheckCircle2, X, Sparkles, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatDuration } from "@/lib/utils";
import type { AspectRatio } from "@/lib/types";

type Stage = "idle" | "uploading" | "transcribing" | "done";

const MAX_BYTES = 500 * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = React.useState(false);
  const [stage, setStage] = React.useState<Stage>("idle");
  const [progress, setProgress] = React.useState(0);
  const [file, setFile] = React.useState<{ name: string; size: number; duration: number; aspect: AspectRatio } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const detectMeta = (f: File) =>
    new Promise<{ duration: number; aspect: AspectRatio }>((resolve) => {
      try {
        const url = URL.createObjectURL(f);
        const v = document.createElement("video");
        v.preload = "metadata";
        v.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          const ratio = v.videoWidth / v.videoHeight;
          let aspect: AspectRatio = "16:9";
          if (ratio < 0.7) aspect = "9:16";
          else if (ratio >= 0.7 && ratio < 0.95) aspect = "4:5";
          else if (ratio >= 0.95 && ratio < 1.2) aspect = "1:1";
          resolve({ duration: v.duration || 30, aspect });
        };
        v.onerror = () => resolve({ duration: 30, aspect: "9:16" });
        v.src = url;
      } catch {
        resolve({ duration: 30, aspect: "9:16" });
      }
    });

  async function handleFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/")) return toast.error("Please choose a video file");
    if (f.size > MAX_BYTES) return toast.error("File exceeds the 500MB limit");

    const meta = await detectMeta(f);
    setFile({ name: f.name, size: f.size, duration: meta.duration, aspect: meta.aspect });
    setStage("uploading");
    setProgress(0);

    // Simulated Cloudinary upload progress. In production this streams to the
    // signed Cloudinary endpoint returned by /api/cloudinary/sign.
    const upTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(upTimer);
          setStage("transcribing");
          // Simulated Whisper transcription window.
          setTimeout(() => setStage("done"), 2200);
          return 100;
        }
        return Math.min(100, p + Math.random() * 14);
      });
    }, 260);
  }

  function reset() {
    setStage("idle");
    setProgress(0);
    setFile(null);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight">Upload a video</h1>
        <p className="mt-2 text-muted-foreground">
          We’ll extract audio, run Whisper for word-level captions, then take you to the style picker.
        </p>
      </motion.div>

      {stage === "idle" && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "mt-8 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed py-20 text-center transition-all",
              dragOver ? "scale-[1.01] border-primary bg-primary/[0.05]" : "border-border hover:border-primary/50 hover:bg-card/40"
            )}
          >
            <motion.span
              animate={{ y: dragOver ? -6 : 0 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl accent-gradient text-white shadow-xl"
            >
              <UploadCloud className="h-7 w-7" />
            </motion.span>
            <div>
              <p className="text-lg font-medium">Drag & drop your video</p>
              <p className="text-sm text-muted-foreground">or click to browse · MP4, MOV, WebM up to 500MB</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {["9:16", "1:1", "16:9", "4:5"].map((r) => (
                <Badge key={r} variant="secondary">{r}</Badge>
              ))}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="relative flex-1">
              <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="…or paste a video URL" className="pl-9" />
            </div>
            <Button variant="outline" onClick={() => toast.info("Paste a URL to import (demo)")}>
              Import
            </Button>
          </div>
        </>
      )}

      {stage !== "idle" && file && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
              <FileVideo className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium">{file.name}</p>
                {stage !== "done" && (
                  <button onClick={reset} className="rounded-lg p-1 text-muted-foreground hover:bg-secondary">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(1)} MB · {formatDuration(file.duration)} · {file.aspect}
              </p>

              <div className="mt-4 space-y-3">
                <StageRow
                  active={stage === "uploading"}
                  done={stage === "transcribing" || stage === "done"}
                  label={stage === "uploading" ? `Uploading to Cloudinary… ${Math.round(progress)}%` : "Uploaded to Cloudinary"}
                />
                {stage === "uploading" && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full accent-gradient transition-all" style={{ width: `${progress}%` }} />
                  </div>
                )}
                <StageRow
                  active={stage === "transcribing"}
                  done={stage === "done"}
                  label="Transcribing with Whisper (word-level timestamps)"
                />
                <StageRow active={false} done={stage === "done"} label="Auto-detected language & segmented captions" />
              </div>
            </div>
          </div>

          {stage === "done" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" onClick={() => router.push("/styles?project=new")}>
                <Sparkles className="h-4 w-4" /> Pick a style
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => router.push("/editor/new")}>
                Skip to editor
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function StageRow({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : active ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <span className="h-4 w-4 rounded-full border border-border" />
      )}
      <span className={cn(done || active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
    </div>
  );
}
