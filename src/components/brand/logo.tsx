import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  showText = true,
}: {
  className?: string;
  href?: string;
  showText?: boolean;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[10px] accent-gradient shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.7)]">
        <span className="flex flex-col gap-[3px]">
          <span className="block h-[3px] w-4 rounded-full bg-white" />
          <span className="block h-[3px] w-3 rounded-full bg-white/80" />
          <span className="block h-[3px] w-2 rounded-full bg-white/60" />
        </span>
      </span>
      {showText && (
        <span className="text-[17px] font-semibold tracking-tight text-foreground">
          Caption<span className="text-primary">Forge</span>
        </span>
      )}
    </Link>
  );
}
