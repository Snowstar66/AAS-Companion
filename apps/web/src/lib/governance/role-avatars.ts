import type { OrganizationSide, PartyRoleType } from "@aas-companion/domain";

type AvatarGender = "female" | "male";
type AvatarPalette = {
  backgroundStart: string;
  backgroundEnd: string;
  card: string;
  accent: string;
  hair: string;
  jacket: string;
  shirt: string;
  skin: string;
  skinShade: string;
};

type RoleAvatarInput = {
  roleType: PartyRoleType | string;
  organizationSide: OrganizationSide | string;
  fullName?: string | null | undefined;
};

const roleGenderDefaults: Partial<Record<PartyRoleType, AvatarGender>> = {
  customer_sponsor: "female",
  customer_domain_owner: "female",
  value_owner: "female",
  risk_owner: "female",
  architect: "male",
  aida: "male",
  aqa: "male",
  delivery_lead: "male",
  builder: "male",
  ai_governance_lead: "female"
};

const likelyFemaleNames = new Set([
  "anna",
  "anne",
  "annika",
  "bea",
  "carin",
  "carina",
  "elin",
  "elinor",
  "emily",
  "emma",
  "eva",
  "hanna",
  "helena",
  "ida",
  "julia",
  "karin",
  "lina",
  "lisa",
  "maria",
  "meryl",
  "moa",
  "nina",
  "sara",
  "sofia",
  "stina",
  "therese",
  "viola"
]);

const likelyMaleNames = new Set([
  "alexander",
  "benedict",
  "daniel",
  "david",
  "denzel",
  "erik",
  "fredrik",
  "george",
  "gustav",
  "henrik",
  "idris",
  "johan",
  "jonas",
  "matt",
  "mikael",
  "niklas",
  "oliver",
  "oskar",
  "pontus",
  "tom"
]);

const cartoonPalettes: Record<
  "customer" | "supplier",
  Record<AvatarGender, AvatarPalette[]>
> = {
  customer: {
    female: [
      {
        backgroundStart: "#fbf2ff",
        backgroundEnd: "#eef6ff",
        card: "#ffffff",
        accent: "#5b8def",
        hair: "#1f2a44",
        jacket: "#243b53",
        shirt: "#eef4ff",
        skin: "#f6c6a6",
        skinShade: "#ebb18c"
      },
      {
        backgroundStart: "#fff3f7",
        backgroundEnd: "#f6f3ff",
        card: "#ffffff",
        accent: "#d45d79",
        hair: "#5a3429",
        jacket: "#2f3e63",
        shirt: "#f8fbff",
        skin: "#efc09f",
        skinShade: "#df9f79"
      }
    ],
    male: [
      {
        backgroundStart: "#eef6ff",
        backgroundEnd: "#f4fbff",
        card: "#ffffff",
        accent: "#4f7df0",
        hair: "#1f2940",
        jacket: "#243447",
        shirt: "#f8fbff",
        skin: "#efbe9f",
        skinShade: "#dc9f7a"
      },
      {
        backgroundStart: "#f7f5ff",
        backgroundEnd: "#eef8ff",
        card: "#ffffff",
        accent: "#6975f5",
        hair: "#54372b",
        jacket: "#2a3248",
        shirt: "#f7faff",
        skin: "#f2c6a8",
        skinShade: "#deab87"
      }
    ]
  },
  supplier: {
    female: [
      {
        backgroundStart: "#eefcf6",
        backgroundEnd: "#eff8ff",
        card: "#ffffff",
        accent: "#1fa187",
        hair: "#233049",
        jacket: "#1f2f3c",
        shirt: "#f5fbff",
        skin: "#f4c5a1",
        skinShade: "#df9e77"
      },
      {
        backgroundStart: "#f3fffb",
        backgroundEnd: "#eef7ff",
        card: "#ffffff",
        accent: "#2d9cdb",
        hair: "#4a2a28",
        jacket: "#263644",
        shirt: "#f9fcff",
        skin: "#dca07f",
        skinShade: "#c78361"
      }
    ],
    male: [
      {
        backgroundStart: "#effcf8",
        backgroundEnd: "#eef7ff",
        card: "#ffffff",
        accent: "#19a974",
        hair: "#202634",
        jacket: "#23303d",
        shirt: "#f8fbff",
        skin: "#f0c19c",
        skinShade: "#d89d74"
      },
      {
        backgroundStart: "#f3fff8",
        backgroundEnd: "#edf6ff",
        card: "#ffffff",
        accent: "#1677c9",
        hair: "#5b3d2e",
        jacket: "#29313f",
        shirt: "#fbfdff",
        skin: "#c88e69",
        skinShade: "#b97755"
      }
    ]
  }
};

const photoPalettes: Record<
  "customer" | "supplier",
  Record<AvatarGender, AvatarPalette[]>
