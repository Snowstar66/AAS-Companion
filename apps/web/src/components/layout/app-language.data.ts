"use client";

export type AppLanguage = "en" | "sv";

type NavigationCopy = {
  label: string;
  description: string;
};

type AppChromeContent = {
  languageLabel: string;
  englishLabel: string;
  swedishLabel: string;
  sidebarIntro: string;
  currentLocation: string;
  noProjectSelected: string;
  sectionLabel: string;
  chooseProjectFirst: string;
  highlightedNavigationHint: string;
  chooseProjectHint: string;
  hideGuidance: string;
  showGuidance: string;
  topbarBadge: string;
  brandSubtitle: string;
  signOut: string;
  signInMode: {
    demo: string;
    local: string;
    supabase: string;
  };
  navigation: Record<string, NavigationCopy>;
  sectionLabels: Record<string, string>;
};

export const appChromeContent: Record<AppLanguage, AppChromeContent> = {
  en: {
    languageLabel: "Language",
    englishLabel: "English",
    swedishLabel: "Svenska",
    sidebarIntro: "Project-scoped framing, import, governance and delivery work.",
    currentLocation: "Current location",
    noProjectSelected: "No project selected",
    sectionLabel: "Section",
    chooseProjectFirst: "Choose a project in Home first",
    highlightedNavigationHint: "The highlighted navigation item below matches the workspace you are in now.",
    chooseProjectHint: "Choose a project in Home, then continue through its sections here.",
    hideGuidance: "Hide guidance",
    showGuidance: "Show guidance",
    topbarBadge: "Engineered for controlled and secure AI acceleration.",
    brandSubtitle: "Augmented Application Services",
    signOut: "Sign out",
    signInMode: {
      demo: "Demo access",
      local: "Direct sign-in",
      supabase: "Verified email"
    },
    navigation: {
      "/": {
        label: "Home",
        description: "Open, resume, or create projects."
      },
      "/framing": {
        label: "Framing",
        description: "Business case, baseline, owner, and direction."
      },
      "/pricing": {
        label: "Pricing",
        description: "Commercial fit, readiness, risks, and model advice."
      },
      "/workspace": {
        label: "Value Spine",
        description: "Framing, Epics, Stories, and readiness in one spine."
      },
      "/intake": {
        label: "Import",
        description: "Upload and parse external source artifacts."
      },
      "/review": {
        label: "Mänsklig granskning",
        description: "Review, correct, confirm, and approve imports."
      },
      "/governance": {
        label: "Governance",
        description: "Roles, AI level, risks, and sign-off traceability."
      },
      "/help": {
        label: "Help",
        description: "Method guide, process flow, and key concepts."
      },
      "/admin": {
        label: "Admin",
        description: "Bulk cleanup and hard deletion of test projects."
      }
    },
    sectionLabels: {
      Home: "Home",
      Framing: "Framing",
      Pricing: "Pricing",
      "Value Spine": "Value Spine",
      Import: "Import",
      "Human Review": "Mänsklig granskning",
      Governance: "Governance",
      Help: "Help",
      Admin: "Admin",
      Dashboard: "Dashboard",
      Unavailable: "Unavailable",
      Stories: "Stories",
      Outcome: "Outcome",
      Epic: "Epic",
      "Story Idea": "Story Idea",
      "Delivery Story": "Delivery Story",
      "Build Start": "Build Start",
      "Loading workspace": "Loading workspace",
      "Application error": "Application error",
      "Framing Cockpit": "Framingcockpit",
      "Control Plane Foundation": "Control Plane Foundation",
      "Project section": "Project section",
      "Project selector": "Project selector",
      "Method guide": "Method guide"
    }
  },
  sv: {
    languageLabel: "Språk",
    englishLabel: "English",
    swedishLabel: "Svenska",
    sidebarIntro: "Projektstyrd framing, import, styrning och leveransarbete.",
    currentLocation: "Nuvarande plats",
    noProjectSelected: "Inget projekt valt",
    sectionLabel: "Sektion",
    chooseProjectFirst: "Välj först ett projekt i Home",
    highlightedNavigationHint: "Den markerade navigationspunkten nedan matchar arbetsytan du befinner dig i nu.",
    chooseProjectHint: "Välj ett projekt i Home och fortsätt sedan genom dess sektioner här.",
    hideGuidance: "Dölj hjälpledning",
    showGuidance: "Visa hjälpledning",
    topbarBadge: "Byggd för kontrollerad och säker AI-acceleration.",
    brandSubtitle: "Augmented Application Services",
    signOut: "Logga ut",
    signInMode: {
      demo: "Demoåtkomst",
      local: "Direktinloggning",
      supabase: "Verifierad e-post"
    },
    navigation: {
      "/": {
        label: "Hem",
        description: "Öppna, återuppta eller skapa projekt."
      },
      "/framing": {
        label: "Framing",
        description: "Business case, baseline, ägare och riktning."
      },
      "/pricing": {
        label: "Prissättning",
        description: "Kommersiell passform, readiness, risker och modellråd."
      },
      "/workspace": {
        label: "Value Spine",
        description: "Framing, epics, stories och readiness i en spine."
      },
      "/intake": {
        label: "Import",
        description: "Ladda upp och tolka externa källartefakter."
      },
      "/review": {
        label: "Human Review",
        description: "Granska, korrigera, bekräfta och godkänn importer."
      },
      "/governance": {
        label: "Governance",
        description: "Roller, AI-nivå, risker och spårbar sign-off."
      },
      "/help": {
        label: "Hjälp",
        description: "Metodguide, processflöde och nyckelbegrepp."
      },
      "/admin": {
        label: "Admin",
        description: "Rensa testprojekt i bulk och ta bort dem permanent."
      }
    },
    sectionLabels: {
      Home: "Hem",
      Framing: "Framing",
      Pricing: "Prissättning",
      "Value Spine": "Value Spine",
      Import: "Import",
      "Human Review": "Human Review",
      Governance: "Governance",
      Help: "Hjälp",
      Admin: "Admin",
      Dashboard: "Översikt",
      Unavailable: "Otillgänglig",
      Stories: "Stories",
      Outcome: "Outcome",
      Epic: "Epic",
      "Story Idea": "Story Idea",
      "Delivery Story": "Delivery Story",
      "Build Start": "Byggstart",
      "Loading workspace": "Laddar arbetsyta",
      "Application error": "Applikationsfel",
      "Framing Cockpit": "Framing Cockpit",
      "Control Plane Foundation": "AAS Control Plane",
      "Project section": "Projektsektion",
      "Project selector": "Projektval",
      "Method guide": "Metodguide"
    }
  }
};

export function getLocalizedNavigationCopy(href: string, fallback: NavigationCopy, language: AppLanguage): NavigationCopy {
  return appChromeContent[language].navigation[href] ?? fallback;
}

export function translateSectionLabel(label: string | undefined, language: AppLanguage) {
  if (!label) {
    return label;
  }

  return appChromeContent[language].sectionLabels[label] ?? label;
}
