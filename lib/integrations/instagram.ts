const IG_GRAPH = "https://graph.instagram.com";

export function getInstagramRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  return `${base}/api/integrations/instagram/callback`;
}

export function buildInstagramOAuthUrl(state: string): string {
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", process.env.INSTAGRAM_APP_ID!);
  url.searchParams.set("redirect_uri", getInstagramRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set(
    "scope",
    [
      "instagram_business_basic",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
      "instagram_business_content_publish",
      "instagram_business_manage_insights",
    ].join(",")
  );
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForShortLivedToken(
  code: string
): Promise<{ access_token: string; user_id: number }> {
  const body = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    grant_type: "authorization_code",
    redirect_uri: getInstagramRedirectUri(),
    code,
  });

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error(`Short-lived token exchange failed: ${await res.text()}`);
  }
  return res.json();
}

export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  const url = new URL(`${IG_GRAPH}/access_token`);
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", process.env.INSTAGRAM_APP_SECRET!);
  url.searchParams.set("access_token", shortLivedToken);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Long-lived token exchange failed: ${await res.text()}`);
  }
  return res.json();
}

export async function getInstagramUser(
  accessToken: string
): Promise<{ id: string; username: string; account_type?: string }> {
  const url = new URL(`${IG_GRAPH}/me`);
  url.searchParams.set("fields", "id,username,account_type");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to fetch Instagram user: ${await res.text()}`);
  }
  return res.json();
}

export async function refreshLongLivedToken(
  longLivedToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const url = new URL(`${IG_GRAPH}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", longLivedToken);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Token refresh failed: ${await res.text()}`);
  }
  return res.json();
}
