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
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  MemberWriteStatus,
  IntegrationStatus,
  MemberRecord,
} from "@/types/models";
import type { Cell } from "@/types/cell";
import { getMember, listMembers, updateMember } from "@/lib/members-api";
import { listCells } from "@/lib/cells-api";
import { listZones } from "@/lib/zones-api";
import type { Zone } from "@/types/zone";
import { extractErrorMessage } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Combobox } from "@/components/ui/combobox";
import { useFormFields } from "@/hooks/use-form-fields";

const editMemberInitialFields = {
  firstName: "",
  lastName: "",
  cellId: "",
  zoneId: "",
  status: "MEMBER",
  phone: "",
  address: "",
  nokName: "",
  nokPhone: "",
  dateJoined: "",
  salvationDate: "",
  howWon: "",
  followUpOfficer: "",
  integrationStatus: "PENDING",
  initialNotes: "",
};

export default function EditMemberPage() {
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
  const { fields, setField, setFields } = useFormFields(
    editMemberInitialFields,
  );

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
        setFields({
          firstName: row.first_name,
          lastName: row.last_name ?? "",
          cellId: String(row.cell),
          status:
            row.status === "CELL_LEADER"
              ? "MEMBER"
              : (row.status as MemberWriteStatus),
          phone: row.phone_number,
          address: row.residential_address ?? "",
          nokName: row.nok_name ?? "",
          nokPhone: row.nok_phone ?? "",
          dateJoined: row.date_joined ?? "",
          salvationDate: row.salvation_date ?? "",
          howWon: row.how_won ?? "",
          followUpOfficer:
            row.follow_up_officer != null ? String(row.follow_up_officer) : "",
          integrationStatus: row.integration_status as IntegrationStatus,
          initialNotes: row.initial_notes ?? "",
        });
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

  const cellNum = Number.parseInt(fields.cellId, 10);
  const zoneNum = Number.parseInt(fields.zoneId, 10);
  const followUpNum = Number.parseInt(fields.followUpOfficer, 10);
  const filteredCells = useMemo(() => {
    if (!Number.isFinite(zoneNum) || fields.zoneId.trim() === "") return [];
    return cells.filter((cell) => cell.zone === zoneNum);
  }, [cells, fields.zoneId, zoneNum]);

  useEffect(() => {
    if (!fields.cellId || fields.zoneId) return;
    const selectedCell = cells.find(
      (cell) => String(cell.id) === fields.cellId,
    );
    if (selectedCell?.zone != null) {
      setField("zoneId", String(selectedCell.zone));
    }
  }, [fields.cellId, fields.zoneId, cells, setField]);

  const isValid =
    fields.firstName.trim().length > 0 &&
    Number.isFinite(zoneNum) &&
    Number.isFinite(cellNum) &&
    fields.phone.trim().length >= 7;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !Number.isFinite(idNum)) return;
    setIsSaving(true);
    try {
      await updateMember(idNum, {
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
        how_won: fields.howWon || undefined,
        follow_up_officer: Number.isFinite(followUpNum) ? followUpNum : null,
        integration_status: fields.integrationStatus as IntegrationStatus,
        initial_notes: fields.initialNotes.trim() || undefined,
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
              value={fields.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              placeholder="First name"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              value={fields.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              placeholder="Last name"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              value={fields.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="Phone number"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <Combobox
              value={fields.status}
              onChange={(value) => setField("status", value)}
              placeholder="Select status"
              searchPlaceholder="Search status..."
              options={[
                { value: "MEMBER", label: "Member" },
                { value: "WORKER", label: "Worker" },
                { value: "NEW_CONVERT", label: "New convert" },
              ]}
            />
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
            <Combobox
              value={fields.cellId}
              onChange={(value) => setField("cellId", value)}
              disabled={!Number.isFinite(zoneNum)}
              placeholder="Select cell"
              searchPlaceholder="Search cells..."
              options={filteredCells.map((cell) => ({
                value: String(cell.id),
                label: `${cell.name} (#${cell.id})`,
              }))}
            />
            <input
              value={fields.nokName}
              onChange={(e) => setField("nokName", e.target.value)}
              placeholder="Next of kin name"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              value={fields.nokPhone}
              onChange={(e) => setField("nokPhone", e.target.value)}
              placeholder="Next of kin phone"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              type="date"
              value={fields.dateJoined}
              onChange={(e) => setField("dateJoined", e.target.value)}
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              type="date"
              value={fields.salvationDate}
              onChange={(e) => setField("salvationDate", e.target.value)}
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <input
              value={fields.howWon}
              onChange={(e) => setField("howWon", e.target.value)}
              placeholder="How won"
              className="h-11 px-3 rounded-lg border bg-slate-50"
            />
            <Combobox
              value={fields.followUpOfficer}
              onChange={(value) => setField("followUpOfficer", value)}
              placeholder="Select follow-up officer (optional)"
              searchPlaceholder="Search officers..."
              options={officers.map((officer) => ({
                value: String(officer.id),
                label: [officer.first_name, officer.last_name]
                  .filter(Boolean)
                  .join(" "),
              }))}
            />
            <input
              value={fields.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Residential address"
              className="h-11 px-3 rounded-lg border bg-slate-50 md:col-span-2"
            />
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
              className="md:col-span-2"
            />
            <textarea
              value={fields.initialNotes}
              onChange={(e) => setField("initialNotes", e.target.value)}
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
