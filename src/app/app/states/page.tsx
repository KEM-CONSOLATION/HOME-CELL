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
import { Plus, Search, MoreHorizontal, Landmark } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { listStatesPage, deleteState } from "@/lib/states-api";
import type { State } from "@/types/state";
import dayjs from "dayjs";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function StatesDirectoryPage() {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<State | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    void fetchStates(page);
  }, [page]);

  const fetchStates = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const data = await listStatesPage(currentPage);
      setStates(data.items);
      setTotalCount(data.count);
      setHasNext(Boolean(data.next));
      setHasPrevious(Boolean(data.previous));
    } catch (error) {
      console.error("Failed to fetch states:", error);
      toast.error("Failed to load states");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = states.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteState(deleteTarget.id);
      toast.success("State removed", {
        description: `${deleteTarget.name} was removed.`,
      });
      setStates((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete state");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">States</h1>
          <p className="text-muted-foreground mt-1">
            Manage state records and state pastor assignment for{" "}
            {user?.unitName ?? "your jurisdiction"}.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/app/states/new">
            <Plus />
            New state
          </Link>
        </Button>
      </div>

      <Card className="border-none bg-white max-w-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Total states
              </p>
              <h3 className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-7 w-10" /> : states.length}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-white">
        <CardHeader className="pb-4 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by state name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 px-6 py-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`states-skeleton-${i}`}
                  className="grid grid-cols-4 gap-4"
                >
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <TableHead>State</TableHead>
                  <TableHead>State pastor (ID)</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {row.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold">{row.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ID {row.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{row.state_pastor}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {dayjs(row.created_at).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-background hover:bg-accent transition-colors"
                            aria-label={`Actions for ${row.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem asChild>
                            <Link href={`/app/states/${row.id}`}>
                              View state
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/app/states/${row.id}/edit`}>
                              Edit state
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              setDeleteTarget(row);
                            }}
                          >
                            Delete state
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">
              No states match your search.
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
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this state?"
        description="Areas and downstream records may be affected. This cannot be undone."
        itemName={deleteTarget?.name}
        confirmLabel="Yes, delete state"
        isLoading={deleteLoading}
      />
    </div>
  );
}
