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
  UserPlus,
  Phone,
  MapPin,
  MessageCircle,
  FileText,
  UserCheck,
  History,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Edit3,
  SquarePen,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MOCK_NEW_CONVERTS, MOCK_CELLS } from "@/data/mock-data";
import { cn } from "@/lib/utils";
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
  getDeletedConvertIds,
  recordDeletedConvertId,
} from "@/lib/convert-deletions";

export default function ConvertDetailsPage() {
  const params = useParams();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const router = useRouter();
  const convert = MOCK_NEW_CONVERTS.find((nc) => nc.id === id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (getDeletedConvertIds().includes(id)) {
      router.replace("/app/converts");
    }
  }, [id, router]);

  if (!convert) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground font-bold">
          Convert record not found
        </p>
        <Link
          href="/app/converts"
          className="text-primary font-bold hover:underline"
        >
          Back to Converts
        </Link>
      </div>
    );
  }

  const cellName =
    MOCK_CELLS.find((c) => c.id === convert.assignedCellId)?.name ??
    "Grace Cell";

  const followUpLogs = [
    {
      date: "Apr 05, 2024",
      note: "First call made. Expressed joy about the service.",
      officer: "Alice Johnson",
      status: "In Progress",
    },
    {
      date: "Apr 02, 2024",
      note: "Welcome pack sent via email.",
      officer: "System",
      status: "Pending",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Link
          href="/app/converts"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Converts
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-lg bg-purple-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-xl shadow-purple-600/10">
              {convert.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {convert.name}
                </h1>
                <Badge
                  className={cn(
                    "border-none font-black text-[10px] uppercase",
                    convert.followUpStatus === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600",
                  )}
                >
                  {convert.followUpStatus.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <UserPlus className="h-3.5 w-3.5" />
                Registered on{" "}
                {new Date(convert.registeredAt).toLocaleDateString(undefined, {
                  dateStyle: "long",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Contact & Assignment */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="text-lg">Personal Dossier</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Contact Phone
                    </p>
                    <p className="text-sm font-bold mt-0.5">{convert.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Residence
                    </p>
                    <p className="text-sm font-bold mt-0.5">
                      {convert.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Assigned Cell
                    </p>
                    <p className="text-sm font-bold mt-0.5 text-primary">
                      {cellName}
                    </p>
                  </div>
                </div>
              </div>

              <button className="cursor-pointer w-full h-11 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors mt-4">
                <MessageCircle className="h-4 w-4" />
                Initiate WhatsApp Follow-up
              </button>
            </CardContent>
          </Card>

          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="text-lg">Quick Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-sm text-muted-foreground relative">
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-full" />
                {convert.followUpNotes || "No specific notes recorded yet."}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Follow-up Timeline */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Follow-up Logs</CardTitle>
                  <CardDescription>
                    Visual timeline of interactions with the convert.
                  </CardDescription>
                </div>
                <History className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {followUpLogs.map((log, i) => (
                  <div
                    key={i}
                    className="relative flex items-center justify-between pl-10"
                  >
                    <div className="absolute left-0 h-10 w-10 flex items-center justify-center rounded-full bg-white border-4 border-slate-50 text-primary">
                      {i === 0 ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 bg-slate-50/50 p-5 rounded-2xl border border-slate-50 group hover:border-primary/20 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          {log.date}
                        </p>
                        <span className="text-[9px] font-black bg-white px-2 py-1 rounded border text-slate-500">
                          {log.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {log.note}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-black text-primary">
                          {log.officer.charAt(0)}
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground">
                          Logged by {log.officer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
                <p className="text-sm font-bold text-muted-foreground">
                  Add a new follow-up interaction
                </p>
                <button className="cursor-pointer h-10 px-6 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform">
                  <FileText className="h-3.5 w-3.5" />
                  Log New Interaction
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteLoading(true);
          window.setTimeout(() => {
            recordDeletedConvertId(convert.id);
            toast.success("Convert removed", {
              description: `${convert.name} was removed from the list.`,
            });
            setDeleteLoading(false);
            setDeleteOpen(false);
            router.push("/app/converts");
          }, 400);
        }}
        title="Delete this convert?"
        description="They will be removed from the new converts list. This cannot be undone."
        itemName={convert.name}
        confirmLabel="Yes, delete convert"
        isLoading={deleteLoading}
      />
    </div>
  );
}
