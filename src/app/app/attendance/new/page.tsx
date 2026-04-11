"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewAttendancePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/app/attendance">
            <ChevronLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Submit Weekly Attendance
          </h1>
          <p className="text-sm text-muted-foreground">
            Member roll call and submission will connect when your attendance
            API is available.
          </p>
        </div>
      </div>

      <Card className="border-none bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 rounded-3xl">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            The previous screen used static sample members. Wire your backend
            attendance endpoint here to enable submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cells can be loaded from the existing cells API; member pickers need
            a members API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
