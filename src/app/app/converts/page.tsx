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
import type { ConvertRecord } from "@/types/models";
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
import {
  deleteMember,
  memberRecordToWrite,
  promoteMember,
} from "@/lib/members-api";
import { listConverts } from "@/lib/converts-api";
import { extractErrorMessage } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConvertsPage() {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [converts, setConverts] = useState<ConvertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ConvertRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [promoteLoadingId, setPromoteLoadingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const rows = await listConverts();
        if (!cancelled) {
          setConverts(rows);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load converts", {
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
  }, []);

  const fullName = useMemo(() => {
    return (row: ConvertRecord) =>
      [row.first_name, row.last_name].filter(Boolean).join(" ");
  }, []);

  const filteredConverts = converts.filter(
    (nc) =>
      fullName(nc).toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.phone_number.includes(searchTerm),
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteLoading) return;
    setDeleteLoading(true);
    try {
      await deleteMember(deleteTarget.id);
      setConverts((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast.success("Convert removed", {
        description: `${fullName(deleteTarget)} was removed from the list.`,
      });
    } catch (error) {
      toast.error("Failed to delete convert", {
        description: extractErrorMessage(error),
      });
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const loadingRowCount = 6;

  const promoteConvert = async (row: ConvertRecord) => {
    if (promoteLoadingId != null) return;
    setPromoteLoadingId(row.id);
    try {
      const payload = memberRecordToWrite(row);
      payload.status = "MEMBER";
      payload.integration_status = "INTEGRATED";
      const updated = await promoteMember(row.id, payload);
      setConverts((prev) => prev.filter((item) => item.id !== updated.id));
      toast.success("Convert promoted", {
        description: `${fullName(row)} is now a full member.`,
      });
    } catch (error) {
      toast.error("Promotion failed", {
        description: extractErrorMessage(error),
      });
    } finally {
      setPromoteLoadingId(null);
    }
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
            value: String(
              converts.filter((c) => c.integration_status === "PENDING").length,
            ),
            icon: Clock,
            accent: "bg-blue-500",
          },
          {
            label: "In Progress",
            value: String(
              converts.filter((c) => c.integration_status === "IN_PROGRESS")
                .length,
            ),
            icon: MessageCircle,
            accent: "bg-amber-500",
          },
          {
            label: "Fully Integrated",
            value: String(
              converts.filter((c) =>
                ["INTEGRATED", "COMPLETED"].includes(c.integration_status),
              ).length,
            ),
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
              {isLoading
                ? Array.from({ length: loadingRowCount }).map((_, index) => (
                    <TableRow key={`converts-skeleton-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-xl" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-2.5 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-2.5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-2.5 w-36" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-9 w-9 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                : filteredConverts.map((nc) => (
                    <TableRow key={nc.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {fullName(nc).charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold truncate">{fullName(nc)}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {nc.residential_address}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {nc.phone_number}
                      </TableCell>
                      <TableCell>
                        <Badge className="rounded-lg py-1">
                          {nc.integration_status_display}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-slate-100 text-slate-700 rounded-lg py-1"
                        >
                          {nc.cell_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[320px]">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {nc.initial_notes || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              aria-label={`Actions for ${fullName(nc)}`}
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
                              <Link href={`/app/converts/${nc.id}/edit`}>
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={promoteLoadingId === nc.id}
                              onSelect={() => void promoteConvert(nc)}
                            >
                              Promote to member
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                toast.info("WhatsApp", {
                                  description: `Opening WhatsApp for ${fullName(nc)}.`,
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
              No converts listed yet for your jurisdiction.
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
        itemName={deleteTarget ? fullName(deleteTarget) : undefined}
        confirmLabel="Yes, delete convert"
        isLoading={deleteLoading}
      />
    </div>
  );
}
