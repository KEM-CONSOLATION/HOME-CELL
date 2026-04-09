import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const e = err as {
    response?: { data?: { error?: string; message?: string } };
    message?: string;
  };
  return (
    e?.response?.data?.error ||
    e?.response?.data?.message ||
    e?.message ||
    (err as Error)?.message ||
    fallback
  );
}

