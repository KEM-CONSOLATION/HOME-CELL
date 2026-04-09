"use client";

import { useStore } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/dashboard-cards";
import {
  ArrowLeft,
  Plus,
  MapPin,
  UserPlus,
  Clock,
  ShieldCheck,
  Save,
  Users,
  Building2,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MOCK_MEMBERS } from "@/data/mock-data";

export default function NewCellPage() {
  const router = useRouter();
  const { user } = useStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      toast.success("New Cell Created!", {
        description: "Fellowship center registered and leader assigned.",
      });
      router.push("/app/cells");
      setIsSaving(false);
    }, 1200);
  };

  const potentialLeaders = MOCK_MEMBERS.filter(
    (m) => m.status === "LEADER" || m.status === "WORKER",
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href="/app/cells"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Fellowship Cells
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Establish New Cell
        </h1>
        <p className="text-muted-foreground">
          Register a new fellowship center and assign a primary leader for{" "}
          {user?.unitName}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8">
          {/* Identity & Location */}
          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Cell Identity & Location</CardTitle>
                  <CardDescription>
                    Naming and physical address details.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Cell Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Grace Fellowship"
                    className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Assigned Zone
                  </label>
                  <select className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium appearance-none">
                    <option>Zone A - Metropolis</option>
                    <option>Zone B - Bridge</option>
                    <option>Zone C - South</option>
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Physical Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      required
                      type="text"
                      placeholder="Full street address in your area"
                      className="w-full h-12 pl-12 pr-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leadership & Schedule */}
          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Leadership & Schedule</CardTitle>
                  <CardDescription>
                    Assigning oversight and timing.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Primary Cell Leader
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select className="w-full h-12 pl-12 pr-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium appearance-none">
                      <option value="">Select a Leader</option>
                      {potentialLeaders.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Meeting Day
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select className="w-full h-12 pl-12 pr-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium appearance-none">
                      <option>Saturday</option>
                      <option>Friday</option>
                      <option>Sunday</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Meeting Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="time"
                      defaultValue="17:00"
                      className="w-full h-12 pl-12 pr-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Host Name (If different)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Papa John's Residence"
                    className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6">
          <Link
            href="/app/cells"
            className="px-6 py-3 rounded-xl border font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-70 transition-all"
          >
            {isSaving ? (
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create Cell Center
          </button>
        </div>
      </form>
    </div>
  );
}
