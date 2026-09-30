import { getLULabel } from "@/lib/minor-constants";
import type { SnapshotSprint } from "@/types/snapshot";
import { LevelBadge } from "./badges";
import { StoryCard } from "./story-card";

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

export function sprintAnchor(sprint: SnapshotSprint): string {
  return `sprint-${sprint.sprintNumber.replace(/[^a-z0-9]+/gi, "-")}`;
}

export function SprintSection({ sprint }: { sprint: SnapshotSprint }) {
  const lus = [1, 2, 3, 4, 5].filter((lu) => {
    const self = sprint.selfEvaluations.find((s) => s.learningOutcome === lu);
    return (self && self.level !== "-") || sprint.stories.some((s) => s.learningOutcomes.includes(lu));
  });
  const hasReflection =
    sprint.reflection && (sprint.reflection.whatLearned || sprint.reflection.whatRetained || sprint.reflection.whatChange);

  return (
    <section id={sprintAnchor(sprint)} className="scroll-mt-28 border-t border-white/10 py-10 sm:py-14">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-brand">Sprint {sprint.sprintNumber}</p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{sprint.name}</h2>
        <p className="mt-2 text-sm text-zinc-400">
          {formatDate(sprint.startDate)} t/m {formatDate(sprint.endDate)}
          {sprint.showAndGrowDate && <> · Show &amp; Grow {formatDate(sprint.showAndGrowDate)}</>}
          {sprint.extendedDays > 0 && sprint.extensionReason && (
            <> · verlengd met {sprint.extendedDays} dagen ({sprint.extensionReason})</>
          )}
        </p>
      </header>

      {lus.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">Leeruitkomsten</h3>
          <ul className="mt-2 divide-y divide-white/10">
            {lus.map((lu) => {
              const self = sprint.selfEvaluations.find((s) => s.learningOutcome === lu);
              const teacher = sprint.teacherAssessments.find((t) => t.learningOutcome === lu);
              const linked = sprint.stories.filter((s) => s.learningOutcomes.includes(lu));
              return (
                <li key={lu} className="py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-2 text-base font-medium">{getLULabel(lu)}</span>
                    {self && <LevelBadge level={self.level} prefix="Zelf" />}
                    {teacher && teacher.assessment !== "-" && <LevelBadge level={teacher.assessment} prefix="Docent" />}
                  </div>
                  {self?.argumentation && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-300">{self.argumentation}</p>
                  )}
                  {teacher?.notes && teacher.assessment !== "-" && (
                    <p className="mt-2 text-sm text-zinc-400">Docent: {teacher.notes}</p>
                  )}
                  {linked.length > 0 && (
                    <p className="mt-2 text-xs text-zinc-400">
                      Onderbouwd met: {linked.map((s) => s.storyNumber || s.title).join(", ")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {sprint.stories.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            Uitgevoerde stories ({sprint.stories.length})
          </h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            {sprint.stories.map((story, i) => (
              <StoryCard key={`${story.storyNumber}-${i}`} story={story} />
            ))}
          </div>
        </div>
      )}

      {(hasReflection || sprint.feedback.length > 0) && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {hasReflection && sprint.reflection && (
            <details className="border-t border-white/10 py-3">
              <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm text-zinc-200">Reflectie</summary>
              <dl className="mt-2 space-y-3 text-sm">
                {[
                  ["Wat heb ik geleerd", sprint.reflection.whatLearned],
                  ["Wat neem ik mee", sprint.reflection.whatRetained],
                  ["Wat ga ik anders doen", sprint.reflection.whatChange],
                ].map(([label, value]) =>
                  value ? (
                    <div key={label}>
                      <dt className="text-zinc-400">{label}</dt>
                      <dd className="mt-1 whitespace-pre-line text-zinc-200">{value}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </details>
          )}
          {sprint.feedback.length > 0 && (
            <details className="border-t border-white/10 py-3">
              <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm text-zinc-200">
                Ontvangen feedback ({sprint.feedback.length})
              </summary>
              <ul className="mt-2 space-y-3 text-sm">
                {sprint.feedback.map((f, i) => (
                  <li key={i}>
                    <p className="text-xs text-zinc-400">{formatDate(f.date)}</p>
                    <p className="text-zinc-200">{f.feedback}</p>
                    {f.action && <p className="text-zinc-400">Actie: {f.action}</p>}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
