"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/dashboard-cards";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Save,
  Users,
  Building2,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { getCell, updateCell } from "@/lib/cells-api";
import { listZones } from "@/lib/zones-api";
import { Skeleton } from "@/components/ui/skeleton";
import type { Zone } from "@/types/zone";

type ZoneFieldMode = "loading" | "select" | "manual";

export default function EditCellPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [cellName, setCellName] = useState("");
  const [cellAddress, setCellAddress] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [cellLeaderId, setCellLeaderId] = useState("");
  const [zoneOptions, setZoneOptions] = useState<Zone[]>([]);
  const [zoneFieldMode, setZoneFieldMode] = useState<ZoneFieldMode>("loading");

  const zoneNum = Number.parseInt(zoneId, 10);
  const zoneOk =
    zoneFieldMode !== "loading" &&
    zoneId.trim() !== "" &&
    Number.isFinite(zoneNum);
  const isValid =
    cellName.trim().length > 0 && cellAddress.trim().length > 0 && zoneOk;

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const [cell, zonesList] = await Promise.all([
          getCell(id),
          listZones().catch(() => [] as Zone[]),
        ]);
        if (cancelled) return;
        setCellName(cell.name);
        setCellAddress(cell.address ?? "");
        setZoneId(String(cell.zone ?? ""));
        setCellLeaderId(
          cell.cell_leader != null ? String(cell.cell_leader) : "",
        );
        if (zonesList.length > 0) {
          const sorted = [...zonesList].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
          setZoneOptions(sorted);
          const z = cell.zone;
          const hasCurrent = z != null && sorted.some((row) => row.id === z);
          setZoneFieldMode(hasCurrent ? "select" : "manual");
        } else {
          setZoneFieldMode("manual");
        }
      } catch (error) {
        console.error("Failed to fetch cell:", error);
        if (!cancelled) {
          toast.error("Failed to load cell data");
          router.push("/app/cells");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !id) return;
    setIsSaving(true);

    try {
      await updateCell(id, {
        name: cellName,
        address: cellAddress,
        latitude: "0",
        longitude: "0",
        zone: zoneNum,
        cell_leader: cellLeaderId.trim()
          ? Number.parseInt(cellLeaderId, 10)
          : null,
      });

      toast.success("Cell Updated", {
        description:
          "Fellowship center details have been updated successfully.",
      });
      router.push(`/app/cells/${id}`);
    } catch (error: unknown) {
      console.error("Save error:", error);
      const err = error as { response?: { data?: { detail?: string } } };
      const message =
        err.response?.data?.detail ||
        "Failed to update cell. Please try again.";
      toast.error("Update failed", {
        description: String(message),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <Skeleton className="h-5 w-40" />
        <Card className="border-none bg-white">
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-52" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={`cell-edit-skeleton-${i}`}
                className="h-10 w-full"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href={`/app/cells/${id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Cell Details
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Fellowship Cell
        </h1>
        <p className="text-muted-foreground">
          Update the location and leadership for {cellName}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8">
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
                    Cell Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={cellName}
                    onChange={(e) => setCellName(e.target.value)}
                    placeholder="e.g. Grace Fellowship"
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Zone <span className="text-destructive">*</span>
                  </label>
                  {zoneFieldMode === "loading" ? (
                    <Skeleton className="h-10 w-full rounded-xl" />
                  ) : zoneFieldMode === "select" ? (
                    <select
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium appearance-none"
                    >
                      <option value="">Select zone</option>
                      {zoneOptions.map((z) => (
                        <option key={z.id} value={String(z.id)}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                    />
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Physical Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={cellAddress}
                      onChange={(e) => setCellAddress(e.target.value)}
                      placeholder="Full street address in your area"
                      className="w-full h-12 pl-12 pr-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    Cell leader (user ID)
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      min={0}
                      value={cellLeaderId}
                      onChange={(e) => setCellLeaderId(e.target.value)}
                      placeholder="Optional"
                      className="w-full h-12 pl-12 pr-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                    />
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
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6">
          <Link
            href={`/app/cells/${id}`}
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
