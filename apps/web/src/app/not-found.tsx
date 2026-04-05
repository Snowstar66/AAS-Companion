import Link from "next/link";
import { cookies } from "next/headers";

type AppLanguage = "en" | "sv";

function t(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

async function getServerLanguage(): Promise<AppLanguage> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

export default async function NotFoundPage() {
  const language = await getServerLanguage();
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-xl rounded-[28px] border border-border/70 bg-background/95 p-8 shadow-[0_18px_65px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{t(language, "Error 404", "Fel 404")}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{t(language, "That page does not exist", "Den sidan finns inte")}</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {t(language, "The link may be outdated, or the page may belong to a different project context.", "Lanken kan vara foraldrad, eller sidan kan tillhora en annan projektkontext.")}
        </p>
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t(language, "Return to Home and reopen the active project from there.", "Gå tillbaka till Home och oppna sedan det aktiva projektet darifran.")}
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          href="/"
        >
          {t(language, "Back to Home", "Tillbaka till Home")}
        </Link>
      </section>
    </main>
  );
}
