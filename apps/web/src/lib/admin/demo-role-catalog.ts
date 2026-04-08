import type { OrganizationSide, PartyRoleType } from "@aas-companion/domain";

export type DemoRoleSeed = {
  id: string;
  organizationSide: OrganizationSide;
  roleType: PartyRoleType;
  roleLabel: string;
  fullName: string;
  email: string;
  roleTitle: string;
  mandateNotes: string;
  avatarUrl: string;
};

type PortraitPalette = {
  background: string;
  card: string;
  skin: string;
  hair: string;
  shirt: string;
  accent: string;
};

const customerPalettes: PortraitPalette[] = [
  {
    background: "#eef6ff",
    card: "#d9e9ff",
    skin: "#f2c7a5",
    hair: "#5b3a29",
    shirt: "#c06c84",
    accent: "#5b8def"
  },
  {
    background: "#fef2f8",
    card: "#f9d7e8",
    skin: "#f4cfb1",
    hair: "#402a23",
    shirt: "#8b5cf6",
    accent: "#ec4899"
  },
  {
    background: "#f5f7ff",
    card: "#dfe4ff",
    skin: "#f0c19a",
    hair: "#2f1f19",
    shirt: "#2563eb",
    accent: "#7c3aed"
  },
  {
    background: "#fff5f5",
    card: "#ffdede",
    skin: "#d9a585",
    hair: "#1f1512",
    shirt: "#dc2626",
    accent: "#f97316"
  }
];

const supplierPalettes: PortraitPalette[] = [
  {
    background: "#eefcf6",
    card: "#d9f6e8",
    skin: "#f2c5a0",
    hair: "#33231e",
    shirt: "#0f766e",
    accent: "#059669"
  },
  {
    background: "#f5fff7",
    card: "#ddf7e2",
    skin: "#f3cbab",
    hair: "#241814",
    shirt: "#2563eb",
    accent: "#10b981"
  },
  {
    background: "#f2fffb",
    card: "#d8f7ef",
    skin: "#9b6c4a",
    hair: "#17100d",
    shirt: "#111827",
    accent: "#14b8a6"
  },
  {
    background: "#f4fff9",
    card: "#def8ea",
    skin: "#d8a784",
    hair: "#3a251e",
    shirt: "#7c3aed",
    accent: "#22c55e"
  },
  {
    background: "#f0fdf4",
    card: "#d7f7df",
    skin: "#efc6a5",
    hair: "#2a1d17",
    shirt: "#b45309",
    accent: "#16a34a"
  },
  {
    background: "#f7fffa",
    card: "#e1f9ea",
    skin: "#c99471",
    hair: "#111111",
    shirt: "#374151",
    accent: "#0891b2"
  }
];

