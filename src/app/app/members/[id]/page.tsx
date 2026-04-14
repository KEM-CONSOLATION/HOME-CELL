"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui/dashboard-cards";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  MoreHorizontal,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { MemberRecord } from "@/types/models";
import { deleteMember, getMember } from "@/lib/members-api";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { extractErrorMessage } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function MemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const raw = Array.isArray(idParam) ? idParam[0] : idParam;
  const idNum = raw ? Number.parseInt(raw, 10) : NaN;
  const [member, setMember] = useState<MemberRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fullName = useMemo(() => {
    return member
      ? [member.first_name, member.last_name].filter(Boolean).join(" ")
      : "";
  }, [member]);

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const row = await getMember(idNum);
        if (!cancelled) setMember(row);
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load member", {
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
    if (!member) return;
    setIsDeleting(true);
    try {
      await deleteMember(member.id);
      toast.success("Member deleted");
      router.push("/app/members");
    } catch (error) {
      toast.error("Failed to delete member", {
        description: extractErrorMessage(error),
      });
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <Skeleton className="h-5 w-40" />
        <Card className="border-none bg-white">
          <CardHeader className="space-y-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full md:col-span-2" />
          </CardContent>
        </Card>
        <Card className="border-none bg-white">
          <CardHeader>
            <Skeleton className="h-6 w-56" />
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <p className="text-muted-foreground font-bold text-center">
          Member not found.
        </p>
        <Link
          href="/app/members"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/app/members"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to directory
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
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/app/members/${member.id}/edit`}>Edit member</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => {
                e.preventDefault();
                setDeleteOpen(true);
              }}
            >
              Delete member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="border-none bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
              <p className="text-muted-foreground">{member.cell_name}</p>
            </div>
            <Badge
              variant={member.status === "NEW_CONVERT" ? "warning" : "default"}
            >
              {member.status_display}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{member.phone_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(member.date_joined).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{member.residential_address || "No address provided"}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-white">
        <CardHeader>
          <CardTitle>Follow-up and next of kin</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p>
            <span className="text-muted-foreground">NOK name:</span>{" "}
            {member.nok_name || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">NOK phone:</span>{" "}
            {member.nok_phone || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Integration:</span>{" "}
            {member.integration_status_display}
          </p>
          <p>
            <span className="text-muted-foreground">Follow-up officer:</span>{" "}
            {member.follow_up_officer_name || "Unassigned"}
          </p>
          <p className="md:col-span-2">
            <span className="text-muted-foreground">Initial notes:</span>{" "}
            {member.initial_notes || "—"}
          </p>
        </CardContent>
      </Card>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => !isDeleting && setDeleteOpen(false)}
        onConfirm={onDelete}
        title="Delete this member?"
        description="This will permanently remove the member profile."
        itemName={fullName}
        confirmLabel="Yes, delete member"
        isLoading={isDeleting}
      />
    </div>
  );
}
