import { cookies } from "next/headers";
import { LOCAL_SESSION_COOKIE_NAME } from "@aas-companion/domain";

const oneWeekInSeconds = 60 * 60 * 24 * 7;

export async function hasLocalSession() {
  const cookieStore = await cookies();

  return Boolean(cookieStore.get(LOCAL_SESSION_COOKIE_NAME)?.value);
}

export async function getLocalSessionUserId() {
  const cookieStore = await cookies();

  return cookieStore.get(LOCAL_SESSION_COOKIE_NAME)?.value ?? null;
}

export async function createLocalSession(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set(LOCAL_SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: oneWeekInSeconds
  });
}

export async function clearLocalSession() {
  const cookieStore = await cookies();

  cookieStore.delete(LOCAL_SESSION_COOKIE_NAME);
}
