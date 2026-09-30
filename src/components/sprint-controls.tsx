"use client";

import { useEffect } from "react";

function sprints(): HTMLDetailsElement[] {
  return Array.from(document.querySelectorAll<HTMLDetailsElement>("details[data-sprint]"));
}

export function SprintControls() {
  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (target instanceof HTMLDetailsElement) {
        target.open = true;
        target.scrollIntoView();
      }
    };
    const openAll = () => sprints().forEach((d) => (d.open = true));

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    window.addEventListener("beforeprint", openAll);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener("beforeprint", openAll);
    };
  }, []);

  const buttonClass =
    "inline-flex min-h-11 items-center rounded-full border border-white/10 px-4 text-sm text-zinc-200 hover:bg-white/10 hover:text-brand";

  return (
    <div className="mt-6 flex flex-wrap gap-2 print:hidden">
      <button type="button" className={buttonClass} onClick={() => sprints().forEach((d) => (d.open = true))}>
        Alles openen
      </button>
      <button type="button" className={buttonClass} onClick={() => sprints().forEach((d) => (d.open = false))}>
        Alles sluiten
      </button>
    </div>
  );
}
