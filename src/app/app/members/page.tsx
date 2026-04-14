"use client";

import { useStore } from "@/store";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Filter,
  MoreHorizontal,
  Phone,
  MapPin,
  UserCircle2,
} from "lucide-react";
import type { MemberRecord } from "@/types/models";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { deleteMember, listMembers } from "@/lib/members-api";
import { extractErrorMessage } from "@/lib/utils";

export default function MembersPage() {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<MemberRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fullName = useMemo(() => {
    return (member: MemberRecord) =>
      [member.first_name, member.last_name].filter(Boolean).join(" ");
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const data = await listMembers();
        if (!cancelled) setMembers(data);
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load members", {
            description: extractErrorMessage(error, "Try again in a moment."),
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

  const filteredMembers = members.filter((m) => {
    const haystack =
      `${fullName(m)} ${m.phone_number} ${m.cell_name}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const handleConfirmDelete = () => {
    if (!deleteTarget || deleteLoading) return;
    setDeleteLoading(true);
    void (async () => {
      try {
        await deleteMember(deleteTarget.id);
        setMembers((prev) => prev.filter((row) => row.id !== deleteTarget.id));
        toast.success("Member removed", {
          description: `${fullName(deleteTarget)} was deleted from the directory.`,
        });
      } catch (error) {
        toast.error("Failed to delete member", {
          description: extractErrorMessage(error, "Please try again."),
        });
      } finally {
        setDeleteLoading(false);
        setDeleteTarget(null);
      }
    })();
  };

  const loadingRowCount = 6;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track members in {user?.unitName}.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/app/members/new">
            <UserCircle2 />
            Add New Member
          </Link>
        </Button>
      </div>

      <Card className="border-none bg-white rounded-3xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Button variant="outline" size="default">
              <Filter />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <TableHead>Member</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: loadingRowCount }).map((_, index) => (
                    <TableRow key={`members-skeleton-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-200/80 animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-3 w-32 rounded bg-slate-200/80 animate-pulse" />
                            <div className="h-2.5 w-24 rounded bg-slate-200/70 animate-pulse" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-20 rounded-full bg-slate-200/80 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="h-2.5 w-28 rounded bg-slate-200/80 animate-pulse" />
                          <div className="h-2.5 w-32 rounded bg-slate-200/70 animate-pulse" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-2.5 w-20 rounded bg-slate-200/80 animate-pulse" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="ml-auto h-9 w-9 rounded-md bg-slate-200/80 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                : filteredMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      className="group hover:bg-accent/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {fullName(member)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              {fullName(member)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.cell_name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.status === "WORKER"
                              ? "success"
                              : member.status === "NEW_CONVERT"
                                ? "warning"
                                : member.status === "CELL_LEADER"
                                  ? "default"
                                  : "outline"
                          }
                        >
                          {member.status_display}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {member.phone_number}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">
                              {member.residential_address}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(member.date_joined).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem asChild>
                                <Link href={`/app/members/${member.id}`}>
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/app/members/${member.id}/edit`}>
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setDeleteTarget(member);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {!isLoading && filteredMembers.length === 0 && (
            <div className="py-12 text-center">
              <UserCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No members yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No member records match your current search.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this member?"
        description="They will be removed from your cell directory and activity history may be affected. This cannot be undone."
        itemName={deleteTarget ? fullName(deleteTarget) : undefined}
        confirmLabel="Yes, delete member"
        isLoading={deleteLoading}
      />
    </div>
  );
}
