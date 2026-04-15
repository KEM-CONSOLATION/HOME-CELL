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
import { listStates } from "@/lib/states-api";
import type { State as StateRow } from "@/types/state";
import { Skeleton } from "@/components/ui/skeleton";
import { listMembers } from "@/lib/members-api";
import type { MemberRecord } from "@/types/models";
import { Combobox } from "@/components/ui/combobox";

export default function NewZonePage() {
  const router = useRouter();
  const { user } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [zonalLeaderId, setZonalLeaderId] = useState("");
  const [stateOptions, setStateOptions] = useState<StateRow[]>([]);
  const [areaOptions, setAreaOptions] = useState<Area[]>([]);
  const [leaders, setLeaders] = useState<MemberRecord[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
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

    void listAreas()
      .then((rows) => {
        setAreaOptions([...rows].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => {
        toast.error("Could not load areas.");
      })
      .finally(() => {
        setIsLoadingAreas(false);
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
  const filteredAreas =
    Number.isFinite(stateNum) && stateId.trim() !== ""
      ? areaOptions.filter((area) => area.state === stateNum)
      : areaOptions;

  useEffect(() => {
    if (!areaId) return;
    const selectedArea = areaOptions.find((area) => String(area.id) === areaId);
    if (!selectedArea) {
      setAreaId("");
      return;
    }
    if (Number.isFinite(stateNum) && selectedArea.state !== stateNum) {
      setAreaId("");
    }
  }, [areaId, areaOptions, stateNum]);

  const areaNum = Number.parseInt(areaId, 10);
  const leaderNum = Number.parseInt(zonalLeaderId, 10);
  const stateOk = stateId.trim() !== "" && Number.isFinite(stateNum);
  const areaOk = areaId.trim() !== "" && Number.isFinite(areaNum);
  const isValid =
    name.trim().length > 0 && stateOk && areaOk && Number.isFinite(leaderNum);

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
                  Select an area and assign a zonal leader by name.
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
                  State <span className="text-destructive">*</span>
                </label>
                {isLoadingStates ? (
                  <Skeleton className="h-10 w-full rounded-xl" />
                ) : (
                  <Combobox
                    value={stateId}
                    onChange={(value) => {
                      setStateId(value);
                      setAreaId("");
                    }}
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
                  Area <span className="text-destructive">*</span>
                </label>
                {isLoadingAreas ? (
                  <Skeleton className="h-10 w-full rounded-xl" />
                ) : (
                  <Combobox
                    value={areaId}
                    onChange={setAreaId}
                    placeholder="Select area"
                    searchPlaceholder="Search areas..."
                    options={filteredAreas.map((area) => ({
                      value: String(area.id),
                      label: area.name,
                    }))}
                  />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  Zonal leader <span className="text-destructive">*</span>
                </label>
                {isLoadingLeaders ? (
                  <Skeleton className="h-10 w-full rounded-xl" />
                ) : (
                  <Combobox
                    value={zonalLeaderId}
                    onChange={setZonalLeaderId}
                    placeholder="Select zonal leader"
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
              <Skeleton className="h-4 w-4 rounded-full bg-primary-foreground/40" />
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
