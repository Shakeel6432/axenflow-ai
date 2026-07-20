import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = { size?: "nav" | "footer"; className?: string };

export function Logo({ size = "nav", className }: LogoProps) {
  const dim = size === "nav"
    ? { w: 200, h: 54, cls: "h-9 w-auto max-w-[9.5rem] sm:h-10 sm:max-w-[11rem] lg:h-11 lg:max-w-[12.5rem]" }
    : { w: 200, h: 54, cls: "h-10 w-auto max-w-[11rem] sm:h-11" };

  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/images/logo/new-logo.png"
        alt="AxenFlow AI"
        width={dim.w}
        height={dim.h}
        className={cn(dim.cls, "object-contain")}
        priority
        loading="eager"
      />
    </Link>
  );
}
