"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AttendanceDetailsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
      <p className="text-muted-foreground font-bold text-center">
        Attendance report details will load from your attendance API when it is
        wired.
      </p>
      <Link
        href="/app/attendance"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to history
      </Link>
    </div>
  );
}
