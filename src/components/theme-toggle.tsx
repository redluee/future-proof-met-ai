"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "theme";
const WAVE_MS = 800;
const WAVE_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

/**
 * Every click starts its own wave: a clone of the page in the target theme,
 * revealed by a circle that grows from the button. Waves stack, so spamming the
 * button keeps every earlier wave running while a new one (the opposite theme)
 * starts on top. When a wave has covered the viewport the real page switches
 * theme and the wave, plus every older one underneath it, is removed.
 */
type Wave = { theme: Theme; overlay: HTMLElement; page: HTMLElement; animation: Animation };
const waves: Wave[] = [];

const root = () => document.documentElement;

function currentTheme(): Theme {
  return root().dataset.themeTarget === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-theme-target"] });
  return () => observer.disconnect();
}

function applyTheme(theme: Theme) {
  root().classList.toggle("light", theme === "light");
  root().classList.toggle("dark", theme === "dark");
}

function syncScroll() {
  for (const wave of waves) wave.page.style.transform = `translate3d(0, ${-window.scrollY}px, 0)`;
}

function clearWaves(upTo = waves.length) {
  for (const wave of waves.splice(0, upTo)) {
    wave.animation.cancel();
    wave.overlay.remove();
  }
  if (waves.length === 0) window.removeEventListener("scroll", syncScroll);
}

function settle(wave: Wave) {
  const index = waves.indexOf(wave);
  if (index === -1) return;
  applyTheme(wave.theme);
  clearWaves(index + 1);
}

function startWave(theme: Theme, x: number, y: number) {
  const source = document.getElementById("page");
  if (!source) {
    applyTheme(theme);
    return;
  }

  const page = source.cloneNode(true) as HTMLElement;
  page.removeAttribute("id");
  page.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
  page.classList.add("theme-wave-page");

  const overlay = document.createElement("div");
  overlay.className = `theme-wave ${theme}`;
  overlay.setAttribute("aria-hidden", "true");
  overlay.inert = true;
  overlay.append(page);
  document.body.append(overlay);

  const radius = Math.hypot(
    Math.max(x, overlay.clientWidth - x),
    Math.max(y, Math.max(overlay.clientHeight, window.innerHeight) - y),
  );
  const animation = overlay.animate(
    {
      clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
    },
    { duration: WAVE_MS, easing: WAVE_EASING, fill: "both" },
  );

  const wave: Wave = { theme, overlay, page, animation };
  if (waves.length === 0) window.addEventListener("scroll", syncScroll, { passive: true });
  waves.push(wave);
  syncScroll();
  animation.finished.then(
    () => settle(wave),
    () => {}, // cancelled by a newer wave settling
  );
}

function toggleTheme(button: HTMLButtonElement) {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  root().dataset.themeTarget = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {}

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    clearWaves();
    applyTheme(next);
    return;
  }

  const rect = button.getBoundingClientRect();
  startWave(next, rect.left + rect.width / 2, rect.top + rect.height / 2);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "dark" as Theme);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Donkere modus"
      className="theme-toggle"
      onClick={(event) => toggleTheme(event.currentTarget)}
    >
      <Sun aria-hidden className="theme-toggle-icon theme-toggle-sun size-5" />
      <Moon aria-hidden className="theme-toggle-icon theme-toggle-moon size-5" />
    </button>
  );
}
