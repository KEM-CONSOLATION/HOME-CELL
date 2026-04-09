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
  Phone,
  MapPin,
  Calendar,
  Heart,
  Shield,
  History,
  MessageCircle,
  Mail,
  Edit3,
  Trash2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MOCK_MEMBERS } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import {
  getDeletedMemberIds,
  recordDeletedMemberId,
} from "@/lib/member-deletions";

export default function MemberDetailsPage() {
  const params = useParams();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const router = useRouter();
  const member = MOCK_MEMBERS.find((m) => m.id === id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (getDeletedMemberIds().includes(id)) {
      router.replace("/app/members");
    }
  }, [id, router]);

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground font-bold">Member not found</p>
        <Link
          href="/app/members"
          className="text-primary font-bold hover:underline"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  const activities = [
    {
      date: "Mar 31, 2024",
      event: "Attended Home Fellowship",
      status: "Present",
    },
    {
      date: "Mar 24, 2024",
      event: "Attended Home Fellowship",
      status: "Present",
    },
    { date: "Mar 17, 2024", event: "Missed Home Fellowship", status: "Absent" },
    {
      date: "Mar 10, 2024",
      event: "Attended Home Fellowship",
      status: "Present",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Link
          href="/app/members"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-lg bg-primary text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-xl shadow-primary/10">
              {member.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {member.name}
                </h1>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase">
                  Active {member.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Belongs to{" "}
                {member.cellId === "cell-1" ? "Grace Cell" : "Truth Cell"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/app/members/${member.id}/edit`}
              className="h-11 px-6 rounded-xl border bg-white font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4 text-muted-foreground" />
              Edit Profile
            </Link>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="h-11 px-6 rounded-xl bg-rose-500 text-white font-bold text-sm hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Contact & Personal */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Phone Number
                    </p>
                    <p className="text-sm font-bold mt-0.5">{member.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Address
                    </p>
                    <p className="text-sm font-bold mt-0.5">{member.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Joined On
                    </p>
                    <p className="text-sm font-bold mt-0.5">
                      {new Date(member.joinedAt).toLocaleDateString(undefined, {
                        dateStyle: "long",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex gap-2">
                <button className="flex-1 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors">
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </button>
                <button className="flex-1 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <div>
                    <p className="text-sm font-bold">Mary Johnson</p>
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                      Next of Kin • Wife
                    </p>
                  </div>
                </div>
                <p className="text-xs font-bold text-rose-900 mt-4">
                  0809 999 0000
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance & Stats */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Attendance History</CardTitle>
                  <CardDescription>
                    Records from the last 4 fellowship meetings.
                  </CardDescription>
                </div>
                <History className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-1">
                {activities.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-slate-50 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          act.status === "Present"
                            ? "bg-emerald-500"
                            : "bg-rose-500",
                        )}
                      />
                      <div>
                        <p className="text-sm font-bold">{act.event}</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                          {act.date}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black",
                        act.status === "Present"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600",
                      )}
                    >
                      {act.status.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 text-xs font-black uppercase tracking-widest text-primary hover:underline flex items-center justify-center gap-2">
                View Full Attendance Record
                <ChevronRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="border-none bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute right-[-10%] top-[-20%] h-32 w-32 bg-primary/20 rounded-full blur-[40px]" />
              <CardContent className="pt-6 relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Soul Winning Index
                </p>
                <h3 className="text-3xl font-bold mt-1">12</h3>
                <p className="text-xs text-slate-500 mt-2">
                  New Converts won this year
                </p>
              </CardContent>
            </Card>
            <Card className="border-none bg-white">
              <CardContent className="pt-6">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Faith Milestone
                </p>
                <h3 className="text-3xl font-bold mt-1 text-primary">
                  Preacher
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  Current training level
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteLoading(true);
          window.setTimeout(() => {
            recordDeletedMemberId(member.id);
            toast.success("Member removed", {
              description: `${member.name} was deleted from the directory.`,
            });
            setDeleteLoading(false);
            setDeleteOpen(false);
            router.push("/app/members");
          }, 400);
        }}
        title="Delete this member?"
        description="They will be removed from your cell directory and related records may be affected. This cannot be undone."
        itemName={member.name}
        confirmLabel="Yes, delete member"
        isLoading={deleteLoading}
      />
    </div>
  );
}
