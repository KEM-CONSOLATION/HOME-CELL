"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/dashboard-cards";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MemberWriteStatus, IntegrationStatus } from "@/types/models";
import type { Cell } from "@/types/cell";
import { getMember, updateMember } from "@/lib/members-api";
import { listCells } from "@/lib/cells-api";
import { extractErrorMessage } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const raw = Array.isArray(idParam) ? idParam[0] : idParam;
  const idNum = raw ? Number.parseInt(raw, 10) : NaN;
  const [cells, setCells] = useState<Cell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cellId, setCellId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [status, setStatus] = useState<MemberWriteStatus>("MEMBER");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nokName, setNokName] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [dateJoined, setDateJoined] = useState("");
  const [salvationDate, setSalvationDate] = useState("");
  const [howWon, setHowWon] = useState("");
  const [followUpOfficer, setFollowUpOfficer] = useState("");
  const [integrationStatus, setIntegrationStatus] =
    useState<IntegrationStatus>("PENDING");
  const [initialNotes, setInitialNotes] = useState("");

  useEffect(() => {
    void listCells()
      .then(setCells)
      .catch(() => setCells([]));
  }, []);

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const row = await getMember(idNum);
        if (cancelled) return;
        setFirstName(row.first_name);
        setLastName(row.last_name ?? "");
        setCellId(String(row.cell));
        setStatus(row.status === "CELL_LEADER" ? "MEMBER" : row.status);
        setPhone(row.phone_number);
        setAddress(row.residential_address ?? "");
        setNokName(row.nok_name ?? "");
        setNokPhone(row.nok_phone ?? "");
        setDateJoined(row.date_joined ?? "");
        setSalvationDate(row.salvation_date ?? "");
        setHowWon(row.how_won ?? "");
        setFollowUpOfficer(
          row.follow_up_officer != null ? String(row.follow_up_officer) : "",
        );
        setIntegrationStatus(row.integration_status);
        setInitialNotes(row.initial_notes ?? "");
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load member", {
            description: extractErrorMessage(error),
          });
          router.push("/app/members");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idNum, router]);

  const cellNum = Number.parseInt(cellId, 10);
  const zoneNum = Number.parseInt(zoneId, 10);
  const followUpNum = Number.parseInt(followUpOfficer, 10);
  const isValid =
    firstName.trim().length > 0 &&
    Number.isFinite(cellNum) &&
    phone.trim().length >= 7;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !Number.isFinite(idNum)) return;
    setIsSaving(true);
    try {
      await updateMember(idNum, {
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
        how_won: howWon || undefined,
        follow_up_officer: Number.isFinite(followUpNum) ? followUpNum : null,
        integration_status: integrationStatus,
        initial_notes: initialNotes.trim() || undefined,
      });
      toast.success("Member updated");
      router.push(`/app/members/${idNum}`);
    } catch (error) {
      toast.error("Update failed", {
        description: extractErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <Skeleton className="h-5 w-36" />
        <Card className="border-none bg-white">
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-52" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={`member-edit-skeleton-${i}`}
                className="h-10 w-full"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <Link
        href={Number.isFinite(idNum) ? `/app/members/${idNum}` : "/app/members"}
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to member
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Edit member</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none bg-white">
          <CardHeader>
            <CardTitle>Member details</CardTitle>
            <CardDescription>Update this member profile.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MemberWriteStatus)}
              className="h-11 px-3 rounded-lg border bg-slate-50"
            >
              <option value="MEMBER">Member</option>
              <option value="WORKER">Worker</option>
              <option value="NEW_CONVERT">New convert</option>
            </select>
            <select
              value={cellId}
              onChange={(e) => setCellId(e.target.value)}
              className="h-11 px-3 rounded-lg border bg-slate-50"
            >
              <option value="">Select cell</option>
              {cells.map((cell) => (
                <option key={cell.id} value={cell.id}>
                  {cell.name} (#{cell.id})
                </option>
              ))}
            </select>
            <input
              type="number"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              placeholder="Zone ID (optional)"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Residential address"
              className="h-11 px-3 rounded-lg border bg-slate-50 md:col-span-2"
            />
            <input
              value={nokName}
              onChange={(e) => setNokName(e.target.value)}
              placeholder="Next of kin name"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              value={nokPhone}
              onChange={(e) => setNokPhone(e.target.value)}
              placeholder="Next of kin phone"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              type="date"
              value={dateJoined}
              onChange={(e) => setDateJoined(e.target.value)}
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              type="date"
              value={salvationDate}
              onChange={(e) => setSalvationDate(e.target.value)}
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              value={howWon}
              onChange={(e) => setHowWon(e.target.value)}
              placeholder="How won"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              type="number"
              value={followUpOfficer}
              onChange={(e) => setFollowUpOfficer(e.target.value)}
              placeholder="Follow-up officer ID"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <select
              value={integrationStatus}
              onChange={(e) =>
                setIntegrationStatus(e.target.value as IntegrationStatus)
              }
              className="h-11 px-3 rounded-lg border bg-slate-50 md:col-span-2"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="INTEGRATED">Integrated</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <textarea
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
              placeholder="Initial notes"
              className="min-h-[110px] px-3 py-2 rounded-lg border bg-slate-50 resize-none md:col-span-2"
            />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Link
            href={
              Number.isFinite(idNum) ? `/app/members/${idNum}` : "/app/members"
            }
            className="px-5 py-2.5 rounded-lg border font-semibold text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!isValid || isSaving}
            className="cursor-pointer px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-50"
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
