import { getDomainFromUrl, isImageUrl } from "@/lib/minor-constants";
import type { SnapshotCriterion, SnapshotStory } from "@/types/snapshot";
import { StatusBadge, TypeBadge } from "./badges";

interface EvidenceItem {
  title: string;
  url: string;
  kind: string;
}

function collectEvidence(story: SnapshotStory): EvidenceItem[] {
  const items: EvidenceItem[] = story.evidence.map((e) => ({ title: e.title, url: e.url, kind: e.type }));
  const p = story.presentationData;
  if (p) {
    if (p.demoUrl) items.push({ title: p.demoTitle || "Demo", url: p.demoUrl, kind: "app" });
    for (const l of [...(p.links ?? []), ...(p.websites ?? [])]) {
      items.push({ title: l.title || l.name || getDomainFromUrl(l.url), url: l.url, kind: "link" });
    }
    for (const d of p.documents ?? []) items.push({ title: d.title, url: d.url, kind: "document" });
  }
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.url) ? false : (seen.add(i.url), true)));
}

function CriteriaList({ title, items }: { title: string; items: SnapshotCriterion[] }) {
  if (items.length === 0) return null;
  const done = items.filter((c) => c.isCompleted).length;
  return (
    <details className="group border-t border-white/10 py-3">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm text-zinc-200">
        <span>{title}</span>
        <span className="font-mono text-xs text-zinc-400">
          {done}/{items.length}
        </span>
      </summary>
      <ul className="mt-2 space-y-2">
        {items.map((c, i) => (
          <li key={i} className={`flex gap-2 text-sm ${c.indent ? "ml-6" : ""}`}>
            <span aria-hidden className={c.isCompleted ? "text-brand" : "text-zinc-500"}>
              {c.isCompleted ? "✓" : "○"}
            </span>
            <span className={c.isCompleted ? "text-zinc-200" : "text-zinc-400"}>
              {c.text}
              <span className="sr-only">{c.isCompleted ? " (voldaan)" : " (niet voldaan)"}</span>
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function StoryCard({ story }: { story: SnapshotStory }) {
  const evidence = collectEvidence(story);
  const images = [
    ...(story.presentationData?.images ?? []),
    ...evidence.filter((e) => isImageUrl(e.url)).map((e) => ({ url: e.url, caption: e.title })),
  ].filter((img, i, all) => all.findIndex((x) => x.url === img.url) === i);
  const links = evidence.filter((e) => !isImageUrl(e.url));

  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge code={story.storyTypeCode} number={story.storyNumber} />
        <StatusBadge status={story.status} />
        {story.learningOutcomes.map((lu) => (
          <span key={lu} className="inline-flex min-h-7 items-center rounded-full bg-white/5 px-3 text-xs text-zinc-300">
            LU {lu}
          </span>
        ))}
      </div>
      <h4 className="mt-3 text-base font-semibold text-white">{story.title}</h4>
      {(story.asA || story.iWant || story.soThat) && (
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          {story.asA && (
            <>
              Als <strong className="font-medium text-white">{story.asA}</strong>{" "}
            </>
          )}
          {story.iWant && (
            <>
              wil ik <strong className="font-medium text-white">{story.iWant}</strong>{" "}
            </>
          )}
          {story.soThat && (
            <>
              zodat <strong className="font-medium text-white">{story.soThat}</strong>
            </>
          )}
        </p>
      )}
      {story.presentationData?.summary && (
        <p className="mt-2 text-sm text-zinc-400">{story.presentationData.summary}</p>
      )}

      <div className="mt-4">
        <CriteriaList title="Acceptatiecriteria" items={story.acceptanceCriteria} />
        <CriteriaList title="Kwaliteitscriteria" items={story.qualityCriteria} />
        {(links.length > 0 || images.length > 0) && (
          <details className="group border-t border-white/10 py-3" open={false}>
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm text-zinc-200">
              <span>Bewijsmateriaal</span>
              <span className="font-mono text-xs text-zinc-400">{links.length + images.length}</span>
            </summary>
            {links.length > 0 && (
              <ul className="mt-2 space-y-1">
                {links.map((e) => (
                  <li key={e.url}>
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-11 items-center gap-2 text-sm text-brand underline-offset-4 hover:underline"
                    >
                      <span className="font-mono text-xs text-zinc-400">{e.kind}</span>
                      <span className="break-words">{e.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {images.length > 0 && (
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((img) => (
                  <li key={img.url}>
                    <a href={img.url} target="_blank" rel="noopener noreferrer" className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.caption || story.title}
                        loading="lazy"
                        className="aspect-video w-full rounded-lg object-cover"
                      />
                    </a>
                    {img.caption && <p className="mt-1 text-xs text-zinc-400">{img.caption}</p>}
                  </li>
                ))}
              </ul>
            )}
          </details>
        )}
      </div>
    </article>
  );
}
