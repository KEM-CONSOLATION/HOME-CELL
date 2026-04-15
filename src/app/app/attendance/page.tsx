"use client";

import { useStore } from "@/store";
import { Card, CardContent, CardHeader } from "@/components/ui/dashboard-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AttendanceRecord } from "@/types/models";
import { deleteAttendance, listAttendancePage } from "@/lib/attendance-api";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function AttendanceListPage() {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRecord | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const data = await listAttendancePage(page);
        if (!cancelled) {
          setRows(data.items);
          setTotalCount(data.count);
          setHasNext(Boolean(data.next));
          setHasPrevious(Boolean(data.previous));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load attendance", {
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
  }, [page]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const target = `${row.date} ${row.cell_name}`.toLowerCase();
      return target.includes(searchTerm.toLowerCase());
    });
  }, [rows, searchTerm]);

  const onConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteAttendance(deleteTarget.id);
      setRows((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast.success("Attendance report deleted");
    } catch (error) {
      toast.error("Failed to delete attendance", {
        description: extractErrorMessage(error),
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const loadingRowCount = 6;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Attendance History
          </h1>
          <p className="text-muted-foreground mt-1">
            Review weekly attendance reports for {user?.unitName}.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/app/attendance/new">
            <Plus />
            Submit Report
          </Link>
        </Button>
      </div>

      <Card className="border-none bg-white">
        <CardHeader className="pb-4 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by date or cell..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <TableHead>Date</TableHead>
                <TableHead>Cell</TableHead>
                <TableHead className="text-center">Attendance</TableHead>
                <TableHead className="text-center">New Souls</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: loadingRowCount }).map((_, index) => (
                    <TableRow key={`attendance-skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-2.5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-2.5 w-28" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="mx-auto h-2.5 w-10" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="mx-auto h-2.5 w-10" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Skeleton className="h-9 w-9 rounded-md" />
                          <Skeleton className="h-9 w-9 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : filteredRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {new Date(row.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{row.cell_name}</TableCell>
                      <TableCell className="text-center font-semibold">
                        {row.total_present}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.new_converts}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/app/attendance/${row.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {!isLoading && filteredRows.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm px-4">
              No attendance reports found.
            </p>
          )}
        </CardContent>
        <PaginationControls
          page={page}
          count={totalCount}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          isLoading={isLoading}
          onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setPage((prev) => prev + 1)}
        />
      </Card>
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={onConfirmDelete}
        title="Delete this attendance report?"
        description="This attendance submission will be permanently removed."
        itemName={
          deleteTarget
            ? `${deleteTarget.cell_name} (${new Date(deleteTarget.date).toLocaleDateString()})`
            : undefined
        }
        confirmLabel="Yes, delete report"
        isLoading={isDeleting}
      />
    </div>
  );
}
