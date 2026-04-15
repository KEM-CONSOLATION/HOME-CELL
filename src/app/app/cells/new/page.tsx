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
  Clock,
  ShieldCheck,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createCell } from "@/lib/cells-api";
import { listZones } from "@/lib/zones-api";
import type { Zone } from "@/types/zone";
import { listAreas } from "@/lib/areas-api";
import type { Area } from "@/types/area";
import { listStates } from "@/lib/states-api";
import type { State as StateRow } from "@/types/state";
import { Skeleton } from "@/components/ui/skeleton";
import { listMembers } from "@/lib/members-api";
import type { MemberRecord } from "@/types/models";
import { Combobox } from "@/components/ui/combobox";
import { useFormFields } from "@/hooks/use-form-fields";

const createCellInitialFields = {
  cellName: "",
  cellAddress: "",
  stateId: "",
  areaId: "",
  zoneId: "",
  cellLeaderId: "",
  meetingDay: "Saturday",
};

export default function NewCellPage() {
  const router = useRouter();
  const { user } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const { fields, setField, setFields } = useFormFields(
    createCellInitialFields,
  );
  const [stateOptions, setStateOptions] = useState<StateRow[]>([]);
  const [areaOptions, setAreaOptions] = useState<Area[]>([]);
  const [zoneOptions, setZoneOptions] = useState<Zone[]>([]);
  const [leaderOptions, setLeaderOptions] = useState<MemberRecord[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
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

    void listZones()
      .then((rows) => {
        setZoneOptions([...rows].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => {
        toast.error("Could not load zones.");
      })
      .finally(() => {
        setIsLoadingZones(false);
      });

    void listMembers()
      .then(setLeaderOptions)
      .catch(() => {
        toast.error("Could not load members for leader assignment.");
      })
      .finally(() => {
        setIsLoadingLeaders(false);
      });
  }, []);

  const stateNum = Number.parseInt(fields.stateId, 10);
  const areaNum = Number.parseInt(fields.areaId, 10);
  const filteredAreas =
    Number.isFinite(stateNum) && fields.stateId.trim() !== ""
      ? areaOptions.filter((area) => area.state === stateNum)
      : [];
  const filteredZones =
    Number.isFinite(areaNum) && fields.areaId.trim() !== ""
      ? zoneOptions.filter((zone) => zone.area === areaNum)
      : [];

  useEffect(() => {
    if (!fields.areaId) return;
    const selectedArea = areaOptions.find(
      (area) => String(area.id) === fields.areaId,
    );
    if (!selectedArea) {
      setFields({
        areaId: "",
        zoneId: "",
      });
      return;
    }
    if (Number.isFinite(stateNum) && selectedArea.state !== stateNum) {
      setFields({
        areaId: "",
        zoneId: "",
      });
    }
  }, [areaOptions, fields.areaId, setFields, stateNum]);

  useEffect(() => {
    if (!fields.zoneId) return;
    const selectedZone = zoneOptions.find(
      (zone) => String(zone.id) === fields.zoneId,
    );
    if (!selectedZone) {
      setField("zoneId", "");
      return;
    }
    if (Number.isFinite(areaNum) && selectedZone.area !== areaNum) {
      setField("zoneId", "");
    }
  }, [areaNum, fields.zoneId, setField, zoneOptions]);

  const zoneNum = Number.parseInt(fields.zoneId, 10);
  const stateOk = fields.stateId.trim() !== "" && Number.isFinite(stateNum);
  const areaOk = fields.areaId.trim() !== "" && Number.isFinite(areaNum);
  const zoneOk = fields.zoneId.trim() !== "" && Number.isFinite(zoneNum);
  const isValid =
    fields.cellName.trim().length > 0 &&
    fields.cellAddress.trim().length > 0 &&
    stateOk &&
    areaOk &&
    zoneOk;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSaving(true);

    try {
      await createCell({
        name: fields.cellName,
        address: fields.cellAddress,
        latitude: "0",
        longitude: "0",
        zone: zoneNum,
        cell_leader: fields.cellLeaderId.trim()
          ? Number.parseInt(fields.cellLeaderId, 10)
          : null,
      });

      toast.success("New Cell Created!", {
        description: "Fellowship center registered and leader assigned.",
      });
      router.push("/app/cells");
    } catch (error: unknown) {
      console.error("Save error:", error);
      const err = error as { response?: { data?: { detail?: string } } };
      const message =
        err.response?.data?.detail ||
        "Failed to create cell. Please check the details and try again.";
      toast.error("Creation failed", {
        description: String(message),
      });
    } finally {
      setIsSaving(false);
    }
  };

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
                    value={fields.cellName}
                    onChange={(e) => setField("cellName", e.target.value)}
                    placeholder="e.g. Grace Fellowship"
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    State <span className="text-destructive">*</span>
                  </label>
                  {isLoadingStates ? (
                    <Skeleton className="h-10 w-full rounded-xl" />
                  ) : (
                    <Combobox
                      value={fields.stateId}
                      onChange={(value) => {
                        setFields({
                          stateId: value,
                          areaId: "",
                          zoneId: "",
                        });
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
                      value={fields.areaId}
                      onChange={(value) => {
                        setFields({
                          areaId: value,
                          zoneId: "",
                        });
                      }}
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
                    Zone <span className="text-destructive">*</span>
                  </label>
                  {isLoadingZones ? (
                    <Skeleton className="h-10 w-full rounded-xl" />
                  ) : (
                    <Combobox
                      value={fields.zoneId}
                      onChange={(value) => setField("zoneId", value)}
                      placeholder="Select zone"
                      searchPlaceholder="Search zones..."
                      options={filteredZones.map((zone) => ({
                        value: String(zone.id),
                        label: zone.name,
                      }))}
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
                      value={fields.cellAddress}
                      onChange={(e) => setField("cellAddress", e.target.value)}
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
                    Cell leader
                  </label>
                  <div className="relative">
                    {isLoadingLeaders ? (
                      <Skeleton className="h-12 w-full rounded-xl" />
                    ) : (
                      <Combobox
                        value={fields.cellLeaderId}
                        onChange={(value) => setField("cellLeaderId", value)}
                        placeholder="Optional — select cell leader"
                        searchPlaceholder="Search leaders..."
                        className="h-12 pl-12"
                        options={leaderOptions.map((member) => ({
                          value: String(member.id),
                          label: [member.first_name, member.last_name]
                            .filter(Boolean)
                            .join(" "),
                        }))}
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Meeting Day
                  </label>
                  <div className="relative">
                    <Combobox
                      value={fields.meetingDay}
                      onChange={(value) => setField("meetingDay", value)}
                      placeholder="Select meeting day"
                      searchPlaceholder="Search day..."
                      className="h-12 pl-12"
                      options={[
                        { value: "Monday", label: "Monday" },
                        { value: "Tuesday", label: "Tuesday" },
                        { value: "Wednesday", label: "Wednesday" },
                        { value: "Thursday", label: "Thursday" },
                        { value: "Friday", label: "Friday" },
                        { value: "Saturday", label: "Saturday" },
                        { value: "Sunday", label: "Sunday" },
                      ]}
                    />
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
            disabled={isSaving || !isValid}
            className="cursor-pointer px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
          >
            {isSaving ? (
              <Skeleton className="h-4 w-4 rounded-full bg-primary-foreground/40" />
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
