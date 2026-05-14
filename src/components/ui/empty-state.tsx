"use client";

import type { LucideIcon } from "lucide-react";
import { Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  /** Use `null` to hide the icon. If omitted, defaults to `Inbox`. */
  icon?: LucideIcon | null;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "error" | "loading";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const shell: Record<NonNullable<EmptyStateProps["size"]>, string> = {
  sm: "py-8 px-4",
  md: "py-12 px-6",
  lg: "py-16 px-6",
};

const iconBox: Record<NonNullable<EmptyStateProps["size"]>, string> = {
  sm: "h-12 w-12 rounded-xl",
  md: "h-14 w-14 rounded-2xl",
  lg: "h-16 w-16 rounded-2xl",
};

const iconGlyph: Record<NonNullable<EmptyStateProps["size"]>, string> = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-7 w-7",
};

const titleCls: Record<NonNullable<EmptyStateProps["size"]>, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

export function EmptyState({
  icon: IconProp,
  title,
  description,
  action,
  variant = "default",
  size = "md",
  className,
}: EmptyStateProps) {
  const isError = variant === "error";
  const isLoading = variant === "loading";
  const hideIcon = IconProp === null;
  const ResolvedIcon = isLoading ? Loader2 : (IconProp ?? Inbox);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        shell[size],
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {!hideIcon ? (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center border border-slate-100 bg-slate-50 text-muted-foreground",
            iconBox[size],
            isError && "border-rose-100 bg-rose-50 text-rose-600",
            isLoading && "border-primary/15 bg-primary/5 text-primary",
          )}
        >
          <ResolvedIcon
            className={cn(iconGlyph[size], isLoading && "animate-spin")}
          />
        </div>
      ) : null}
      <h3
        className={cn(
          "mt-4 font-bold tracking-tight text-foreground",
          titleCls[size],
          isError && "text-rose-700",
        )}
      >
        {title}
      </h3>
      {description ? (
        <p
          className={cn(
            "mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground",
            isError && "text-rose-600",
          )}
        >
          {description}
        </p>
      ) : null}
      {action ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
        </div>
      ) : null}
    </div>
  );
}
