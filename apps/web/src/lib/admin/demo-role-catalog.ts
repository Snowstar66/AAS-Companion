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
  const shoulderCurve =
    input.side === "customer"
      ? "26 92 42 80 64 78 86 80 102 92"
      : "22 94 40 80 64 78 88 80 106 94";
  const hairPath =
    input.side === "customer"
      ? `M26 44c0-21 18-33 38-33 21 0 37 12 37 32 0 6-2 10-4 15-4-9-14-14-22-14-6 0-11 3-16 7-7 5-15 8-26 8-3 0-5 0-7-1 0-5 0-9 0-14Z`
      : `M24 42c1-19 18-31 40-31 23 0 40 11 40 29 0 7-2 13-5 17-4-9-13-15-24-15H49c-10 0-18 4-24 12-1-4-2-8-1-12Z`;
  const jacketColor = input.side === "customer" ? "#243b53" : "#1f2937";
  const shirtColor = input.side === "customer" ? "#f8fafc" : "#f9fafb";
  const tieColor = input.side === "customer" ? palette.accent : "#3b82f6";
  const lapelColor = input.side === "customer" ? "#1b2a41" : "#111827";
  const badgeLabel = input.side === "customer" ? "Customer" : "Supplier";
  const silhouette =
    input.side === "customer"
      ? `
      <path d="M14 118c4-18 21-34 50-34 28 0 45 16 50 34H14Z" fill="${jacketColor}" />
      <path d="M45 84h38l10 34H35l10-34Z" fill="${shirtColor}" />
      <path d="M50 84h28l-6 34H56l-6-34Z" fill="${shirtColor}" />
      <path d="M41 84 55 96 49 118H28c2-13 7-24 13-34Z" fill="${lapelColor}" />
      <path d="M87 84 73 96 79 118h21c-2-13-7-24-13-34Z" fill="${lapelColor}" />
      <path d="M64 88 71 98 64 118 57 98 64 88Z" fill="${tieColor}" />
      `
      : `
      <path d="M12 118c3-19 21-35 52-35 30 0 48 16 52 35H12Z" fill="${jacketColor}" />
      <path d="M46 83h36l10 35H36l10-35Z" fill="${shirtColor}" />
      <path d="M43 83 57 97 50 118H26c2-15 8-26 17-35Z" fill="${lapelColor}" />
      <path d="M85 83 71 97 78 118h24c-2-15-8-26-17-35Z" fill="${lapelColor}" />
      <path d="M64 87 72 98 67 118h-6l-5-20 8-11Z" fill="${tieColor}" />
      `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${input.name}">
      <rect width="128" height="128" rx="28" fill="${palette.background}" />
      <rect x="10" y="10" width="108" height="108" rx="24" fill="${palette.card}" />
      <rect x="18" y="18" width="92" height="28" rx="14" fill="#ffffff" opacity="0.72" />
      <path d="M18 100c18-16 35-22 50-22 17 0 33 6 42 14 5 4 8 10 8 18v8H18v-18Z" fill="${palette.accent}" opacity="0.12" />
      <circle cx="64" cy="48" r="26" fill="${palette.skin}" />
      <path d="${hairPath}" fill="${palette.hair}" />
      <path d="M${shoulderCurve}" fill="${palette.accent}" opacity="0.18" />
      ${silhouette}
      <circle cx="55" cy="49" r="2.5" fill="#241f1a" />
      <circle cx="73" cy="49" r="2.5" fill="#241f1a" />
      <path d="M56 61c4 3 12 3 16 0" fill="none" stroke="#8a4b38" stroke-linecap="round" stroke-width="2.5" />
      <path d="M51 57c4 2 8 3 13 3s9-1 13-3" fill="none" stroke="#d89b84" stroke-linecap="round" stroke-width="2" opacity="0.8" />
      <rect x="18" y="20" width="56" height="18" rx="9" fill="${palette.accent}" opacity="0.95" />
      <text x="46" y="32" font-family="Arial, sans-serif" font-size="9" font-weight="700" text-anchor="middle" fill="#ffffff">${badgeLabel}</text>
      <rect x="82" y="20" width="28" height="18" rx="9" fill="#ffffff" opacity="0.92" />
      <text x="96" y="32" font-family="Arial, sans-serif" font-size="10" font-weight="700" text-anchor="middle" fill="${jacketColor}">${initials}</text>
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
