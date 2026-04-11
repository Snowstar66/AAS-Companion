"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const NAVIGATION_PENDING_ATTRIBUTE = "data-navigation-pending";
const NAVIGATION_PENDING_TIMEOUT_MS = 12000;

function markNavigationPending() {
  document.documentElement.setAttribute(NAVIGATION_PENDING_ATTRIBUTE, "true");
}

function clearNavigationPending() {
  document.documentElement.removeAttribute(NAVIGATION_PENDING_ATTRIBUTE);
}

function isInternalNavigationLink(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");

  if (!href || href.startsWith("#") || anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  const url = new URL(href, window.location.href);

  if (url.origin !== window.location.origin) {
    return false;
  }

  return (
    url.pathname !== window.location.pathname ||
    url.search !== window.location.search ||
    url.hash !== window.location.hash
  );
}

export function NavigationPendingState() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    clearNavigationPending();
  }, [pathname, searchParams]);

  useEffect(() => {
    let clearTimer: number | null = null;

    const scheduleClear = () => {
      if (clearTimer) {
        window.clearTimeout(clearTimer);
      }

      clearTimer = window.setTimeout(() => {
        clearNavigationPending();
        clearTimer = null;
      }, NAVIGATION_PENDING_TIMEOUT_MS);
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement) || !isInternalNavigationLink(anchor)) {
        return;
      }

      markNavigationPending();
      scheduleClear();
    };

    const handleSubmit = (event: SubmitEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLFormElement) || target.target === "_blank") {
        return;
      }

      markNavigationPending();
      scheduleClear();
    };

    window.addEventListener("click", handleClick, true);
    window.addEventListener("submit", handleSubmit, true);

    return () => {
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("submit", handleSubmit, true);

      if (clearTimer) {
        window.clearTimeout(clearTimer);
      }
    };
  }, []);

  return null;
}
