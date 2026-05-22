"use client";

import { useEffect } from "react";

function findHashTarget(hash: string) {
  if (!hash.startsWith("#")) return null;

  const rawId = hash.slice(1);
  const candidates = [rawId];

  try {
    candidates.unshift(decodeURIComponent(rawId));
  } catch {
    // Keep the raw hash id when the browser gives us a non-decodable fragment.
  }

  for (const candidate of candidates) {
    const target = document.getElementById(candidate);

    if (target) return target;
  }

  return null;
}

function openContainingDetails(target: HTMLElement) {
  const details = target.closest("details");

  if (details instanceof HTMLDetailsElement) {
    details.open = true;
  }
}

function revealHashTarget(hash = window.location.hash) {
  const target = findHashTarget(hash);

  if (!target) return;

  openContainingDetails(target);
  window.requestAnimationFrame(() => {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

export function ControlMirrorAnchorOpener() {
  useEffect(() => {
    const handleHashChange = () => revealHashTarget();
    const handleClick = (event: MouseEvent) => {
      const clicked = event.target instanceof Element ? event.target.closest("a[href^='#']") : null;

      if (clicked instanceof HTMLAnchorElement) {
        window.setTimeout(() => revealHashTarget(clicked.hash), 0);
      }
    };

    revealHashTarget();
    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