> = {
  customer: {
    female: [
      {
        backgroundStart: "#dbeafe",
        backgroundEnd: "#fce7f3",
        card: "#ffffff",
        accent: "#6b7cff",
        hair: "#2a2f45",
        jacket: "#cbd5e1",
        shirt: "#ffffff",
        skin: "#f3c3a5",
        skinShade: "#dfab8a"
      },
      {
        backgroundStart: "#ffe4ec",
        backgroundEnd: "#e5f0ff",
        card: "#ffffff",
        accent: "#d05f84",
        hair: "#60382d",
        jacket: "#bcc8d8",
        shirt: "#ffffff",
        skin: "#e7b694",
        skinShade: "#cf946c"
      }
    ],
    male: [
      {
        backgroundStart: "#dbeafe",
        backgroundEnd: "#ecfeff",
        card: "#ffffff",
        accent: "#4a78d3",
        hair: "#273349",
        jacket: "#aebdce",
        shirt: "#ffffff",
        skin: "#efbf9d",
        skinShade: "#da9f7a"
      },
      {
        backgroundStart: "#ede9fe",
        backgroundEnd: "#e0f2fe",
        card: "#ffffff",
        accent: "#5f6de4",
        hair: "#5c3c31",
        jacket: "#adb7c8",
        shirt: "#ffffff",
        skin: "#f1c6a9",
        skinShade: "#dcaa89"
      }
    ]
  },
  supplier: {
    female: [
      {
        backgroundStart: "#dcfce7",
        backgroundEnd: "#dbeafe",
        card: "#ffffff",
        accent: "#16967a",
        hair: "#27324d",
        jacket: "#b7c6d4",
        shirt: "#ffffff",
        skin: "#f2c39f",
        skinShade: "#db9f79"
      },
      {
        backgroundStart: "#e0f2fe",
        backgroundEnd: "#dcfce7",
        card: "#ffffff",
        accent: "#2c8fcc",
        hair: "#533128",
        jacket: "#bdc9d4",
        shirt: "#ffffff",
        skin: "#cf936f",
        skinShade: "#b77b59"
      }
    ],
    male: [
      {
        backgroundStart: "#dcfce7",
        backgroundEnd: "#e0f2fe",
        card: "#ffffff",
        accent: "#109d72",
        hair: "#243246",
        jacket: "#b4c3cf",
        shirt: "#ffffff",
        skin: "#efc09a",
        skinShade: "#d89c73"
      },
      {
        backgroundStart: "#ecfccb",
        backgroundEnd: "#dbeafe",
        card: "#ffffff",
        accent: "#2775cc",
        hair: "#5b3d31",
        jacket: "#b7c1cc",
        shirt: "#ffffff",
        skin: "#c58c66",
        skinShade: "#ae714e"
      }
    ]
  }
};