function encodeSvg(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

function buildPortraitSvg(input: {
  name: string;
  side: OrganizationSide;
  index: number;
}) {
  const palette =
    input.side === "customer"
      ? customerPalettes[input.index % customerPalettes.length]!
      : supplierPalettes[input.index % supplierPalettes.length]!;
  const initials = input.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const shoulderCurve = input.side === "customer" ? "26 86 44 76 64 76 82 76 102 86" : "22 88 42 74 64 74 86 74 106 88";
  const hairPath =
    input.side === "customer"
      ? `M26 44c0-21 18-33 38-33 21 0 37 12 37 32 0 6-2 10-4 15-4-9-14-14-22-14-6 0-11 3-16 7-7 5-15 8-26 8-3 0-5 0-7-1 0-5 0-9 0-14Z`
      : `M24 42c1-19 18-31 40-31 23 0 40 11 40 29 0 7-2 13-5 17-4-9-13-15-24-15H49c-10 0-18 4-24 12-1-4-2-8-1-12Z`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${input.name}">
      <rect width="128" height="128" rx="28" fill="${palette.background}" />
      <rect x="10" y="10" width="108" height="108" rx="24" fill="${palette.card}" />
      <circle cx="64" cy="48" r="26" fill="${palette.skin}" />
      <path d="${hairPath}" fill="${palette.hair}" />
      <path d="M16 118c2-17 18-33 48-33s46 16 48 33H16Z" fill="${palette.shirt}" />
      <path d="M${shoulderCurve}" fill="${palette.accent}" opacity="0.88" />
      <circle cx="55" cy="49" r="2.5" fill="#241f1a" />
      <circle cx="73" cy="49" r="2.5" fill="#241f1a" />
      <path d="M55 61c5 5 13 5 18 0" fill="none" stroke="#8a4b38" stroke-linecap="round" stroke-width="3" />
      <rect x="16" y="16" width="34" height="20" rx="10" fill="${palette.accent}" opacity="0.92" />
      <text x="33" y="30" font-family="Arial, sans-serif" font-size="11" font-weight="700" text-anchor="middle" fill="#ffffff">${initials}</text>
    </svg>
  `.trim();
}

function buildPortraitUrl(input: {
  name: string;
  side: OrganizationSide;
  index: number;
}) {
  return encodeSvg(buildPortraitSvg(input));
}

export const demoRoleSeeds: DemoRoleSeed[] = [
  {
    id: "customer_sponsor",
    organizationSide: "customer",
    roleType: "customer_sponsor",
    roleLabel: "Customer Sponsor",
    fullName: "Meryl Streep",
    email: "meryl.streep+customer-sponsor@demo.aas.local",
    roleTitle: "Executive Sponsor",
    mandateNotes: "Owns sponsor authority, escalation ownership and tollgate sponsorship for the project.",
    avatarUrl: buildPortraitUrl({
      name: "Meryl Streep",
      side: "customer",
      index: 0
    })
  },
  {
    id: "customer_domain_owner",
    organizationSide: "customer",
    roleType: "customer_domain_owner",
    roleLabel: "Customer Domain Owner",
    fullName: "Emily Blunt",
    email: "emily.blunt+domain-owner@demo.aas.local",
    roleTitle: "Customer Domain Owner",
    mandateNotes: "Ensures customer-side domain rules, environment alignment and business context stay correct.",
    avatarUrl: buildPortraitUrl({
      name: "Emily Blunt",
      side: "customer",
      index: 1
    })
  },
  {
    id: "value_owner",
    organizationSide: "customer",
    roleType: "value_owner",
    roleLabel: "Value Owner",
    fullName: "Anne Hathaway",
    email: "anne.hathaway+value-owner@demo.aas.local",
    roleTitle: "Value Owner",
    mandateNotes: "Validates value, baseline, priority and whether the case is worth doing now.",
    avatarUrl: buildPortraitUrl({
      name: "Anne Hathaway",
      side: "customer",
      index: 2
    })
  },
  {
    id: "risk_owner",
    organizationSide: "customer",
    roleType: "risk_owner",
    roleLabel: "Risk Owner",
    fullName: "Viola Davis",
    email: "viola.davis+risk-owner@demo.aas.local",
    roleTitle: "Risk Owner",
    mandateNotes: "Approves risk posture, compliance concerns and final risk acceptance when required.",
    avatarUrl: buildPortraitUrl({
      name: "Viola Davis",
      side: "customer",
      index: 3
    })
  },
  {
    id: "architect",
    organizationSide: "supplier",
    roleType: "architect",
    roleLabel: "Architect",
    fullName: "Benedict Cumberbatch",
    email: "benedict.cumberbatch+architect@demo.aas.local",
    roleTitle: "Solution Architect",
    mandateNotes: "Ensures sustainable design, architecture review and non-functional alignment.",
    avatarUrl: buildPortraitUrl({
      name: "Benedict Cumberbatch",
      side: "supplier",
      index: 0
    })
  },
  {
    id: "aida",
    organizationSide: "supplier",
    roleType: "aida",
    roleLabel: "AIDA",
    fullName: "Tom Hiddleston",
    email: "tom.hiddleston+aida@demo.aas.local",
    roleTitle: "AI Delivery Architect",
    mandateNotes: "Sets AI level and designs how AI is used across the delivery.",
    avatarUrl: buildPortraitUrl({
      name: "Tom Hiddleston",
      side: "supplier",
      index: 1
    })
  },
  {
    id: "aqa",
    organizationSide: "supplier",
    roleType: "aqa",
    roleLabel: "AQA",
    fullName: "Denzel Washington",
    email: "denzel.washington+aqa@demo.aas.local",
    roleTitle: "AI Quality Authority",
    mandateNotes: "Reviews AI output quality, reproducibility and can stop release on quality grounds.",
    avatarUrl: buildPortraitUrl({
      name: "Denzel Washington",
      side: "supplier",
      index: 2
    })
  },
  {
    id: "delivery_lead",
    organizationSide: "supplier",
    roleType: "delivery_lead",
    roleLabel: "Delivery Lead",
    fullName: "George Clooney",
    email: "george.clooney+delivery-lead@demo.aas.local",
    roleTitle: "Delivery Lead",
    mandateNotes: "Owns delivery accountability, Value Spine integrity, governance follow-through and escalations.",
    avatarUrl: buildPortraitUrl({
      name: "George Clooney",
      side: "supplier",
      index: 3
    })
  },
  {
    id: "builder",
    organizationSide: "supplier",
    roleType: "builder",
    roleLabel: "Builder",
    fullName: "Matt Damon",
    email: "matt.damon+builder@demo.aas.local",
    roleTitle: "Senior Builder",
    mandateNotes: "Owns direct implementation and build execution for approved stories.",
    avatarUrl: buildPortraitUrl({
      name: "Matt Damon",
      side: "supplier",
      index: 4
    })
  },
  {
    id: "ai_governance_lead",
    organizationSide: "supplier",
    roleType: "ai_governance_lead",
    roleLabel: "AI Governance Lead",
    fullName: "Idris Elba",
    email: "idris.elba+ai-governance@demo.aas.local",
    roleTitle: "AI Governance Lead",
    mandateNotes: "Owns AI governance posture, supervision rules and controlled AI usage boundaries.",
    avatarUrl: buildPortraitUrl({
      name: "Idris Elba",
      side: "supplier",
      index: 5
    })
  }
];

export function getDemoRoleSeedById(id: string) {
  return demoRoleSeeds.find((seed) => seed.id === id) ?? null;
}
