"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui/dashboard-cards";
import Link from "next/link";
import { ArrowLeft, MoreHorizontal, Trash2, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AttendanceRecord } from "@/types/models";
import { deleteAttendance, getAttendance } from "@/lib/attendance-api";
import { extractErrorMessage } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AttendanceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const raw = Array.isArray(idParam) ? idParam[0] : idParam;
  const idNum = raw ? Number.parseInt(raw, 10) : NaN;
  const [row, setRow] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const data = await getAttendance(idNum);
        if (!cancelled) setRow(data);
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load attendance report", {
            description: extractErrorMessage(error),
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idNum]);

  const onDelete = async () => {
    if (!row) return;
    setIsDeleting(true);
    try {
      await deleteAttendance(row.id);
      toast.success("Attendance report deleted");
      router.push("/app/attendance");
    } catch (error) {
      toast.error("Delete failed", { description: extractErrorMessage(error) });
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading attendance report...</p>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <p className="text-muted-foreground font-bold text-center">
          Attendance report not found.
        </p>
        <Link
          href="/app/attendance"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to history
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/app/attendance"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to history
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="cursor-pointer inline-flex h-10 items-center gap-2 rounded-xl border bg-background px-4 text-sm font-semibold hover:bg-accent"
            >
              <MoreHorizontal className="h-4 w-4" />
              Actions
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => {
                e.preventDefault();
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="border-none bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{row.cell_name}</h1>
              <p className="text-muted-foreground">
                {new Date(row.date).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="secondary">{row.total_present} present</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <p>
            <span className="text-muted-foreground">First timers:</span>{" "}
            {row.first_timers}
          </p>
          <p>
            <span className="text-muted-foreground">New converts:</span>{" "}
            {row.new_converts}
          </p>
          <p>
            <span className="text-muted-foreground">Created:</span>{" "}
            {new Date(row.created_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card className="border-none bg-white">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members Present ({row.member_details.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {row.member_details.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No member details were returned in this report.
            </p>
          ) : (
            row.member_details.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {[member.first_name, member.last_name].join(" ")}
                  </p>
                  <p className="text-muted-foreground">{member.phone_number}</p>
                </div>
                <Badge variant="outline">{member.status_display}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => !isDeleting && setDeleteOpen(false)}
        onConfirm={onDelete}
        title="Delete this attendance report?"
        description="This attendance submission will be permanently removed."
        itemName={`${row.cell_name} (${new Date(row.date).toLocaleDateString()})`}
        confirmLabel="Yes, delete report"
        isLoading={isDeleting}
      />
    </div>
  );
}
