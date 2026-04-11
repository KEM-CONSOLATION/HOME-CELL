"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/dashboard-cards";
import { ArrowLeft, Save, MapPinned } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { getArea, updateArea } from "@/lib/areas-api";
import { listStates } from "@/lib/states-api";
import type { State as StateRow } from "@/types/state";

type StatesFieldMode = "loading" | "select" | "manual";

export default function EditAreaPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const raw = Array.isArray(idParam) ? idParam[0] : idParam;
  const idNum = raw ? Number.parseInt(raw, 10) : NaN;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [areaLeaderId, setAreaLeaderId] = useState("");
  const [stateOptions, setStateOptions] = useState<StateRow[]>([]);
  const [statesFieldMode, setStatesFieldMode] =
    useState<StatesFieldMode>("loading");

  const stateNum = Number.parseInt(stateId, 10);
  const leaderNum = Number.parseInt(areaLeaderId, 10);
  const stateOk =
    statesFieldMode !== "loading" &&
    stateId.trim() !== "" &&
    Number.isFinite(stateNum);
  const isValid =
    name.trim().length > 0 && stateOk && Number.isFinite(leaderNum);

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const [area, statesList] = await Promise.all([
          getArea(idNum),
          listStates().catch(() => [] as StateRow[]),
        ]);
        if (cancelled) return;
        setName(area.name);
        setStateId(String(area.state));
        setAreaLeaderId(String(area.area_leader));
        if (statesList.length > 0) {
          const sorted = [...statesList].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
          setStateOptions(sorted);
          const hasCurrent = sorted.some((s) => s.id === area.state);
          setStatesFieldMode(hasCurrent ? "select" : "manual");
        } else {
          setStatesFieldMode("manual");
        }
      } catch (error) {
        console.error("Failed to fetch area:", error);
        if (!cancelled) {
          toast.error("Failed to load area");
          router.push("/app/areas");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idNum, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !Number.isFinite(idNum)) return;
    setIsSaving(true);
    try {
      await updateArea(idNum, {
        name: name.trim(),
        state: stateNum,
        area_leader: leaderNum,
      });
      toast.success("Area updated", {
        description: "Changes have been saved.",
      });
      router.push(`/app/areas/${idNum}`);
    } catch (error: unknown) {
      console.error("Save error:", error);
      const err = error as { response?: { data?: { detail?: string } } };
      const message =
        err.response?.data?.detail ?? "Failed to update area. Try again.";
      toast.error("Update failed", { description: String(message) });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading area…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href={Number.isFinite(idNum) ? `/app/areas/${idNum}` : "/app/areas"}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to area
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit area</h1>
        <p className="text-muted-foreground">
          Update the area name, state, or area leader assignment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-none bg-white">
          <CardHeader className="border-b border-slate-50 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Area details</CardTitle>
                <CardDescription>
                  Choose a state from the list or enter a state ID if the list
                  is unavailable.
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
                className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  State <span className="text-destructive">*</span>
                </label>
                {statesFieldMode === "loading" ? (
                  <p className="text-sm text-muted-foreground py-3">
                    Loading states…
                  </p>
                ) : statesFieldMode === "select" ? (
                  <select
                    value={stateId}
                    onChange={(e) => setStateId(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium appearance-none"
                  >
                    <option value="">Select state</option>
                    {stateOptions.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={0}
                    value={stateId}
                    onChange={(e) => setStateId(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  Area leader ID <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={areaLeaderId}
                  onChange={(e) => setAreaLeaderId(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 pt-2">
          <Link
            href={Number.isFinite(idNum) ? `/app/areas/${idNum}` : "/app/areas"}
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
              <Save className="h-4 w-4" />
            )}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