function encodeSvg(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function hashValue(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function normalizeFirstName(fullName?: string | null | undefined) {
  return (fullName ?? "")
    .trim()
    .split(/\s+/)[0]
    ?.toLowerCase()
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .replace(/[^a-z]/g, "");
}

function inferAvatarGender(input: RoleAvatarInput): AvatarGender {
  const firstName = normalizeFirstName(input.fullName);

  if (firstName && likelyFemaleNames.has(firstName)) {
    return "female";
  }

  if (firstName && likelyMaleNames.has(firstName)) {
    return "male";
  }

  const roleGender = roleGenderDefaults[input.roleType as PartyRoleType];
  if (roleGender) {
    return roleGender;
  }

  return input.organizationSide === "customer" ? "female" : "male";
}

function resolvePalette(
  input: RoleAvatarInput,
  style: "cartoon" | "photo",
  gender: AvatarGender
) {
  const side = input.organizationSide === "customer" ? "customer" : "supplier";
  const source = style === "cartoon" ? cartoonPalettes : photoPalettes;
  const palettes = source[side][gender];
  const variantKey = `${input.roleType}:${input.organizationSide}:${input.fullName ?? ""}:${style}`;
  return palettes[hashValue(variantKey) % palettes.length]!;
}

function buildCartoonAvatarSvg(input: RoleAvatarInput, gender: AvatarGender, palette: AvatarPalette) {
  const isFemale = gender === "female";
  const jacketInsetLeft = isFemale ? 22 : 18;
  const jacketInsetRight = isFemale ? 106 : 110;
  const hairPath = isFemale
    ? `M32 48c0-19 14-33 32-33 18 0 34 12 34 31 0 7-1 14-5 20-5-10-14-18-28-18-7 0-14 2-22 7-4 3-7 7-11 12-1-6 0-12 0-19Z`
    : `M30 48c0-20 16-33 34-33s34 12 34 31c0 5-1 10-4 15-6-9-16-15-30-15H50c-8 0-15 3-21 9-1-2-1-5-1-7Z`;
  const torso = isFemale
    ? `
      <path d="M18 118c4-15 20-31 46-31s42 15 46 31H18Z" fill="${palette.jacket}" />
      <path d="M44 88h40l8 30H36l8-30Z" fill="${palette.shirt}" />
      <path d="M52 88c1 10 6 16 12 16 5 0 10-6 12-16l6 30H46l6-30Z" fill="${palette.shirt}" />
    `
    : `
      <path d="M14 118c4-17 20-31 50-31 28 0 45 14 50 31H14Z" fill="${palette.jacket}" />
      <path d="M44 88h40l8 30H36l8-30Z" fill="${palette.shirt}" />
      <path d="M51 88 64 101 77 88l-7 30H58l-7-30Z" fill="${palette.accent}" opacity="0.92" />
    `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${input.fullName ?? input.roleType}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.backgroundStart}" />
          <stop offset="100%" stop-color="${palette.backgroundEnd}" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#bg)" />
      <rect x="10" y="10" width="108" height="108" rx="24" fill="${palette.card}" opacity="0.92" />
      <rect x="18" y="18" width="60" height="12" rx="6" fill="${palette.accent}" opacity="0.16" />
      <circle cx="64" cy="50" r="24" fill="${palette.skin}" />
      <path d="${hairPath}" fill="${palette.hair}" />
      <ellipse cx="64" cy="62" rx="14" ry="12" fill="${palette.skinShade}" opacity="0.18" />
      <circle cx="56" cy="51" r="2.4" fill="#2b221d" />
      <circle cx="72" cy="51" r="2.4" fill="#2b221d" />
      <path d="M57 63c4 3 10 3 14 0" fill="none" stroke="#8e5947" stroke-linecap="round" stroke-width="2.5" />
      <path d="M${jacketInsetLeft} 118c10-10 25-14 42-14 19 0 34 4 46 14" fill="none" stroke="${palette.accent}" stroke-opacity="0.18" stroke-width="10" stroke-linecap="round" />
      ${torso}
      <path d="M42 88c7 7 14 11 22 11 8 0 15-4 22-11" fill="none" stroke="${palette.accent}" stroke-opacity="0.25" stroke-width="3" />
      <path d="M${jacketInsetLeft} 118h${jacketInsetRight - jacketInsetLeft}" stroke="${palette.accent}" stroke-opacity="0.12" stroke-width="2" />
    </svg>
  `.trim();
}

function buildPhotoAvatarSvg(input: RoleAvatarInput, gender: AvatarGender, palette: AvatarPalette) {
  const isFemale = gender === "female";
  const hairPath = isFemale
    ? `M31 51c0-22 14-36 33-36 20 0 35 13 35 34 0 8-2 16-7 23-3-10-11-20-22-24-8-3-17-1-24 4-6 4-11 11-15 18-1-6 0-12 0-19Z`
    : `M30 49c2-21 16-34 35-34 21 0 35 12 35 31 0 8-2 14-6 20-7-9-17-14-31-14H48c-7 0-13 3-18 7-1-3-1-6 0-10Z`;
  const shoulders = isFemale
    ? `<path d="M22 118c6-18 21-30 42-30 21 0 36 12 42 30H22Z" fill="${palette.jacket}" />`
    : `<path d="M18 118c6-18 22-30 46-30s40 12 46 30H18Z" fill="${palette.jacket}" />`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${input.fullName ?? input.roleType}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.backgroundStart}" />
          <stop offset="100%" stop-color="${palette.backgroundEnd}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="25%" r="70%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#bg)" />
      <circle cx="64" cy="64" r="47" fill="${palette.card}" opacity="0.72" />
      <circle cx="64" cy="64" r="44" fill="url(#glow)" opacity="0.72" />
      <circle cx="64" cy="52" r="23" fill="${palette.skin}" />
      <path d="${hairPath}" fill="${palette.hair}" />
      <ellipse cx="64" cy="58" rx="16" ry="17" fill="${palette.skinShade}" opacity="0.12" />
      <circle cx="56" cy="52" r="2.4" fill="#2b211d" />
      <circle cx="72" cy="52" r="2.4" fill="#2b211d" />
      <path d="M58 64c3 2 9 2 12 0" fill="none" stroke="#8a5848" stroke-linecap="round" stroke-width="2.2" />
      <path d="M64 54v6" fill="none" stroke="#c88e74" stroke-linecap="round" stroke-width="1.8" opacity="0.65" />
      <path d="M48 83c5 5 10 8 16 8 6 0 11-3 16-8l6 35H42l6-35Z" fill="${palette.shirt}" />
      ${shoulders}
      <path d="M26 118c8-11 22-18 38-18 18 0 32 7 38 18" fill="none" stroke="${palette.accent}" stroke-opacity="0.18" stroke-width="10" stroke-linecap="round" />
    </svg>
  `.trim();
}

export function getRoleCartoonAvatarUrl(input: RoleAvatarInput) {
  const gender = inferAvatarGender(input);
  const palette = resolvePalette(input, "cartoon", gender);
  return encodeSvg(buildCartoonAvatarSvg(input, gender, palette));
}

export function getRolePhotoAvatarUrl(input: RoleAvatarInput) {
  const gender = inferAvatarGender(input);
  const palette = resolvePalette(input, "photo", gender);
  return encodeSvg(buildPhotoAvatarSvg(input, gender, palette));
}

export function isGeneratedSvgAvatarUrl(url?: string | null | undefined) {
  return typeof url === "string" && url.startsWith("data:image/svg+xml");
}
