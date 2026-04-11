"use client";

import { useStore } from "@/store";
import { cn } from "@/lib/utils";
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
  Search,
  UserPlus,
  Clock,
  MessageCircle,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import type { NewConvert } from "@/types/models";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { listCells } from "@/lib/cells-api";

export default function ConvertsPage() {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [converts] = useState<NewConvert[]>([]);
  const [cellNames, setCellNames] = useState<Map<number, string>>(new Map());
  const [deleteTarget, setDeleteTarget] = useState<NewConvert | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    void listCells()
      .then((cells) => {
        const m = new Map<number, string>();
        cells.forEach((c) => m.set(c.id, c.name));
        setCellNames(m);
      })
      .catch(() => setCellNames(new Map()));
  }, []);

  const cellLabel = useMemo(() => {
    return (assignedCellId?: string) => {
      if (!assignedCellId) return "—";
      const n = Number(assignedCellId);
      if (!Number.isFinite(n)) return assignedCellId;
      return cellNames.get(n) ?? `Cell #${n}`;
    };
  }, [cellNames]);

  const filteredConverts = converts.filter(
    (nc) =>
      nc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.phone.includes(searchTerm),
  );

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    window.setTimeout(() => {
      toast.success("Convert removed", {
        description: `${deleteTarget.name} was removed from the list.`,
      });
      setDeleteLoading(false);
      setDeleteTarget(null);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Converts</h1>
          <p className="text-muted-foreground mt-1">
            Track and follow up with recent converts in {user?.unitName}.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/app/converts/new">
            <UserPlus />
            Register New Convert
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            label: "Pending Assignment",
            value: "0",
            icon: Clock,
            accent: "bg-blue-500",
          },
          {
            label: "In Progress",
            value: "0",
            icon: MessageCircle,
            accent: "bg-amber-500",
          },
          {
            label: "Fully Integrated",
            value: "0",
            icon: CheckCircle,
            accent: "bg-emerald-500",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-none bg-white relative overflow-hidden"
          >
            <div
              className={cn("absolute left-0 top-0 bottom-0 w-1", stat.accent)}
            />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center opacity-10",
                    stat.accent,
                  )}
                />
                <stat.icon
                  className={cn(
                    "absolute right-8 h-6 w-6 opacity-40",
                    stat.accent.replace("bg-", "text-"),
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search converts by name or phone..."
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
                <TableHead>Convert</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Cell</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConverts.map((nc) => (
                <TableRow key={nc.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {nc.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate">{nc.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {nc.address}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {nc.phone}
                  </TableCell>
                  <TableCell>
                    <Badge className="rounded-lg py-1">
                      {nc.followUpStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-slate-100 text-slate-700 rounded-lg py-1"
                    >
                      {cellLabel(nc.assignedCellId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {nc.followUpNotes || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Actions for ${nc.name}`}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem asChild>
                          <Link href={`/app/converts/${nc.id}`}>
                            View profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/app/converts/${nc.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            toast.info("WhatsApp", {
                              description: `Opening WhatsApp for ${nc.name}.`,
                            })
                          }
                        >
                          WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => {
                            e.preventDefault();
                            setDeleteTarget(nc);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredConverts.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm px-4">
              No converts listed yet. Wire a converts API to populate this
              table; cell names use live data from your cells API when
              available.
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this convert?"
        description="They will be removed from the new converts list. This cannot be undone."
        itemName={deleteTarget?.name}
        confirmLabel="Yes, delete convert"
        isLoading={deleteLoading}
      />
    </div>
  );
}
