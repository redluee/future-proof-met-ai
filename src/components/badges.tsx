import type { SelfLevel, StoryStatus, TeacherLevel } from "@/types/snapshot";

const LEVEL_STYLES: Record<string, string> = {
  V: "bg-brand/15 text-brand",
  NV: "bg-amber-500/15 text-amber-300",
  O: "bg-red-500/15 text-red-300",
};

const LEVEL_TITLES: Record<string, string> = {
  V: "Voldoende",
  NV: "Niet voldaan",
  O: "Onvoldoende",
};

export function LevelBadge({ level, prefix }: { level: SelfLevel | TeacherLevel; prefix: string }) {
  if (level === "-") {
    return (
      <span className="inline-flex min-h-7 items-center rounded-full bg-white/5 px-3 text-xs text-zinc-400">
        {prefix}: nog niet beoordeeld
      </span>
    );
  }
  return (
    <span
      title={LEVEL_TITLES[level]}
      className={`inline-flex min-h-7 items-center rounded-full px-3 text-xs font-medium ${LEVEL_STYLES[level]}`}
    >
      {prefix}: {level} <span className="sr-only">({LEVEL_TITLES[level]})</span>
    </span>
  );
}

const STATUS_LABELS: Record<StoryStatus, string> = {
  todo: "Te doen",
  in_progress: "Bezig",
  done: "Afgerond",
};

export function StatusBadge({ status }: { status: StoryStatus }) {
  const done = status === "done";
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-3 text-xs ${
        done ? "bg-brand/15 text-brand" : "bg-white/5 text-zinc-300"
      }`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

const TYPE_STYLES: Record<string, string> = {
  US: "bg-emerald-500/15 text-emerald-300",
  RS: "bg-orange-500/15 text-orange-300",
  LS: "bg-purple-500/15 text-purple-300",
};

export function TypeBadge({ code, number }: { code: string; number: string | null }) {
  const key = (code || "US").toUpperCase();
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-3 font-mono text-xs ${
        TYPE_STYLES[key] ?? "bg-white/5 text-zinc-300"
      }`}
    >
      {number || key}
    </span>
  );
}
