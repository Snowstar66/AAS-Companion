type FlagIconProps = {
  country: "gb" | "se";
  className?: string;
};

export function FlagIcon({ country, className = "h-4 w-6" }: FlagIconProps) {
  if (country === "gb") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 60 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="60" height="40" rx="4" fill="#012169" />
        <path d="M0 0 24 0 60 24 60 40 36 40 0 16Z" fill="#fff" />
        <path d="M60 0 60 16 36 40 24 40 60 0Z" fill="#fff" />
        <path d="M0 40 0 24 24 40Z" fill="#fff" />
        <path d="M0 0 24 16 0 16Z" fill="#fff" />
        <path d="M0 0 60 40" stroke="#C8102E" strokeWidth="8" />
        <path d="M60 0 0 40" stroke="#C8102E" strokeWidth="8" />
        <rect x="24" width="12" height="40" fill="#fff" />
        <rect y="14" width="60" height="12" fill="#fff" />
        <rect x="26.5" width="7" height="40" fill="#C8102E" />
        <rect y="16.5" width="60" height="7" fill="#C8102E" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 60 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="40" rx="4" fill="#006AA7" />
      <rect x="18" width="8" height="40" fill="#FECC00" />
      <rect y="16" width="60" height="8" fill="#FECC00" />
    </svg>
  );
}
