"use client";

import { useStore } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  Badge,
} from "@/components/ui/dashboard-cards";
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
import {
  Plus,
  Search,
  Calendar,
  MoreHorizontal,
  Shield,
  Activity,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { listCells, deleteCell } from "@/lib/cells-api";
import type { Cell } from "@/types/cell";

export default function CellsDirectoryPage() {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [cells, setCells] = useState<Cell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Cell | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCells();
  }, []);

  const fetchCells = async () => {
    setIsLoading(true);
    try {
      const data = await listCells();
      setCells(data);
    } catch (error) {
      console.error("Failed to fetch cells:", error);
      toast.error("Failed to load cells");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCells = cells.filter((cell) =>
    cell.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCell(deleteTarget.id);
      toast.success("Cell removed", {
        description: `${deleteTarget.name} was removed from the directory.`,
      });
      setCells((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete cell");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Fellowship Cells
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage the fellowship centers and leadership assignments in{" "}
            {user?.unitName}.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/app/cells/new">
            <Plus />
            Create New Cell
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Active Cells",
            value: cells.length,
            icon: Shield,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Active Leaders",
            value: "14",
            icon: UserCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Avg. Cell Growth",
            value: "+12.4%",
            icon: Activity,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center",
                    stat.bg,
                    stat.color,
                  )}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-white">
        <CardHeader className="pb-4 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by cell name or location..."
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
              <p className="text-sm text-muted-foreground">Loading cells…</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <TableHead>Cell</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Meeting Day</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCells.map((cell) => {
                  return (
                    <TableRow key={cell.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {cell.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold">{cell.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {cell.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {cell.cell_leader != null
                            ? `ID ${cell.cell_leader}`
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Saturdays, 5:00 PM
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">
                          —
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">ACTIVE</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-background hover:bg-accent transition-colors"
                                aria-label={`Actions for ${cell.name}`}
                              >
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem asChild>
                                <Link href={`/app/cells/${cell.id}`}>
                                  View cell
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/app/members/new?cellId=${cell.id}`}
                                >
                                  Add Member
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/app/cells/${cell.id}/edit`}>
                                  Edit settings
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setDeleteTarget(cell);
                                }}
                              >
                                Delete cell
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this cell?"
        description="Members and records tied to this fellowship may be affected. This cannot be undone."
        itemName={deleteTarget?.name}
        confirmLabel="Yes, delete cell"
        isLoading={deleteLoading}
      />
    </div>
  );
}
