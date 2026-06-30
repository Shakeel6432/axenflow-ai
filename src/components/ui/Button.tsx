import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "outline" | "green" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

const sizeMap = {
  sm: "px-5 py-2.5 text-sm rounded-xl",
  md: "px-6 py-3 text-sm rounded-xl",
  lg: "px-8 py-3.5 text-base rounded-xl",
};

const variantMap = {
  primary: "btn-main",
  outline: "btn-secondary",
  green: "btn-green",
  ghost: "text-slate-400 hover:text-white hover:bg-white/5 rounded-xl",
};

export function Button({ href, variant = "primary", size = "md", className, children, type = "button", onClick, disabled }: ButtonProps) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer transition-all duration-300 active:scale-[0.97]",
    variantMap[variant],
    sizeMap[size],
    disabled && "opacity-60 cursor-not-allowed pointer-events-none",
    className
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}
