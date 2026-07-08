import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-brand !text-white hover:bg-brand-strong shadow-sm",
  secondary: "bg-slate-100 !text-slate-900 hover:bg-slate-200 shadow-sm",
  outline: "border border-border bg-white !text-slate-900 hover:bg-slate-50",
  darkOutline: "border border-slate-700 bg-transparent !text-slate-200 hover:bg-slate-800 hover:!text-white transition-all",
  dark: "bg-slate-900 !text-white hover:bg-slate-800 transition-all shadow-sm",
  teal: "bg-teal-500 !text-slate-950 hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20",
  ghost: "!text-slate-700 hover:bg-slate-100",
  danger: "bg-red-600 !text-white hover:bg-red-700",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
  className?: string;
};

export function ButtonLink({ className, variant = "primary", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
