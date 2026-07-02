import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = { size?: "nav" | "footer"; className?: string };

export function Logo({ size = "nav", className }: LogoProps) {
  const dim = size === "nav"
    ? { w: 520, h: 140, cls: "h-[6.5rem] w-auto sm:h-[8rem]" }
    : { w: 520, h: 140, cls: "h-[6.5rem] w-auto sm:h-[8rem]" };

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
