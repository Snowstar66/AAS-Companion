"use client";

import { useEffect } from "react";
let posthogInitialized = false;
let posthogPromise: Promise<typeof import("posthog-js")> | null = null;

type PageViewAnalyticsProps = {
  eventName: string;
  properties?: Record<string, string | number | boolean | null | undefined>;
};

export function PageViewAnalytics({ eventName, properties }: PageViewAnalyticsProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!key || !host) {
      return;
    }

    posthogPromise ??= import("posthog-js");

    void posthogPromise.then(({ default: posthog }) => {
      if (!posthogInitialized) {
        posthog.init(key, {
          api_host: host,
          person_profiles: "never"
        });
        posthogInitialized = true;
      }

      posthog.capture(eventName, properties);
    });
  }, [eventName, properties]);

  return null;
}
