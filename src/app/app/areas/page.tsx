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
import { Plus, Search, MoreHorizontal, MapPinned } from "lucide-react";
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
import { listAreas, deleteArea } from "@/lib/areas-api";
import type { Area } from "@/types/area";
import dayjs from "dayjs";

export default function AreasDirectoryPage() {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Area | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    void fetchAreas();
  }, []);

  const fetchAreas = async () => {
    setIsLoading(true);
    try {
      const data = await listAreas();
      setAreas(data);
    } catch (error) {
      console.error("Failed to fetch areas:", error);
      toast.error("Failed to load areas");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = areas.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.state_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteArea(deleteTarget.id);
      toast.success("Area removed", {
        description: `${deleteTarget.name} was removed.`,
      });
      setAreas((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete area");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Areas</h1>
          <p className="text-muted-foreground mt-1">
            Manage regional areas and area leadership under {user?.unitName}.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/app/areas/new">
            <Plus />
            New area
          </Link>
        </Button>
      </div>

      <Card className="border-none bg-white max-w-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600">
              <MapPinned className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Total areas
              </p>
              <h3 className="text-2xl font-bold">
                {isLoading ? "—" : areas.length}
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
                placeholder="Search by area or state name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading areas…</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <TableHead>Area</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Area leader (ID)</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((area) => (
                  <TableRow key={area.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {area.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold">{area.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ID {area.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {area.state_name}
                    </TableCell>
                    <TableCell>{area.area_leader}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {dayjs(area.created_at).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-background hover:bg-accent transition-colors"
                            aria-label={`Actions for ${area.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem asChild>
                            <Link href={`/app/areas/${area.id}`}>
                              View area
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/app/areas/${area.id}/edit`}>
                              Edit area
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              setDeleteTarget(area);
                            }}
                          >
                            Delete area
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
              No areas match your search.
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this area?"
        description="Zones and cells under this area may be affected. This cannot be undone."
        itemName={deleteTarget?.name}
        confirmLabel="Yes, delete area"
        isLoading={deleteLoading}
      />
    </div>
  );
}
