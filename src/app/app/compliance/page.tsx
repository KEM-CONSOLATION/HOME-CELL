"use client";

import { useStore } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/dashboard-cards";
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Bell,
  Search,
  Filter,
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CompliancePage() {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const handleRemindAll = () => {
    toast.success("Reminders Sent!", {
      description:
        "Push notifications dispatched to all non-compliant leaders.",
    });
  };

  const units = [
    {
      name: "Grace Cell 1",
      lead: "Alice Johnson",
      status: "COMPLIANT",
      time: "2h ago",
      rate: "100%",
    },
    {
      name: "Grace Cell 2",
      lead: "Bob Smith",
      status: "PENDING",
      time: "-",
      rate: "75%",
    },
    {
      name: "Truth Area 4",
      lead: "Charlie Brown",
      status: "PENDING",
      time: "-",
      rate: "82%",
    },
    {
      name: "Zion Bridge",
      lead: "Diana Prince",
      status: "COMPLIANT",
      time: "Yesterday",
      rate: "100%",
    },
    {
      name: "Victory Cell",
      lead: "Ethan Hunt",
      status: "OVERDUE",
      time: "2 days late",
      rate: "40%",
    },
    {
      name: "Heavens Gate",
      lead: "Frank Castle",
      status: "COMPLIANT",
      time: "5h ago",
      rate: "95%",
    },
  ];

  const filteredUnits = units.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Compliance Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor reporting discipline across all {user?.unitName} sub-units.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRemindAll}
            className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Remind Non-Compliant
          </button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          {
            label: "Overall Compliance",
            value: "82%",
            icon: ShieldCheck,
            color: "text-primary",
          },
          {
            label: "Reports Received",
            value: "156/190",
            icon: CheckCircle2,
            color: "text-emerald-500",
          },
          {
            label: "Pending Today",
            value: "24",
            icon: Clock,
            color: "text-amber-500",
          },
          {
            label: "Overdue Reports",
            value: "10",
            icon: AlertCircle,
            color: "text-rose-500",
          },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-white">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center",
                    stat.color,
                  )}
                >
                  <stat.icon className="h-5 w-5" />
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

      <Card className="border-none bg-white">
        <CardHeader className="pb-4 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Unit Status Directory</CardTitle>
              <CardDescription>
                Live tracking of reporting discipline by unit leaders.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search unit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-64 pl-10 pr-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-xs font-bold"
                />
              </div>
              <button className="h-10 px-4 rounded-xl border flex items-center gap-2 text-xs font-bold hover:bg-slate-50 transition-colors">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            {filteredUnits.map((unit, i) => (
              <div
                key={i}
                className="group p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-6 flex-1">
                  <div className="min-w-[200px]">
                    <p className="font-bold text-sm">{unit.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                      {unit.lead}
                    </p>
                  </div>

                  <div className="hidden md:flex items-center gap-8 flex-1">
                    <div className="min-w-[120px]">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            unit.status === "COMPLIANT"
                              ? "bg-emerald-500"
                              : unit.status === "PENDING"
                                ? "bg-amber-500"
                                : "bg-rose-500",
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-bold",
                            unit.status === "COMPLIANT"
                              ? "text-emerald-600"
                              : unit.status === "PENDING"
                                ? "text-amber-600"
                                : "text-rose-600",
                          )}
                        >
                          {unit.status}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-[140px]">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                        Last Submission
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        {unit.time}
                      </p>
                    </div>

                    <div className="flex-1 max-w-[100px]">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                        Discipline
                      </p>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: unit.rate }}
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            parseInt(unit.rate) > 90
                              ? "bg-emerald-500"
                              : parseInt(unit.rate) > 70
                                ? "bg-amber-500"
                                : "bg-rose-500",
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-9 w-9 flex items-center justify-center rounded-lg border bg-white hover:bg-slate-100 transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() =>
                          toast.info("Logs", {
                            description: `Viewing logs for ${unit.name}`,
                          })
                        }
                      >
                        View Logs
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          toast.success("Reminder queued", {
                            description: `Reminder sent to ${unit.lead}`,
                          })
                        }
                      >
                        Send Reminder
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          toast.error("Not enabled yet", {
                            description: "Escalation flow will be wired later.",
                          })
                        }
                      >
                        Escalate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-lg bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute left-[10%] top-[-20%] h-40 w-40 bg-primary/20 rounded-full blur-[60px]" />
            <div className="relative z-10">
              <h4 className="text-xl font-bold">
                Incomplete Sunday Reporting?
              </h4>
              <p className="text-slate-400 text-sm mt-1">
                There are currently 10 units who haven&apos;t submitted their
                weekly reports. Send a global nudge to resolve this.
              </p>
            </div>
            <button className="relative z-10 px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform shrink-0">
              Broadcast Nudge
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
