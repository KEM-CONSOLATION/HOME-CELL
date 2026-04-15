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
import type { IntegrationStatus, MemberRecord } from "@/types/models";
import type { Cell } from "@/types/cell";
import { getMember, listMembers, updateMember } from "@/lib/members-api";
import { listCells } from "@/lib/cells-api";
import { listZones } from "@/lib/zones-api";
import type { Zone } from "@/types/zone";
import { extractErrorMessage } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Combobox } from "@/components/ui/combobox";

export default function EditConvertPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const raw = Array.isArray(idParam) ? idParam[0] : idParam;
  const idNum = raw ? Number.parseInt(raw, 10) : NaN;

  const [cells, setCells] = useState<Cell[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [officers, setOfficers] = useState<MemberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cellId, setCellId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateJoined, setDateJoined] = useState("");
  const [salvationDate, setSalvationDate] = useState("");
  const [howWon, setHowWon] = useState("");
  const [followUpOfficer, setFollowUpOfficer] = useState("");
  const [integrationStatus, setIntegrationStatus] =
    useState<IntegrationStatus>("PENDING");
  const [initialNotes, setInitialNotes] = useState("");
  const [nokName, setNokName] = useState("");
  const [nokPhone, setNokPhone] = useState("");

  useEffect(() => {
    void Promise.all([
      listCells().catch(() => [] as Cell[]),
      listZones().catch(() => [] as Zone[]),
      listMembers().catch(() => [] as MemberRecord[]),
    ]).then(([cellRows, zoneRows, memberRows]) => {
      setCells(cellRows);
      setZones(zoneRows);
      setOfficers(memberRows);
    });
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
          toast.error("Failed to load convert", {
            description: extractErrorMessage(error),
          });
          router.push("/app/converts");
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
        status: "NEW_CONVERT",
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
      toast.success("Convert updated");
      router.push(`/app/converts/${idNum}`);
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
                key={`convert-edit-skeleton-${i}`}
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
        href={
          Number.isFinite(idNum) ? `/app/converts/${idNum}` : "/app/converts"
        }
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to convert
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Edit convert</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none bg-white">
          <CardHeader>
            <CardTitle>Convert details</CardTitle>
            <CardDescription>Update follow-up information.</CardDescription>
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
            <Combobox
              value={cellId}
              onChange={setCellId}
              placeholder="Select cell"
              searchPlaceholder="Search cells..."
              options={cells.map((cell) => ({
                value: String(cell.id),
                label: `${cell.name} (#${cell.id})`,
              }))}
            />
            <Combobox
              value={zoneId}
              onChange={setZoneId}
              placeholder="Select zone (optional)"
              searchPlaceholder="Search zones..."
              options={zones.map((zone) => ({
                value: String(zone.id),
                label: zone.name,
              }))}
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
              value={nokPhone}
              onChange={(e) => setNokPhone(e.target.value)}
              placeholder="Next of kin phone"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
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
              className="md:col-span-2"
            />
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
              Number.isFinite(idNum)
                ? `/app/converts/${idNum}`
                : "/app/converts"
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
