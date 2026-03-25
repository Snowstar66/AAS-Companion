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
  const imageSize = compact ? 34 : 46;
  const imageSizeClass = compact ? "h-[34px] w-[34px] rounded-xl" : "h-[46px] w-[46px] rounded-2xl";
  const frameClass = compact ? "p-1" : "p-1.5";
  const titleClass = compact ? "text-sm" : "text-base";
  const subtitleClass = compact ? "text-[10px]" : "text-xs";

  return (
    <div className="flex items-center gap-3">
      <div className={`flex shrink-0 items-center justify-center border border-border/70 bg-white/95 shadow-sm ${imageSizeClass} ${frameClass}`}>
        <Image
          alt="AAS logo"
          className="h-full w-full object-contain"
          height={imageSize}
          priority={compact}
          src="/aas-logotype-2.jpg"
          width={imageSize}
        />
      </div>
      {showText ? (
        <div className="min-w-0">
          <p className={`truncate font-semibold tracking-tight text-foreground ${titleClass}`}>AAS Companion</p>
          <p className={`truncate uppercase tracking-[0.16em] text-muted-foreground ${subtitleClass}`}>{subtitle}</p>
        </div>
      ) : null}
    </div>
  );
}
