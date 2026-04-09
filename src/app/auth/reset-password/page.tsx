"use client";

import { useState } from "react";
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/auth-layout";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      toast.success("Success!", {
        description: "Your password has been reset. Please login.",
      });
      router.push("/");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Set New Password</h2>
        <p className="text-muted-foreground text-sm mt-2 font-medium">
          Create a strong, unique password to secure your HOME-CELL account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">
            New Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-14 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-white transition-all placeholder:text-muted-foreground/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">
            Confirm Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-14 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-white transition-all placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold overflow-hidden transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-70 group mt-4 px-3"
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Update Password
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
        </button>
      </form>
    </AuthLayout>
  );
}
