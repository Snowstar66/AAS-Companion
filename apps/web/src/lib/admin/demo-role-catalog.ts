import type { OrganizationSide, PartyRoleType } from "@aas-companion/domain";
import { readEnv } from "@aas-companion/config";

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
  previewAvatarUrl: string;
};

function buildSeedAvatarPath(seedId: string, variant: "humans" | "avatars") {
  return `/demo-avatars/${variant}/${seedId}.jpg`;
}

function buildSeedAvatarUrl(seedId: string, variant: "humans" | "avatars") {
  const path = buildSeedAvatarPath(seedId, variant);
  const env = readEnv();
  return new URL(path, env.NEXT_PUBLIC_SITE_URL).toString();
}

function buildSeed(input: Omit<DemoRoleSeed, "avatarUrl" | "previewAvatarUrl">): DemoRoleSeed {
  return {
    ...input,
    avatarUrl: buildSeedAvatarUrl(input.id, "humans"),
    previewAvatarUrl: buildSeedAvatarPath(input.id, "avatars")
  };
}

export const demoRoleSeeds: DemoRoleSeed[] = [
  buildSeed({
    id: "customer_sponsor",
    organizationSide: "customer",
    roleType: "customer_sponsor",
    roleLabel: "Customer Sponsor",
    fullName: "Meryl Streep",
    email: "meryl.streep+customer-sponsor@demo.aas.local",
    roleTitle: "Executive Sponsor",
    mandateNotes: "Owns sponsor authority, escalation ownership and tollgate sponsorship for the project."
  }),
  buildSeed({
    id: "customer_domain_owner",
    organizationSide: "customer",
    roleType: "customer_domain_owner",
    roleLabel: "Customer Domain Owner",
    fullName: "Emily Blunt",
    email: "emily.blunt+domain-owner@demo.aas.local",
    roleTitle: "Customer Domain Owner",
    mandateNotes: "Ensures customer-side domain rules, environment alignment and business context stay correct."
  }),
  buildSeed({
    id: "value_owner",
    organizationSide: "customer",
    roleType: "value_owner",
    roleLabel: "Value Owner",
    fullName: "Anne Hathaway",
    email: "anne.hathaway+value-owner@demo.aas.local",
    roleTitle: "Value Owner",
    mandateNotes: "Validates value, baseline, priority and whether the case is worth doing now."
  }),
  buildSeed({
    id: "risk_owner",
    organizationSide: "customer",
    roleType: "risk_owner",
    roleLabel: "Risk Owner",
    fullName: "Viola Davis",
    email: "viola.davis+risk-owner@demo.aas.local",
    roleTitle: "Risk Owner",
    mandateNotes: "Approves risk posture, compliance concerns and final risk acceptance when required."
  }),
  buildSeed({
    id: "architect",
    organizationSide: "supplier",
    roleType: "architect",
    roleLabel: "Architect",
    fullName: "Benedict Cumberbatch",
    email: "benedict.cumberbatch+architect@demo.aas.local",
    roleTitle: "Solution Architect",
    mandateNotes: "Ensures sustainable design, architecture review and non-functional alignment."
  }),
  buildSeed({
    id: "aida",
    organizationSide: "supplier",
    roleType: "aida",
    roleLabel: "AIDA",
    fullName: "Tom Hiddleston",
    email: "tom.hiddleston+aida@demo.aas.local",
    roleTitle: "AI Delivery Architect",
    mandateNotes: "Sets AI level and designs how AI is used across the delivery."
  }),
  buildSeed({
    id: "aqa",
    organizationSide: "supplier",
    roleType: "aqa",
    roleLabel: "AQA",
    fullName: "Denzel Washington",
    email: "denzel.washington+aqa@demo.aas.local",
    roleTitle: "AI Quality Authority",
    mandateNotes: "Reviews AI output quality, reproducibility and can stop release on quality grounds."
  }),
  buildSeed({
    id: "delivery_lead",
    organizationSide: "supplier",
    roleType: "delivery_lead",
    roleLabel: "Delivery Lead",
    fullName: "George Clooney",
    email: "george.clooney+delivery-lead@demo.aas.local",
    roleTitle: "Delivery Lead",
    mandateNotes: "Owns delivery accountability, Value Spine integrity, governance follow-through and escalations."
  }),
  buildSeed({
    id: "builder",
    organizationSide: "supplier",
    roleType: "builder",
    roleLabel: "Builder",
    fullName: "Matt Damon",
    email: "matt.damon+builder@demo.aas.local",
    roleTitle: "Senior Builder",
    mandateNotes: "Owns direct implementation and build execution for approved stories."
  }),
  buildSeed({
    id: "ai_governance_lead",
    organizationSide: "supplier",
    roleType: "ai_governance_lead",
    roleLabel: "AI Governance Lead",
    fullName: "Cate Blanchett",
    email: "cate.blanchett+ai-governance@demo.aas.local",
    roleTitle: "AI Governance Lead",
    mandateNotes: "Owns AI governance posture, supervision rules and controlled AI usage boundaries."
  })
];

export function getDemoRoleSeedById(id: string) {
  return demoRoleSeeds.find((seed) => seed.id === id) ?? null;
}

export function getDemoRoleSeedByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return demoRoleSeeds.find((seed) => seed.email.trim().toLowerCase() === normalizedEmail) ?? null;
}
