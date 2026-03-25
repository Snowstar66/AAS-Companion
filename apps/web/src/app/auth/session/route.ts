import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getAppSession();

  return NextResponse.json(
    {
      authenticated: Boolean(session),
      user: session
        ? {
            displayName: session.displayName,
            email: session.email,
            mode: session.mode
          }
        : null
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
