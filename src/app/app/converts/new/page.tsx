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
  UserPlus,
  Phone,
  MapPin,
  Save,
  Calendar,
  FileText,
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
import type { IntegrationStatus, MemberRecord } from "@/types/models";
import type { Zone } from "@/types/zone";
import { Skeleton } from "@/components/ui/skeleton";
import { Combobox } from "@/components/ui/combobox";

export default function NewConvertPage() {
  const router = useRouter();
  const { user } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [cells, setCells] = useState<Cell[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [officers, setOfficers] = useState<MemberRecord[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cellId, setCellId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [salvationDate, setSalvationDate] = useState("");
  const [howWon, setHowWon] = useState("GLOBAL_OUTREACH");
  const [followUpOfficer, setFollowUpOfficer] = useState("");
  const [integrationStatus, setIntegrationStatus] =
    useState<IntegrationStatus>("PENDING");
  const [initialNotes, setInitialNotes] = useState("");
  const [nokName, setNokName] = useState("");
  const [nokPhone, setNokPhone] = useState("");

  useEffect(() => {
    void Promise.all([listCells(), listZones(), listMembers()])
      .then(([cellRows, zoneRows, memberRows]) => {
        setCells(cellRows);
        setZones(zoneRows);
        setOfficers(memberRows);
      })
      .catch(() => toast.error("Could not load assignment options."));
  }, []);

  const cellNum = Number.parseInt(cellId, 10);
  const zoneNum = Number.parseInt(zoneId, 10);
  const followUpNum = Number.parseInt(followUpOfficer, 10);
  const filteredCells = useMemo(() => {
    if (!Number.isFinite(zoneNum) || zoneId.trim() === "") return [];
    return cells.filter((cell) => cell.zone === zoneNum);
  }, [cells, zoneId, zoneNum]);
  const isValid =
    firstName.trim().length > 0 &&
    Number.isFinite(zoneNum) &&
    Number.isFinite(cellNum) &&
    phone.trim().length >= 7;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSaving(true);
    try {
      await createMember({
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        zone: zoneNum,
        cell: cellNum,
        status: "NEW_CONVERT",
        phone_number: phone.trim(),
        residential_address: address.trim() || undefined,
        nok_name: nokName.trim() || undefined,
        nok_phone: nokPhone.trim() || undefined,
        date_joined: new Date().toISOString().slice(0, 10),
        salvation_date: salvationDate || undefined,
        how_won: howWon,
        follow_up_officer: Number.isFinite(followUpNum) ? followUpNum : null,
        integration_status: integrationStatus,
        initial_notes: initialNotes.trim() || undefined,
      });
      toast.success("Convert registered!", {
        description: "They have been added to the follow-up list.",
      });
      router.push("/app/converts");
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
          href="/app/converts"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Converts
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Register New Convert
        </h1>
        <p className="text-muted-foreground">
          Log a new soul won for Christ and assign them for follow-up in{" "}
          {user?.unitName}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-10">
        <div className="grid gap-8">
          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Personal Details</CardTitle>
                  <CardDescription>
                    Identity and contact information.
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
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
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
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="080..."
                      className="w-full h-12 pl-12 pr-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Current Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Where they currently reside"
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
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Spiritual Milestones</CardTitle>
                  <CardDescription>
                    When and how they received Christ.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Salvation Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={salvationDate}
                      onChange={(e) => setSalvationDate(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    How were they won?
                  </label>
                  <Combobox
                    value={howWon}
                    onChange={setHowWon}
                    placeholder="Select source"
                    searchPlaceholder="Search source..."
                    options={[
                      { value: "GLOBAL_OUTREACH", label: "Global Outreach" },
                      {
                        value: "PERSONAL_INVITATION",
                        label: "Personal Invitation",
                      },
                      { value: "ONLINE", label: "Online" },
                      { value: "OTHER", label: "Other" },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Cell <span className="text-destructive">*</span>
                  </label>
                  <Combobox
                    value={cellId}
                    onChange={(value) => {
                      setCellId(value);
                      const selectedCell = cells.find(
                        (cell) => String(cell.id) === value,
                      );
                      if (selectedCell?.zone != null) {
                        setZoneId(String(selectedCell.zone));
                      }
                    }}
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
                    Zone <span className="text-destructive">*</span>
                  </label>
                  <Combobox
                    value={zoneId}
                    onChange={(value) => {
                      setZoneId(value);
                      setCellId("");
                    }}
                    placeholder="Select zone"
                    searchPlaceholder="Search zones..."
                    options={zones.map((zone) => ({
                      value: String(zone.id),
                      label: zone.name,
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Follow-up Status</CardTitle>
                  <CardDescription>
                    Initial notes and cell assignment.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Assigned Cell
                  </label>
                  <Combobox
                    value={cellId}
                    onChange={setCellId}
                    placeholder="Select a cell"
                    searchPlaceholder="Search cells..."
                    options={cells.map((cell) => ({
                      value: String(cell.id),
                      label: cell.name,
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Follow-up Officer
                  </label>
                  <Combobox
                    value={followUpOfficer}
                    onChange={setFollowUpOfficer}
                    placeholder="Select follow-up officer (optional)"
                    searchPlaceholder="Search officers..."
                    options={officers.map((officer) => ({
                      value: String(officer.id),
                      label: [officer.first_name, officer.last_name]
                        .filter(Boolean)
                        .join(" "),
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Integration Status
                  </label>
                  <Combobox
                    value={integrationStatus}
                    onChange={(value) =>
                      setIntegrationStatus(value as IntegrationStatus)
                    }
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
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    NOK Name
                  </label>
                  <input
                    value={nokName}
                    onChange={(e) => setNokName(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    NOK Phone
                  </label>
                  <input
                    value={nokPhone}
                    onChange={(e) => setNokPhone(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Initial Notes
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 h-4 w-4 text-muted-foreground" />
                    <textarea
                      value={initialNotes}
                      onChange={(e) => setInitialNotes(e.target.value)}
                      placeholder="Any specific needs or prayer points?"
                      className="w-full min-h-[120px] pl-12 pr-4 py-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium resize-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6">
          <Link
            href="/app/converts"
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
            Register Convert
          </button>
        </div>
      </form>
    </div>
  );
}
