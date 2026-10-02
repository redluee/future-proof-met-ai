"use client";

import { useEffect } from "react";

function sprints(): HTMLDetailsElement[] {
  return Array.from(document.querySelectorAll<HTMLDetailsElement>("details[data-sprint]"));
}

/** Opens a sprint when linked via #hash and opens all sprints for printing. Renders nothing. */
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

  return null;
}
