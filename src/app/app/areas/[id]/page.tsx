"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/dashboard-cards";
import {
  ArrowLeft,
  MapPinned,
  Edit3,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { getArea, deleteArea } from "@/lib/areas-api";
import type { Area } from "@/types/area";
import dayjs from "dayjs";

export default function AreaDetailsPage() {
  const params = useParams();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const raw = Array.isArray(idParam) ? idParam[0] : idParam;
  const idNum = raw ? Number.parseInt(raw, 10) : NaN;
  const router = useRouter();
  const [area, setArea] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const data = await getArea(idNum);
        if (!cancelled) setArea(data);
      } catch (error) {
        console.error("Failed to fetch area:", error);
        if (!cancelled) toast.error("Failed to load area");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idNum]);

  const handleConfirmDelete = async () => {
    if (!area) return;
    setDeleteLoading(true);
    try {
      await deleteArea(area.id);
      toast.success("Area removed", {
        description: `${area.name} was removed.`,
      });
      router.push("/app/areas");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete area");
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading area…</p>
      </div>
    );
  }

  if (!area || !Number.isFinite(idNum)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground font-bold">Area not found</p>
        <Link
          href="/app/areas"
          className="text-primary font-bold hover:underline"
        >
          Back to areas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Link
          href="/app/areas"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group w-fit"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          All areas
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
              <Link href={`/app/areas/${area.id}/edit`}>Edit area</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => {
                e.preventDefault();
                setDeleteOpen(true);
              }}
            >
              Delete area
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
            {area.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{area.name}</h1>
            <p className="text-muted-foreground">{area.state_name}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Overview</CardTitle>
            </div>
            <CardDescription>Identifiers returned by the API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Area ID</span>
              <span className="font-semibold">{area.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">State ID</span>
              <span className="font-semibold">{area.state}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Area leader</span>
              <span className="font-semibold">{area.area_leader}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Record</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Created</span>
              <span className="font-semibold">
                {dayjs(area.created_at).format("MMM D, YYYY h:mm A")}
              </span>
            </div>
            <Link
              href={`/app/areas/${area.id}/edit`}
              className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
            >
              <Edit3 className="h-4 w-4" />
              Edit area details
            </Link>
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete this area?"
        description="Zones and cells tied to this area may be affected. This cannot be undone."
        itemName={area.name}
        confirmLabel="Yes, delete area"
        isLoading={deleteLoading}
      />
    </div>
  );
}
