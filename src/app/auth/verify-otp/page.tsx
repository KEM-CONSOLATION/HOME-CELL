"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/auth-layout";
import { useRouter } from "next/navigation";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      toast.success("Identity verified!", {
        description: "Please set your new password.",
      });
      router.push("/auth/reset-password");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
          Back to Forgot Password
        </Link>
        <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Verify Identity</h2>
        <p className="text-muted-foreground text-sm mt-2 font-medium">
          We&apos;ve sent a 6-digit verification code to your email. Please
          enter it below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 bg-slate-50 border border-slate-100 rounded-xl text-center text-xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-white transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.some((v) => !v)}
          className="relative w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold overflow-hidden transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-70 group mt-4 px-3"
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Verify OTP
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Haven&apos;t received the code?{" "}
          <button className="ml-1 text-primary font-bold hover:underline">
            Resend Code
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
