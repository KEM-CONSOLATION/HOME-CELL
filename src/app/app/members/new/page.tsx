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
  UserCircle2,
  Phone,
  MapPin,
  Save,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createMember, listMembers } from "@/lib/members-api";
import { listCells } from "@/lib/cells-api";
import { listZones } from "@/lib/zones-api";
import { extractErrorMessage } from "@/lib/utils";
import type { Cell } from "@/types/cell";
import type {
  IntegrationStatus,
  MemberRecord,
  MemberWriteStatus,
} from "@/types/models";
import type { Zone } from "@/types/zone";
import { Skeleton } from "@/components/ui/skeleton";
import { Combobox } from "@/components/ui/combobox";
import { useFormFields } from "@/hooks/use-form-fields";

const newMemberInitialFields = {
  firstName: "",
  lastName: "",
  cellId: "",
  zoneId: "",
  status: "MEMBER",
  phone: "",
  address: "",
  nokName: "",
  nokPhone: "",
  dateJoined: new Date().toISOString().slice(0, 10),
  salvationDate: "",
  howWon: "GLOBAL_OUTREACH",
  followUpOfficer: "",
  integrationStatus: "PENDING",
  initialNotes: "",
};

export default function NewMemberPage() {
  const router = useRouter();
  const { user } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [cells, setCells] = useState<Cell[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [officers, setOfficers] = useState<MemberRecord[]>([]);
  const { fields, setField, setFields } = useFormFields(newMemberInitialFields);

  useEffect(() => {
    void Promise.all([listCells(), listZones(), listMembers()])
      .then(([cellRows, zoneRows, memberRows]) => {
        setCells(cellRows);
        setZones(zoneRows);
        setOfficers(memberRows);
      })
      .catch(() => toast.error("Could not load assignment options."));
  }, []);

  const cellNum = Number.parseInt(fields.cellId, 10);
  const zoneNum = Number.parseInt(fields.zoneId, 10);
  const followUpNum = Number.parseInt(fields.followUpOfficer, 10);
  const filteredCells = useMemo(() => {
    if (!Number.isFinite(zoneNum) || fields.zoneId.trim() === "") return [];
    return cells.filter((cell) => cell.zone === zoneNum);
  }, [cells, fields.zoneId, zoneNum]);
  const isValid =
    fields.firstName.trim().length > 0 &&
    Number.isFinite(zoneNum) &&
    Number.isFinite(cellNum) &&
    fields.phone.trim().length >= 7;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSaving(true);
    try {
      await createMember({
        first_name: fields.firstName.trim(),
        last_name: fields.lastName.trim() || undefined,
        zone: zoneNum,
        cell: cellNum,
        status: fields.status as MemberWriteStatus,
        phone_number: fields.phone.trim(),
        residential_address: fields.address.trim() || undefined,
        nok_name: fields.nokName.trim() || undefined,
        nok_phone: fields.nokPhone.trim() || undefined,
        date_joined: fields.dateJoined || undefined,
        salvation_date: fields.salvationDate || undefined,
        how_won: fields.howWon,
        follow_up_officer: Number.isFinite(followUpNum) ? followUpNum : null,
        integration_status: fields.integrationStatus as IntegrationStatus,
        initial_notes: fields.initialNotes.trim() || undefined,
      });
      toast.success("Member added successfully!", {
        description: "They are now visible in your member directory.",
      });
      router.push("/app/members");
    } catch (error) {
      toast.error("Creation failed", {
        description: extractErrorMessage(error, "Please check the details."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Link
          href="/app/members"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Add New Member</h1>
        <p className="text-muted-foreground">
          Register a new individual to the {user?.unitName} database.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-10">
        <div className="grid gap-8">
          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Legal name and contact details.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={fields.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    placeholder="Enter first name"
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={fields.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    placeholder="Enter last name"
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={fields.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="080..."
                      className="w-full h-12 pl-12 pr-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Residential Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={fields.address}
                      onChange={(e) => setField("address", e.target.value)}
                      placeholder="Enter full house address"
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
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Membership and Assignment</CardTitle>
                  <CardDescription>
                    Set role, cell assignment, and dates.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Member Role
                  </label>
                  <Combobox
                    value={fields.status}
                    onChange={(value) => setField("status", value)}
                    placeholder="Select role"
                    searchPlaceholder="Search role..."
                    options={[
                      { value: "MEMBER", label: "Regular Member" },
                      { value: "WORKER", label: "Worker" },
                      { value: "NEW_CONVERT", label: "New Convert" },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Join Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={fields.dateJoined}
                      onChange={(e) => setField("dateJoined", e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Zone <span className="text-destructive">*</span>
                  </label>
                  <Combobox
                    value={fields.zoneId}
                    onChange={(value) => {
                      setFields({
                        zoneId: value,
                        cellId: "",
                      });
                    }}
                    placeholder="Select zone"
                    searchPlaceholder="Search zones..."
                    options={zones.map((zone) => ({
                      value: String(zone.id),
                      label: zone.name,
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Cell <span className="text-destructive">*</span>
                  </label>
                  <Combobox
                    value={fields.cellId}
                    onChange={(value) => setField("cellId", value)}
                    disabled={!Number.isFinite(zoneNum)}
                    placeholder="Select a cell"
                    searchPlaceholder="Search cells..."
                    options={filteredCells.map((cell) => ({
                      value: String(cell.id),
                      label: `${cell.name} (#${cell.id})`,
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Integration Status
                  </label>
                  <Combobox
                    value={fields.integrationStatus}
                    onChange={(value) => setField("integrationStatus", value)}
                    placeholder="Select integration status"
                    searchPlaceholder="Search status..."
                    options={[
                      { value: "PENDING", label: "Pending" },
                      { value: "IN_PROGRESS", label: "In Progress" },
                      { value: "INTEGRATED", label: "Integrated" },
                      { value: "COMPLETED", label: "Completed" },
                    ]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Extra Details</CardTitle>
                  <CardDescription>
                    Emergency contacts and follow-up metadata.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    NOK Name
                  </label>
                  <input
                    type="text"
                    value={fields.nokName}
                    onChange={(e) => setField("nokName", e.target.value)}
                    placeholder="Next of kin name"
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    NOK Phone
                  </label>
                  <input
                    type="tel"
                    value={fields.nokPhone}
                    onChange={(e) => setField("nokPhone", e.target.value)}
                    placeholder="Next of kin phone"
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Salvation Date
                  </label>
                  <input
                    type="date"
                    value={fields.salvationDate}
                    onChange={(e) => setField("salvationDate", e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    How Won
                  </label>
                  <input
                    type="text"
                    value={fields.howWon}
                    onChange={(e) => setField("howWon", e.target.value)}
                    placeholder="GLOBAL_OUTREACH"
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Follow-up Officer
                  </label>
                  <Combobox
                    value={fields.followUpOfficer}
                    onChange={(value) => setField("followUpOfficer", value)}
                    placeholder="Select officer (optional)"
                    searchPlaceholder="Search officers..."
                    options={officers.map((officer) => ({
                      value: String(officer.id),
                      label: [officer.first_name, officer.last_name]
                        .filter(Boolean)
                        .join(" "),
                    }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Initial Notes
                  </label>
                  <textarea
                    value={fields.initialNotes}
                    onChange={(e) => setField("initialNotes", e.target.value)}
                    className="w-full min-h-[100px] px-4 py-3 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6">
          <Link
            href="/app/members"
            className="px-6 py-3 rounded-lg border font-bold text-sm hover:bg-slate-50 transition-colors"
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
            Add Member to Cell
          </button>
        </div>
      </form>
    </div>
  );
}
