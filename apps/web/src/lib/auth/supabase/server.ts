import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { getSupabaseBrowserConfig } from "@/lib/auth/supabase/shared";

type CookieAdapter = {
  getAll: () => { name: string; value: string }[];
  setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => void;
};

function getServerCookieAdapter(): Promise<CookieAdapter> {
  return cookies().then((cookieStore) => ({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      try {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      } catch {
        // Server components can read with this client even when cookie mutation is not allowed.
      }
    }
  }));
}

export async function createServerSupabaseClient() {
  const config = getSupabaseBrowserConfig();

  if (!config) {
    return null;
  }

  return createServerClient(config.url!, config.anonKey!, {
    cookies: await getServerCookieAdapter()
  });
}

export function createRouteHandlerSupabaseClient(request: NextRequest, response: NextResponse) {
  const config = getSupabaseBrowserConfig();

  if (!config) {
    return null;
  }

  return createServerClient(config.url!, config.anonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });
}
