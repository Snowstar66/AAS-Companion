type ResolvePublicSiteUrlInput = {
  requestUrl: string;
  configuredSiteUrl?: string | undefined;
  nodeEnv?: string | undefined;
};

export function resolvePublicSiteUrl({
  requestUrl,
  configuredSiteUrl,
  nodeEnv
}: ResolvePublicSiteUrlInput) {
  const requestOrigin = new URL(requestUrl).origin;
  const candidate = configuredSiteUrl?.trim();

  if (!candidate) {
    return requestOrigin;
  }

  try {
    const configuredUrl = new URL(candidate);

    if (nodeEnv === "production" && configuredUrl.hostname === "localhost") {
      return requestOrigin;
    }

    return configuredUrl.toString();
  } catch {
    return requestOrigin;
  }
}

export function resolveAuthCallbackUrl(input: ResolvePublicSiteUrlInput) {
  return new URL("/auth/callback", resolvePublicSiteUrl(input)).toString();
}
