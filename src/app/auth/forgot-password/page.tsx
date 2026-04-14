"use client";

import { useState } from "react";
import { Mail, ArrowLeft, ArrowRight, ShieldEllipsis } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/auth-layout";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      toast.success("Reset link sent!", {
        description: `Check ${email} for instructions.`,
      });
      router.push("/auth/verify-otp");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>
        <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-4">
          <ShieldEllipsis className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Forgot Password?</h2>
        <p className="text-muted-foreground text-sm mt-2 font-medium">
          Don&apos;t worry! Enter your email and we&apos;ll send you an OTP to
          reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              required
              placeholder="name@smc.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-14 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-white transition-all placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="cursor-pointer relative w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold overflow-hidden transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-70 group mt-4 px-3"
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <Skeleton className="h-5 w-5 rounded-full bg-primary-foreground/40" />
            ) : (
              <>
                Send Reset Code
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
        </button>
      </form>
    </AuthLayout>
  );
}
