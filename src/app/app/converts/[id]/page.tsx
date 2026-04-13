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
  MoreHorizontal,
  Phone,
  MapPin,
  Calendar,
  ArrowUpCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ConvertRecord } from "@/types/models";
import {
  deleteMember,
  getMember,
  memberRecordToWrite,
  promoteMember,
} from "@/lib/members-api";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { extractErrorMessage } from "@/lib/utils";

export default function ConvertDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const raw = Array.isArray(idParam) ? idParam[0] : idParam;
  const idNum = raw ? Number.parseInt(raw, 10) : NaN;
  const [convert, setConvert] = useState<ConvertRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fullName = useMemo(() => {
    return convert
      ? [convert.first_name, convert.last_name].filter(Boolean).join(" ")
      : "";
  }, [convert]);

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
        if (!cancelled) setConvert(row);
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load convert", {
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
    if (!convert) return;
    setIsDeleting(true);
    try {
      await deleteMember(convert.id);
      toast.success("Convert deleted");
      router.push("/app/converts");
    } catch (error) {
      toast.error("Failed to delete convert", {
        description: extractErrorMessage(error),
      });
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  const onPromote = async () => {
    if (!convert || isPromoting) return;
    setIsPromoting(true);
    try {
      const payload = memberRecordToWrite(convert);
      payload.status = "MEMBER";
      payload.integration_status = "INTEGRATED";
      const promoted = await promoteMember(convert.id, payload);
      setConvert(promoted);
      toast.success("Convert promoted to member");
    } catch (error) {
      toast.error("Failed to promote convert", {
        description: extractErrorMessage(error),
      });
    } finally {
      setIsPromoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading convert profile...</p>
      </div>
    );
  }

  if (!convert) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <p className="text-muted-foreground font-bold text-center">
          Convert not found.
        </p>
        <Link
          href="/app/converts"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to converts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/app/converts"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to converts
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
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem asChild>
              <Link href={`/app/converts/${convert.id}/edit`}>Edit convert</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={convert.status !== "NEW_CONVERT" || isPromoting}
              onSelect={() => void onPromote()}
            >
              Promote to member
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => {
                e.preventDefault();
                setDeleteOpen(true);
              }}
            >
              Delete convert
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="border-none bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
              <p className="text-muted-foreground">{convert.cell_name}</p>
            </div>
            <Badge variant={convert.status === "NEW_CONVERT" ? "warning" : "default"}>
              {convert.status_display}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{convert.phone_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(convert.date_joined).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{convert.residential_address || "No address provided"}</span>
          </div>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => void onPromote()}
              disabled={convert.status !== "NEW_CONVERT" || isPromoting}
              className="cursor-pointer inline-flex items-center gap-2 text-sm font-semibold text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              <ArrowUpCircle className="h-4 w-4" />
              {isPromoting ? "Promoting..." : "Promote to member"}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-white">
        <CardHeader>
          <CardTitle>Follow-up</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Integration:</span>{" "}
            {convert.integration_status_display}
          </p>
          <p>
            <span className="text-muted-foreground">How won:</span>{" "}
            {convert.how_won_display || convert.how_won}
          </p>
          <p className="md:col-span-2">
            <span className="text-muted-foreground">Initial notes:</span>{" "}
            {convert.initial_notes || "—"}
          </p>
        </CardContent>
      </Card>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => !isDeleting && setDeleteOpen(false)}
        onConfirm={onDelete}
        title="Delete this convert?"
        description="This will permanently remove the convert profile."
        itemName={fullName}
        confirmLabel="Yes, delete convert"
        isLoading={isDeleting}
      />
    </div>
  );
}
