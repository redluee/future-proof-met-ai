import { MINOR_LU_LIST, getLULabel } from "@/lib/minor-constants";
import type { SnapshotSprint } from "@/types/snapshot";
import { sprintAnchor } from "./sprint-section";

const SPRINT_COUNT = 10;

export function passedLearningOutcomes(sprint: SnapshotSprint): number[] {
  return MINOR_LU_LIST.filter((lu) =>
    sprint.selfEvaluations.some(
      (s) => s.learningOutcome === lu && s.level === "V",
    ),
  );
}

export function SprintGrid({ sprints }: { sprints: SnapshotSprint[] }) {
  const columns = Array.from(
    { length: Math.max(SPRINT_COUNT, sprints.length) },
    (_, i) => {
      const sprint = sprints.find((s) => Number(s.sprintNumber) === i + 1);
      return {
        number: i + 1,
        sprint,
        passed: sprint ? passedLearningOutcomes(sprint) : [],
      };
    },
  );

  return (
    <section aria-labelledby="lu-overview" className="mb-8 mt-10 sm:mb-10">
      <h2
        id="lu-overview"
        className="font-mono text-xs uppercase tracking-widest text-zinc-400"
      >
        Behaalde leeruitkomsten per sprint
      </h2>
      <div className="mx-auto mt-4 flex w-fit max-w-full justify-center gap-2 [--cell:min(2.75rem,calc((100vw-2rem-3rem-2.25rem)/10))] sm:gap-3">
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <span aria-hidden className="h-6" />
          {MINOR_LU_LIST.map((lu) => (
            <span
              key={lu}
              className="flex h-(--cell) items-center justify-end whitespace-nowrap text-right text-xs text-zinc-300 sm:text-sm"
            >
              <span className="sm:hidden">LU {lu}</span>
              <span className="hidden sm:inline">{getLULabel(lu)}</span>
            </span>
          ))}
        </div>

        <div
          className="grid content-start gap-1 sm:gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, var(--cell))`,
          }}
        >
          {columns.map((c) => (
            <span
              key={c.number}
              className="flex h-6 items-center justify-center font-mono text-[10px] text-zinc-400 sm:text-xs"
            >
              {c.number}
            </span>
          ))}
          {MINOR_LU_LIST.map((lu) =>
            columns.map((c) => {
              const passed = c.passed.includes(lu);
              const label = `Sprint ${c.number}, ${getLULabel(lu)}: ${
                passed
                  ? "behaald"
                  : c.sprint
                    ? "niet behaald"
                    : "nog niet gepubliceerd"
              }`;
              const cell = `block aspect-square w-full rounded-sm sm:rounded-md ${
                passed
                  ? "bg-brand"
                  : c.sprint
                    ? "bg-zinc-800"
                    : "border border-dashed border-white/10"
              }`;
              return c.sprint ? (
                <a
                  key={`${lu}-${c.number}`}
                  href={`#${sprintAnchor(c.sprint)}-lu-${lu}`}
                  data-lu-link
                  aria-label={label}
                  title={label}
                  className={`${cell} hover:ring-2 hover:ring-white/60 focus-visible:ring-2 focus-visible:ring-white`}
                />
              ) : (
                <span
                  key={`${lu}-${c.number}`}
                  role="img"
                  aria-label={label}
                  className={cell}
                />
              );
            }),
          )}
        </div>
      </div>
    </section>
  );
}
