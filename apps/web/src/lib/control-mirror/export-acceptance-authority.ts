export type ControlMirrorExportAcceptanceReviewerRole = "product_owner" | "security_privacy" | "aqa";

const reviewerAuthorityByMembershipRole: Record<ControlMirrorExportAcceptanceReviewerRole, string[]> = {
  product_owner: ["value_owner"],
  security_privacy: ["architect", "aida"],
  aqa: ["aqa"]
};

export function canRecordControlMirrorExportAcceptanceRole(input: {
  membershipRole: string | null | undefined;
  reviewerRole: ControlMirrorExportAcceptanceReviewerRole;
}) {
  const membershipRole = input.membershipRole?.trim();

  return Boolean(membershipRole && reviewerAuthorityByMembershipRole[input.reviewerRole].includes(membershipRole));
}

export function formatControlMirrorExportAcceptanceReviewerRole(role: ControlMirrorExportAcceptanceReviewerRole) {
  if (role === "product_owner") return "Product owner";
  if (role === "security_privacy") return "Security/privacy reviewer";
  return "AQA reviewer";
}
