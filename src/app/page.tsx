"use client";

import { useStore } from "@/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/auth-layout";
import api from "@/config/axios";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isValid = email.trim().length > 0 && password.length >= 6;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/token/", {
        email,
        password,
      });

      const { access, refresh, user } = response.data;

      setToken(access, refresh);
      setUser(user ?? null);

      toast.success("Welcome back!", {
        description: "You have signed in successfully.",
      });
      router.push("/app");
    } catch (error: unknown) {
      console.error("Login Error:", error);
      const err = error as {
        response?: { data?: { detail?: string; message?: string } };
      };
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Invalid credentials. Please try again.";
      toast.error("Authentication failed", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Sign In</h2>
        <p className="text-muted-foreground text-sm mt-1 font-medium">
          Enter your credentials to access your dashboard.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
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

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-[10px] font-bold text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
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

        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="cursor-pointer relative w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold overflow-hidden transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 group mt-4"
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
        </button>
      </form>
    </AuthLayout>
  );
}
