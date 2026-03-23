"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

let posthogInitialized = false;

type HomeAnalyticsProps = {
  organizationName: string;
};

export function HomeAnalytics({ organizationName }: HomeAnalyticsProps) {
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

    posthog.capture("home_dashboard_viewed", {
      organizationName
    });
  }, [organizationName]);

  return null;
}
