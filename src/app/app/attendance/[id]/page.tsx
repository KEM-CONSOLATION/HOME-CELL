"use client";

import { useStore } from "@/store";
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
  Calendar,
  Users,
  UserPlus,
  Clock,
  MessageCircle,
  CheckCircle2,
  FileText,
  Printer,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_ATTENDANCE, MOCK_MEMBERS } from "@/data/mock-data";
import { cn } from "@/lib/utils";

export default function AttendanceDetailsPage() {
  const params = useParams();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const record = MOCK_ATTENDANCE.find((r) => r.id === id);

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground font-bold">Report not found</p>
        <Link
          href="/app/attendance"
          className="text-primary font-bold hover:underline"
        >
          Back to History
        </Link>
      </div>
    );
  }

  const presentMembers = MOCK_MEMBERS.filter((m) =>
    record.presentMemberIds.includes(m.id),
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href="/app/attendance"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Reports
        </Link>
        <button className="cursor-pointer h-10 px-4 rounded-xl border bg-white font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors">
          <Printer className="h-4 w-4 text-muted-foreground" />
          Print Report
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {record.cellId === "cell-1" ? "Grace Cell" : "Mercy Cell"} Report
          </h1>
          <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px]">
            VERIFIED
          </Badge>
        </div>
        <p className="text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {new Date(record.date).toLocaleDateString(undefined, {
            dateStyle: "full",
          })}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Present",
            value: record.totalAttendance,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "New Souls",
            value: record.newConverts,
            icon: UserPlus,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Compliance Rate",
            value: "100%",
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
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

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Present Members List */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50">
              <CardTitle>Register of Attendance</CardTitle>
              <CardDescription>
                Verified list of members present during this meeting.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-3">
                {presentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{member.name}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          {member.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase">
                        Confirmed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meeting Notes & Metadata */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="text-lg">Meeting Highlights</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Topic Taught
                    </p>
                    <p className="text-sm font-bold mt-0.5">
                      The Power of Choice
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Meeting Duration
                    </p>
                    <p className="text-sm font-bold mt-0.5">1h 15m</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">
                  Internal Note
                </p>
                <p className="text-xs font-medium text-amber-900 leading-relaxed">
                  The fellowship was Spirit-filled. We had one first-timer who
                  expressed interest in joining the youth department.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-10%] h-32 w-32 bg-primary/20 rounded-full blur-[40px]" />
            <CardContent className="pt-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Submitted By
                  </p>
                  <p className="text-sm font-bold">Zonal Coordinator</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-4">
                Report finalized on{" "}
                {new Date(record.submittedAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
