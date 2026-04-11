"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@/components/ui/dashboard-cards";
import {
  ArrowLeft,
  MapPin,
  Users,
  TrendingUp,
  UserPlus,
  MoreHorizontal,
  Edit3,
  Map as MapIcon,
  MessageCircle,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCell, deleteCell } from "@/lib/cells-api";
import type { Cell } from "@/types/cell";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";

export default function CellDetailsPage() {
  const params = useParams();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const router = useRouter();
  const [cell, setCell] = useState<Cell | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const data = await getCell(id);
        if (!cancelled) setCell(data);
      } catch (error) {
        console.error("Failed to fetch cell:", error);
        if (!cancelled) toast.error("Failed to load cell details");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleConfirmDelete = async () => {
    if (!cell) return;
    setDeleteLoading(true);
    try {
      await deleteCell(cell.id);
      toast.success("Cell removed", {
        description: `${cell.name} was removed from the directory.`,
      });
      router.push("/app/cells");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete cell");
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Loading cell details...
        </p>
      </div>
    );
  }

  if (!cell) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground font-bold">Cell center not found</p>
        <Link
          href="/app/cells"
          className="text-primary font-bold hover:underline"
        >
          Back to Cells Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Link
          href="/app/cells"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Fellowship Directory
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-3xl bg-primary text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-xl shadow-primary/10">
              {cell.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {cell.name}
                </h1>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase">
                  Active Fellowship
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {cell.address || "No address recorded"} •{" "}
                {cell.zone_name || `Zone ${cell.zone}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer h-11 w-11 rounded-2xl border bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
                  <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/app/cells/${cell.id}/edit`}
                    className="flex items-center"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => setDeleteOpen(true)}
                >
                  Delete fellowship
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Core Metrics */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: "Member Count",
                value: "—",
                icon: Users,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                title: "Weekly Growth",
                value: "+2",
                icon: TrendingUp,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                title: "Soul Wins",
                value: "8",
                icon: UserPlus,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
            ].map((stat, i) => (
              <Card key={i} className="border-none bg-white">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        stat.bg,
                        stat.color,
                      )}
                    >
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {stat.title}
                      </p>
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Members Listing */}
          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Affiliated Members</CardTitle>
                  <CardDescription>
                    Believers currently assigned to this fellowship center.
                  </CardDescription>
                </div>
                <Link
                  href="/app/members/new"
                  className="h-9 px-4 rounded-xl border font-bold text-xs flex items-center gap-2 hover:bg-slate-50"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground py-4 text-center">
                Member listings will appear here when a members API is
                connected.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Context */}
        <div className="lg:col-span-4 space-y-6">
          {/* assigned Leader */}
          <Card className="border-none bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute left-[-20%] bottom-[-20%] h-40 w-40 bg-primary/20 rounded-full blur-[60px]" />
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">Cell Leadership</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white text-slate-900 flex items-center justify-center text-xl font-bold">
                  {cell.cell_leader != null ? "L" : "—"}
                </div>
                <div>
                  <h4 className="font-bold">
                    {cell.cell_leader != null
                      ? `Leader ID ${cell.cell_leader}`
                      : "No leader assigned"}
                  </h4>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                    Primary Leader
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <button className="cursor-pointer w-full h-11 rounded-xl bg-white/10 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
                  <MessageCircle className="h-4 w-4" />
                  Contact via WhatsApp
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Geographical Context */}
          <Card className="border-none bg-white h-64 flex flex-col items-center justify-center text-center p-6 gap-3 group overflow-hidden relative">
            <div className="absolute inset-0 bg-slate-100 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-lg text-primary mx-auto mb-2">
                <MapIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold">Interactive Map View</p>
              <p className="text-xs text-muted-foreground">
                Calabar Metropolis, Zone A Sub-sector
              </p>
            </div>
            <button className="cursor-pointer relative z-10 mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
              View Full Area
            </button>
          </Card>

          {/* Performance index */}
          <Card className="border-none bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Compliance Audit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">
                  Report Submission
                </span>
                <span className="text-xs font-black text-emerald-600">
                  100%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-full bg-emerald-500 rounded-full" />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <Activity className="h-3 w-3" />
                Next Report Due: 3 Days
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete this cell?"
        description="Members and history tied to this fellowship may be affected. This cannot be undone."
        itemName={cell.name}
        confirmLabel="Yes, delete cell"
        isLoading={deleteLoading}
      />
    </div>
  );
}
