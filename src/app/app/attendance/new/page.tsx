"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Cell } from "@/types/cell";
import type { MemberRecord } from "@/types/models";
import { listCells } from "@/lib/cells-api";
import { listMembers } from "@/lib/members-api";
import { createAttendance } from "@/lib/attendance-api";
import { extractErrorMessage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Combobox } from "@/components/ui/combobox";

export default function NewAttendancePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCells, setIsLoadingCells] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [cells, setCells] = useState<Cell[]>([]);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [cellId, setCellId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [firstTimers, setFirstTimers] = useState("0");
  const [newConverts, setNewConverts] = useState("0");
  const [presentIds, setPresentIds] = useState<number[]>([]);

  useEffect(() => {
    void listCells()
      .then(setCells)
      .catch(() => setCells([]))
      .finally(() => setIsLoadingCells(false));
    void listMembers()
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setIsLoadingMembers(false));
  }, []);

  const cellNum = Number.parseInt(cellId, 10);
  const firstTimersNum = Number.parseInt(firstTimers, 10) || 0;
  const newConvertsNum = Number.parseInt(newConverts, 10) || 0;
  const visibleMembers = useMemo(() => {
    if (!Number.isFinite(cellNum)) return [];
    return members.filter((m) => m.cell === cellNum);
  }, [members, cellNum]);

  const togglePresent = (id: number) => {
    setPresentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const isValid = Number.isFinite(cellNum) && date.length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSaving(true);
    try {
      await createAttendance({
        cell: cellNum,
        date,
        members_present: presentIds,
        first_timers: Math.max(0, firstTimersNum),
        new_converts: Math.max(0, newConvertsNum),
      });
      toast.success("Attendance submitted");
      router.push("/app/attendance");
    } catch (error) {
      toast.error("Failed to submit attendance", {
        description: extractErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/app/attendance">
            <ChevronLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Submit Weekly Attendance
          </h1>
          <p className="text-sm text-muted-foreground">
            Member roll call and submission will connect when your attendance
            API is available.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 pb-10">
        <Card className="border-none bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 rounded-3xl">
          <CardHeader>
            <CardTitle>Report details</CardTitle>
            <CardDescription>
              Submit attendance for a cell and date.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Cell</label>
              {isLoadingCells ? (
                <Skeleton className="h-11 w-full rounded-lg" />
              ) : (
                <Combobox
                  value={cellId}
                  onChange={(value) => {
                    setCellId(value);
                    setPresentIds([]);
                  }}
                  placeholder="Select cell"
                  searchPlaceholder="Search cells..."
                  options={cells.map((cell) => ({
                    value: String(cell.id),
                    label: `${cell.name} (#${cell.id})`,
                  }))}
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Meeting Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">First Timers</label>
              <input
                type="number"
                min={0}
                value={firstTimers}
                onChange={(e) => setFirstTimers(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">New Converts</label>
              <input
                type="number"
                min={0}
                value={newConverts}
                onChange={(e) => setNewConverts(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border bg-slate-50"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white rounded-3xl">
          <CardHeader>
            <CardTitle>Members Present ({presentIds.length})</CardTitle>
            <CardDescription>
              Select members who attended. `Total Present` is auto-calculated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMembers ? (
              <div className="grid gap-2 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`attendance-member-skeleton-${index}`}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    <Skeleton className="h-4 w-4 rounded-sm" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </div>
            ) : visibleMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Select a cell to load members.
              </p>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {visibleMembers.map((member) => {
                  const checked = presentIds.includes(member.id);
                  const label = [member.first_name, member.last_name]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePresent(member.id)}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link
            href="/app/attendance"
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
            Submit Attendance
          </button>
        </div>
      </form>
    </div>
  );
}
