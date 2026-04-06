type FlagIconProps = {
  country: "gb" | "se";
  className?: string;
};

export function FlagIcon({ country, className = "h-4 w-4" }: FlagIconProps) {
  if (country === "gb") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="64" height="64" rx="32" fill="#0A3A82" />
        <path d="M0 10 10 0l54 54-10 10Z" fill="#fff" />
        <path d="M54 0 64 10 10 64 0 54Z" fill="#fff" />
        <path d="M0 16 16 0l48 48-16 16Z" fill="#C8102E" />
        <path d="M48 0 64 16 16 64 0 48Z" fill="#C8102E" />
        <rect x="26" width="12" height="64" fill="#fff" />
        <rect y="26" width="64" height="12" fill="#fff" />
        <rect x="28.5" width="7" height="64" fill="#C8102E" />
        <rect y="28.5" width="64" height="7" fill="#C8102E" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="32" fill="#006AA7" />
      <rect x="18" width="10" height="64" fill="#FECC00" />
      <rect y="27" width="64" height="10" fill="#FECC00" />
    </svg>
  );
}
