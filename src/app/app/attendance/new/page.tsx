"use client";

import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
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

  const isValid = date.trim().length > 0 && presentIds.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    toast.success("Attendance submitted successfully!", {
      description: `Report for ${date} has been sent to leadership.`,
    });
    router.push("/app/attendance");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/app">
            <ChevronLeft />
          </Link>
        </Button>
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
          <Card className="border-none bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 rounded-3xl">
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
          <Card className="border-none bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 rounded-3xl">
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Meeting Date"
                type="date"
                icon={<Calendar className="h-4 w-4" />}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="First Timers"
                  type="number"
                  min="0"
                  icon={<Star className="h-4 w-4" />}
                  value={firstTimers}
                  onChange={(e) =>
                    setFirstTimers(parseInt(e.target.value) || 0)
                  }
                />
                <FormField
                  label="New Converts"
                  type="number"
                  min="0"
                  icon={<UserPlus className="h-4 w-4" />}
                  value={newConverts}
                  onChange={(e) =>
                    setNewConverts(parseInt(e.target.value) || 0)
                  }
                />
              </div>

              <div className="pt-4 border-t mt-4">
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Total Present</span>
                  <span className="font-bold text-lg">
                    {presentIds.length + firstTimers}
                  </span>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!isValid}
                >
                  <Save />
                  Save Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
