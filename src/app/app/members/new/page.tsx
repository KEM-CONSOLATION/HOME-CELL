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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createMember } from "@/lib/members-api";
import { listCells } from "@/lib/cells-api";
import { extractErrorMessage } from "@/lib/utils";
import type { Cell } from "@/types/cell";
import type { IntegrationStatus, MemberWriteStatus } from "@/types/models";

export default function NewMemberPage() {
  const router = useRouter();
  const { user } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [cells, setCells] = useState<Cell[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cellId, setCellId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [status, setStatus] = useState<MemberWriteStatus>("MEMBER");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nokName, setNokName] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [dateJoined, setDateJoined] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [salvationDate, setSalvationDate] = useState("");
  const [howWon, setHowWon] = useState("GLOBAL_OUTREACH");
  const [followUpOfficer, setFollowUpOfficer] = useState("");
  const [integrationStatus, setIntegrationStatus] =
    useState<IntegrationStatus>("PENDING");
  const [initialNotes, setInitialNotes] = useState("");

  useEffect(() => {
    void listCells()
      .then(setCells)
      .catch(() => toast.error("Could not load cells. Enter ID manually."));
  }, []);

  const cellNum = Number.parseInt(cellId, 10);
  const zoneNum = Number.parseInt(zoneId, 10);
  const followUpNum = Number.parseInt(followUpOfficer, 10);
  const isValid =
    firstName.trim().length > 0 &&
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
        zone: Number.isFinite(zoneNum) ? zoneNum : undefined,
        cell: cellNum,
        status,
        phone_number: phone.trim(),
        residential_address: address.trim() || undefined,
        nok_name: nokName.trim() || undefined,
        nok_phone: nokPhone.trim() || undefined,
        date_joined: dateJoined || undefined,
        salvation_date: salvationDate || undefined,
        how_won: howWon,
        follow_up_officer: Number.isFinite(followUpNum) ? followUpNum : null,
        integration_status: integrationStatus,
        initial_notes: initialNotes.trim() || undefined,
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
                    Residential Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
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
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as MemberWriteStatus)
                    }
                    className="cursor-pointer w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium appearance-none"
                  >
                    <option value="MEMBER">Regular Member</option>
                    <option value="WORKER">Worker</option>
                    <option value="NEW_CONVERT">New Convert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Join Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={dateJoined}
                      onChange={(e) => setDateJoined(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Cell ID <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={cellId}
                    onChange={(e) => setCellId(e.target.value)}
                    className="cursor-pointer w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium appearance-none"
                  >
                    <option value="">Select a cell</option>
                    {cells.map((cell) => (
                      <option key={cell.id} value={cell.id}>
                        {cell.name} (#{cell.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Zone ID (Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Integration Status
                  </label>
                  <select
                    value={integrationStatus}
                    onChange={(e) =>
                      setIntegrationStatus(e.target.value as IntegrationStatus)
                    }
                    className="cursor-pointer w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium appearance-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="INTEGRATED">Integrated</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
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
                    value={nokName}
                    onChange={(e) => setNokName(e.target.value)}
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
                    value={nokPhone}
                    onChange={(e) => setNokPhone(e.target.value)}
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
                    value={salvationDate}
                    onChange={(e) => setSalvationDate(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    How Won
                  </label>
                  <input
                    type="text"
                    value={howWon}
                    onChange={(e) => setHowWon(e.target.value)}
                    placeholder="GLOBAL_OUTREACH"
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Follow-up Officer ID
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={followUpOfficer}
                    onChange={(e) => setFollowUpOfficer(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Initial Notes
                  </label>
                  <textarea
                    value={initialNotes}
                    onChange={(e) => setInitialNotes(e.target.value)}
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
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
