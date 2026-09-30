import { SprintSection, formatDate, sprintAnchor } from "@/components/sprint-section";
import { LevelBadge } from "@/components/badges";
import { SprintControls } from "@/components/sprint-controls";
import { MINOR_LU_LIST, getLULabel } from "@/lib/minor-constants";
import { loadSnapshot } from "@/lib/snapshot";
import type { Snapshot } from "@/types/snapshot";

export const dynamic = "force-static";

function luSummary(snapshot: Snapshot, lu: number) {
  let passed = 0;
  let latestSelf: "V" | "NV" | "-" = "-";
  let latestTeacher: "V" | "O" | "-" = "-";
  for (const sprint of snapshot.sprints) {
    const self = sprint.selfEvaluations.find((s) => s.learningOutcome === lu);
    const teacher = sprint.teacherAssessments.find((t) => t.learningOutcome === lu);
    if (self && self.level !== "-") latestSelf = self.level;
    if (teacher && teacher.assessment !== "-") latestTeacher = teacher.assessment;
    if (self?.level === "V") passed += 1;
  }
  return { passed, latestSelf, latestTeacher };
}

export default function Home() {
  const snapshot = loadSnapshot();
  const { sprints } = snapshot;
  const period =
    sprints.length > 0 ? `${formatDate(sprints[0].startDate)} t/m ${formatDate(sprints[sprints.length - 1].endDate)}` : null;

  return (
    <>
      <header className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 sm:pt-16">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">HBO-ICT Minor · Future-proof met AI</p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">Steven Heijn</h1>
        <p className="mt-3 max-w-2xl text-base text-zinc-300">
          Per sprint de behaalde leeruitkomsten, onderbouwd met uitgevoerde stories, acceptatie- en kwaliteitscriteria en
          bewijsmateriaal.
        </p>
        {period && <p className="mt-2 text-sm text-zinc-400">{period}</p>}
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <section aria-labelledby="lu-overview" className="mt-10">
          <h2 id="lu-overview" className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            Leeruitkomsten in één oogopslag
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MINOR_LU_LIST.map((lu) => {
              const s = luSummary(snapshot, lu);
              return (
                <li key={lu} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
                  <p className="text-base font-medium">{getLULabel(lu)}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {s.passed === 0 ? "Nog geen sprint behaald" : `${s.passed} ${s.passed === 1 ? "sprint" : "sprints"} behaald`}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <LevelBadge level={s.latestSelf} prefix="Zelf" />
                    {s.latestTeacher !== "-" && <LevelBadge level={s.latestTeacher} prefix="Docent" />}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {sprints.length > 0 && (
          <nav
            aria-label="Sprints"
            className="sticky top-0 z-10 -mx-4 mt-10 overflow-x-auto border-b border-white/10 bg-black/90 px-4 backdrop-blur sm:-mx-6 sm:px-6 print:hidden"
          >
            <ul className="flex gap-2 py-2">
              {sprints.map((sprint) => (
                <li key={sprint.sprintNumber}>
                  <a
                    href={`#${sprintAnchor(sprint)}`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm text-zinc-200 hover:bg-white/10 hover:text-brand"
                  >
                    Sprint {sprint.sprintNumber}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {sprints.length > 0 && <SprintControls />}

        {sprints.length === 0 ? (
          <p className="mt-16 text-center text-zinc-400">Er zijn nog geen sprints gepubliceerd.</p>
        ) : (
          sprints.map((sprint) => <SprintSection key={sprint.sprintNumber} sprint={sprint} />)
        )}

        {snapshot.peerHelp.length > 0 && (
          <section className="border-t border-white/10 py-10 sm:py-14">
            <h2 className="text-2xl font-semibold">Kennisdeling</h2>
            <ul className="mt-4 divide-y divide-white/10">
              {snapshot.peerHelp.map((p, i) => (
                <li key={i} className="py-3 text-sm">
                  <p className="text-xs text-zinc-400">
                    {formatDate(p.date)}
                    {p.sprintNumber && ` · Sprint ${p.sprintNumber}`}
                  </p>
                  <p className="mt-1 text-zinc-200">{p.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="border-t border-white/10 pt-6 text-xs text-zinc-500">
          Laatst bijgewerkt: {snapshot.contentHash ? formatDate(snapshot.generatedAt) : "nog niet gesynchroniseerd"}
        </footer>
      </main>
    </>
  );
}
