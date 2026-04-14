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
import { Plus, Search, MoreHorizontal, Layers } from "lucide-react";
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
import { listZones, deleteZone } from "@/lib/zones-api";
import type { Zone } from "@/types/zone";
import dayjs from "dayjs";
import { Skeleton } from "@/components/ui/skeleton";

export default function ZonesDirectoryPage() {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    void fetchZones();
  }, []);

  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const data = await listZones();
      setZones(data);
    } catch (error) {
      console.error("Failed to fetch zones:", error);
      toast.error("Failed to load zones");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = zones.filter(
    (z) =>
      z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.area_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.state_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteZone(deleteTarget.id);
      toast.success("Zone removed", {
        description: `${deleteTarget.name} was removed.`,
      });
      setZones((prev) => prev.filter((z) => z.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete zone");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zones</h1>
          <p className="text-muted-foreground mt-1">
            Manage zones under areas in {user?.unitName ?? "your region"}.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/app/zones/new">
            <Plus />
            New zone
          </Link>
        </Button>
      </div>

      <Card className="border-none bg-white max-w-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-violet-50 text-violet-600">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Total zones
              </p>
              <h3 className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-7 w-10" /> : zones.length}
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
                placeholder="Search by zone, area, or state..."
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
                  key={`zones-skeleton-${i}`}
                  className="grid grid-cols-6 gap-4"
                >
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
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
                  <TableHead>Zone</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Zonal leader (ID)</TableHead>
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
                    <TableCell className="font-medium">
                      {row.area_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.state_name}
                    </TableCell>
                    <TableCell>{row.zonal_leader}</TableCell>
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
                            <Link href={`/app/zones/${row.id}`}>View zone</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/app/zones/${row.id}/edit`}>
                              Edit zone
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
                            Delete zone
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
              No zones match your search.
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this zone?"
        description="Cells and members under this zone may be affected. This cannot be undone."
        itemName={deleteTarget?.name}
        confirmLabel="Yes, delete zone"
        isLoading={deleteLoading}
      />
    </div>
  );
}
