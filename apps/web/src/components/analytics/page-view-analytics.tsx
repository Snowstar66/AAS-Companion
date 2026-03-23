"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

let posthogInitialized = false;

type PageViewAnalyticsProps = {
  eventName: string;
  properties?: Record<string, string | number | boolean | null | undefined>;
};

export function PageViewAnalytics({ eventName, properties }: PageViewAnalyticsProps) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!key || !host) {
      return;
    }

    if (!posthogInitialized) {
      posthog.init(key, {
        api_host: host,
        person_profiles: "never"
      });
      posthogInitialized = true;
    }

    posthog.capture(eventName, properties);
  }, [eventName, properties]);

  return null;
}
