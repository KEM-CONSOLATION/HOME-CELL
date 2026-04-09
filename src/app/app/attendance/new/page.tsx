"use client";

import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@/components/ui/dashboard-cards";
import {
  ChevronLeft,
  Save,
  Calendar,
  UserPlus,
  Star,
  Check,
} from "lucide-react";
import Link from "next/link";
import { MOCK_MEMBERS } from "@/data/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewAttendancePage() {
  const { user } = useStore();
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [presentIds, setPresentIds] = useState<string[]>([]);
  const [firstTimers, setFirstTimers] = useState(0);
  const [newConverts, setNewConverts] = useState(0);

  const toggleMember = (id: string) => {
    setPresentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Attendance submitted successfully!", {
      description: `Report for ${date} has been sent to leadership.`,
    });
    router.push("/app/attendance");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link
          href="/app"
          className="h-10 w-10 flex items-center justify-center rounded-xl border hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Submit Weekly Attendance
          </h1>
          <p className="text-sm text-muted-foreground">
            Log details for your home fellowship meeting.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Member Attendance</CardTitle>
              <CardDescription>
                Select all members who were present at the fellowship.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_MEMBERS.filter((m) => m.cellId === "cell-1").map(
                  (member) => (
                    <div
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                        presentIds.includes(member.id)
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-background/50 hover:border-border",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors",
                            presentIds.includes(member.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{member.name}</p>
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold"
                          >
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                          presentIds.includes(member.id)
                            ? "bg-primary border-primary"
                            : "border-muted",
                        )}
                      >
                        {presentIds.includes(member.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Meeting Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    First Timers
                  </label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      min="0"
                      value={firstTimers}
                      onChange={(e) =>
                        setFirstTimers(parseInt(e.target.value) || 0)
                      }
                      className="h-10 w-full rounded-xl border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    New Converts
                  </label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      min="0"
                      value={newConverts}
                      onChange={(e) =>
                        setNewConverts(parseInt(e.target.value) || 0)
                      }
                      className="h-10 w-full rounded-xl border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t mt-4">
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Total Present</span>
                  <span className="font-bold text-lg">
                    {presentIds.length + firstTimers}
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Save className="h-4 w-4" />
                  Save Report
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
