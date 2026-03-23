"use client";

import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";

type HomeAnalyticsProps = {
  organizationName: string;
};

export function HomeAnalytics({ organizationName }: HomeAnalyticsProps) {
  return <PageViewAnalytics eventName="home_dashboard_viewed" properties={{ organizationName }} />;
}
