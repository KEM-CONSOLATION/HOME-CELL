"use client";

import { useStore } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/dashboard-cards";
import { ArrowLeft, Plus, Layers } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createZone } from "@/lib/zones-api";
import { listAreas } from "@/lib/areas-api";
import type { Area } from "@/types/area";
import { Skeleton } from "@/components/ui/skeleton";

type AreaFieldMode = "loading" | "select" | "manual";

export default function NewZonePage() {
  const router = useRouter();
  const { user } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState("");
  const [zonalLeaderId, setZonalLeaderId] = useState("");
  const [areaOptions, setAreaOptions] = useState<Area[]>([]);
  const [areaFieldMode, setAreaFieldMode] = useState<AreaFieldMode>("loading");

  useEffect(() => {
    void listAreas()
      .then((rows) => {
        if (rows.length > 0) {
          setAreaOptions(
            [...rows].sort((a, b) => a.name.localeCompare(b.name)),
          );
          setAreaFieldMode("select");
        } else {
          setAreaFieldMode("manual");
        }
      })
      .catch(() => {
        setAreaFieldMode("manual");
        toast.error("Could not load areas. Enter area ID manually.");
      });
  }, []);

  const areaNum = Number.parseInt(areaId, 10);
  const leaderNum = Number.parseInt(zonalLeaderId, 10);
  const areaOk =
    areaFieldMode !== "loading" &&
    areaId.trim() !== "" &&
    Number.isFinite(areaNum);
  const isValid =
    name.trim().length > 0 && areaOk && Number.isFinite(leaderNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSaving(true);
    try {
      await createZone({
        name: name.trim(),
        area: areaNum,
        zonal_leader: leaderNum,
      });
      toast.success("Zone created", {
        description: "The zone has been registered.",
      });
      router.push("/app/zones");
    } catch (error: unknown) {
      console.error("Save error:", error);
      const err = error as { response?: { data?: { detail?: string } } };
      const message =
        err.response?.data?.detail ?? "Failed to create zone. Try again.";
      toast.error("Creation failed", { description: String(message) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href="/app/zones"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to zones
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">New zone</h1>
        <p className="text-muted-foreground">
          Register a zone and assign a zonal leader for {user?.unitName}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-none bg-white">
          <CardHeader className="border-b border-slate-50 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Zone details</CardTitle>
                <CardDescription>
                  Pick an area when the list loads, or enter an area ID. Zonal
                  leader uses a numeric user ID.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Zone A – Metropolis"
                className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  Area <span className="text-destructive">*</span>
                </label>
                {areaFieldMode === "loading" ? (
                  <Skeleton className="h-10 w-full rounded-xl" />
                ) : areaFieldMode === "select" ? (
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium appearance-none"
                  >
                    <option value="">Select area</option>
                    {areaOptions.map((a) => (
                      <option key={a.id} value={String(a.id)}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={0}
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    placeholder="Area ID"
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  Zonal leader ID <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={zonalLeaderId}
                  onChange={(e) => setZonalLeaderId(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 pt-2">
          <Link
            href="/app/zones"
            className="px-6 py-3 rounded-xl border font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving || !isValid}
            className="cursor-pointer px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
          >
            {isSaving ? (
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create zone
          </button>
        </div>
      </form>
    </div>
  );
}
