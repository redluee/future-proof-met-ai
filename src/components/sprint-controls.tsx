"use client";

import { useEffect } from "react";

function sprints(): HTMLDetailsElement[] {
  return Array.from(document.querySelectorAll<HTMLDetailsElement>("details[data-sprint]"));
}

/** Opens a sprint when linked via #hash and opens all sprints for printing. Renders nothing. */
export function SprintControls() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reveal = (id: string) => {
      const target = document.getElementById(id);
      if (!target) return false;
      const sprint = target instanceof HTMLDetailsElement ? target : target.closest("details[data-sprint]");
      if (sprint instanceof HTMLDetailsElement) sprint.open = true;
      target.scrollIntoView({ block: target instanceof HTMLDetailsElement ? "start" : "center" });
      if (!(target instanceof HTMLDetailsElement)) {
        clearTimeout(timer);
        document.querySelectorAll(".lu-highlight").forEach((el) => el.classList.remove("lu-highlight"));
        void target.offsetWidth; // restart the animation when the same block is clicked twice
        target.classList.add("lu-highlight");
        timer = setTimeout(() => target.classList.remove("lu-highlight"), 2200);
      }
      return true;
    };
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) reveal(id);
    };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-lu-link]");
      if (!link) return;
      const id = decodeURIComponent(new URL(link.href).hash.slice(1));
      if (!document.getElementById(id)) return;
      event.preventDefault();
      history.replaceState(null, "", `#${id}`);
      reveal(id);
    };
    const openAll = () => sprints().forEach((d) => (d.open = true));

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    document.addEventListener("click", onClick);
    window.addEventListener("beforeprint", openAll);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener("beforeprint", openAll);
    };
  }, []);

  return null;
}
