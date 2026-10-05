import Image from "next/image";
import {
  SprintSection,
  formatDate,
  formatDateTime,
} from "@/components/sprint-section";
import { SprintGrid } from "@/components/sprint-grid";
import { SprintControls } from "@/components/sprint-controls";
import { loadSnapshot } from "@/lib/snapshot";

export const dynamic = "force-static";

export default function Home() {
  const snapshot = loadSnapshot();
  const { sprints } = snapshot;
  const period =
    sprints.length > 0
      ? `${formatDate(sprints[0].startDate)} t/m ${formatDate(sprints[sprints.length - 1].endDate)}`
      : null;

  return (
    <>
      <header className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 sm:pt-16">
        <div className="flex items-stretch justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brand">
              HBO-ICT Minor · Future-proof met AI
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
              Steven Heijn
            </h1>
            <p className="mt-3 max-w-2xl text-base text-zinc-300">
              Per sprint de behaalde leeruitkomsten, onderbouwd met
              uitgevoerde stories, acceptatie- en kwaliteitscriteria en
              bewijsmateriaal.
            </p>
            {period && <p className="mt-2 text-sm text-zinc-400">{period}</p>}
            <p className="mt-4 inline-flex min-h-7 items-center gap-2 rounded-full bg-white/5 px-3 font-mono text-xs text-zinc-300">
              <span aria-hidden className="size-1.5 rounded-full bg-brand" />
              Laatst bijgewerkt:{" "}
              {snapshot.contentHash ? (
                <time dateTime={snapshot.generatedAt}>
                  {formatDateTime(snapshot.generatedAt)}
                </time>
              ) : (
                "nog niet gesynchroniseerd"
              )}
            </p>
          </div>
          <Image
            src="/profile.jpg"
            alt="Steven Heijn"
            width={400}
            height={400}
            priority
            className="size-24 shrink-0 self-start rounded-[28%] object-cover sm:size-40"
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <SprintGrid sprints={sprints} />

        {sprints.length > 0 && <SprintControls />}

        {sprints.length === 0 ? (
          <p className="mt-16 text-center text-zinc-400">
            Er zijn nog geen sprints gepubliceerd.
          </p>
        ) : (
          sprints.map((sprint) => (
            <SprintSection key={sprint.sprintNumber} sprint={sprint} />
          ))
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
      </main>
    </>
  );
}
