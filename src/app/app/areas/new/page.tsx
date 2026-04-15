"use client";

import { useStore } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/dashboard-cards";
import { ArrowLeft, Plus, MapPinned } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createArea } from "@/lib/areas-api";
import { listStates } from "@/lib/states-api";
import type { State as StateRow } from "@/types/state";
import { Skeleton } from "@/components/ui/skeleton";
import { listMembers } from "@/lib/members-api";
import type { MemberRecord } from "@/types/models";
import { Combobox } from "@/components/ui/combobox";

export default function NewAreaPage() {
  const router = useRouter();
  const { user } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [areaLeaderId, setAreaLeaderId] = useState("");
  const [stateOptions, setStateOptions] = useState<StateRow[]>([]);
  const [leaders, setLeaders] = useState<MemberRecord[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(true);

  useEffect(() => {
    void listStates()
      .then((rows) => {
        setStateOptions([...rows].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => {
        toast.error("Could not load states.");
      })
      .finally(() => {
        setIsLoadingStates(false);
      });

    void listMembers()
      .then(setLeaders)
      .catch(() => {
        toast.error("Could not load members for leader assignment.");
      })
      .finally(() => {
        setIsLoadingLeaders(false);
      });
  }, []);

  const stateNum = Number.parseInt(stateId, 10);
  const leaderNum = Number.parseInt(areaLeaderId, 10);
  const stateOk = stateId.trim() !== "" && Number.isFinite(stateNum);
  const isValid =
    name.trim().length > 0 && stateOk && Number.isFinite(leaderNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSaving(true);
    try {
      await createArea({
        name: name.trim(),
        state: stateNum,
        area_leader: leaderNum,
      });
      toast.success("Area created", {
        description: "The area has been registered.",
      });
      router.push("/app/areas");
    } catch (error: unknown) {
      console.error("Save error:", error);
      const err = error as { response?: { data?: { detail?: string } } };
      const message =
        err.response?.data?.detail ?? "Failed to create area. Try again.";
      toast.error("Creation failed", { description: String(message) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href="/app/areas"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to areas
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">New area</h1>
        <p className="text-muted-foreground">
          Register an area and assign leadership for {user?.unitName}.
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
                  Select a state and an assigned area leader by name.
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
                placeholder="e.g. Calabar Metropolis"
                className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  State <span className="text-destructive">*</span>
                </label>
                {isLoadingStates ? (
                  <Skeleton className="h-10 w-full rounded-xl" />
                ) : (
                  <Combobox
                    value={stateId}
                    onChange={setStateId}
                    placeholder="Select state"
                    searchPlaceholder="Search states..."
                    options={stateOptions.map((state) => ({
                      value: String(state.id),
                      label: state.name,
                    }))}
                  />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  Area leader <span className="text-destructive">*</span>
                </label>
                {isLoadingLeaders ? (
                  <Skeleton className="h-10 w-full rounded-xl" />
                ) : (
                  <Combobox
                    value={areaLeaderId}
                    onChange={setAreaLeaderId}
                    placeholder="Select area leader"
                    searchPlaceholder="Search leaders..."
                    options={leaders.map((member) => ({
                      value: String(member.id),
                      label: [member.first_name, member.last_name]
                        .filter(Boolean)
                        .join(" "),
                    }))}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 pt-2">
          <Link
            href="/app/areas"
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
              <Skeleton className="h-4 w-4 rounded-full bg-primary-foreground/40" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create area
          </button>
        </div>
      </form>
    </div>
  );
}
