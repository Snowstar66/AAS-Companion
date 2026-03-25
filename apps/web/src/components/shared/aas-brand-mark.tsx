import Image from "next/image";

type AasBrandMarkProps = {
  compact?: boolean;
  showText?: boolean;
  subtitle?: string;
};

export function AasBrandMark({
  compact = false,
  showText = true,
  subtitle = "Structured AI delivery"
}: AasBrandMarkProps) {
  const imageSize = compact ? 32 : 44;
  const imageSizeClass = compact ? "h-8 w-8 rounded-xl" : "h-11 w-11 rounded-2xl";
  const frameClass = compact ? "p-1.5" : "p-2";
  const titleClass = compact ? "text-sm" : "text-base";
  const subtitleClass = compact ? "text-[11px]" : "text-xs";

  return (
    <div className="flex items-center gap-3">
      <div className={`flex shrink-0 items-center justify-center border border-border/70 bg-white/90 shadow-sm ${imageSizeClass} ${frameClass}`}>
        <Image
          alt="AAS logo"
          className="h-full w-full object-contain"
          height={imageSize}
          priority={compact}
          src="/aas-logotype.png"
          width={imageSize}
        />
      </div>
      {showText ? (
        <div className="min-w-0">
          <p className={`truncate font-semibold tracking-tight text-foreground ${titleClass}`}>AAS Companion</p>
          <p className={`truncate uppercase tracking-[0.18em] text-muted-foreground ${subtitleClass}`}>{subtitle}</p>
        </div>
      ) : null}
    </div>
  );
}
