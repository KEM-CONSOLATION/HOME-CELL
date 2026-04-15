"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/dashboard-cards";
import { ArrowLeft, Save, Layers } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { getZone, updateZone } from "@/lib/zones-api";
import { listAreas } from "@/lib/areas-api";
import type { Area } from "@/types/area";
import { Skeleton } from "@/components/ui/skeleton";
import { listMembers } from "@/lib/members-api";
import type { MemberRecord } from "@/types/models";
import { Combobox } from "@/components/ui/combobox";

export default function EditZonePage() {
  const router = useRouter();
  const params = useParams();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const raw = Array.isArray(idParam) ? idParam[0] : idParam;
  const idNum = raw ? Number.parseInt(raw, 10) : NaN;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState("");
  const [zonalLeaderId, setZonalLeaderId] = useState("");
  const [areaOptions, setAreaOptions] = useState<Area[]>([]);
  const [leaders, setLeaders] = useState<MemberRecord[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(true);

  const areaNum = Number.parseInt(areaId, 10);
  const leaderNum = Number.parseInt(zonalLeaderId, 10);
  const areaOk = areaId.trim() !== "" && Number.isFinite(areaNum);
  const isValid =
    name.trim().length > 0 && areaOk && Number.isFinite(leaderNum);

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const [z, areasList, membersList] = await Promise.all([
          getZone(idNum),
          listAreas().catch(() => [] as Area[]),
          listMembers().catch(() => [] as MemberRecord[]),
        ]);
        if (cancelled) return;
        setName(z.name);
        setAreaId(String(z.area));
        setZonalLeaderId(String(z.zonal_leader));
        setAreaOptions(
          [...areasList].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setLeaders(membersList);
      } catch (error) {
        console.error("Failed to fetch zone:", error);
        if (!cancelled) {
          toast.error("Failed to load zone");
          router.push("/app/zones");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingAreas(false);
          setIsLoadingLeaders(false);
        }
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
      await updateZone(idNum, {
        name: name.trim(),
        area: areaNum,
        zonal_leader: leaderNum,
      });
      toast.success("Zone updated", {
        description: "Changes have been saved.",
      });
      router.push(`/app/zones/${idNum}`);
    } catch (error: unknown) {
      console.error("Save error:", error);
      const err = error as { response?: { data?: { detail?: string } } };
      const message =
        err.response?.data?.detail ?? "Failed to update zone. Try again.";
      toast.error("Update failed", { description: String(message) });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <Skeleton className="h-5 w-32" />
        <Card className="border-none bg-white">
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={`zone-edit-skeleton-${i}`}
                className="h-10 w-full"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href={Number.isFinite(idNum) ? `/app/zones/${idNum}` : "/app/zones"}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to zone
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit zone</h1>
        <p className="text-muted-foreground">
          Update the zone name, parent area, or zonal leader assignment.
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
                className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
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
                    options={areaOptions.map((area) => ({
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
            href={Number.isFinite(idNum) ? `/app/zones/${idNum}` : "/app/zones"}
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
              <Save className="h-4 w-4" />
            )}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
