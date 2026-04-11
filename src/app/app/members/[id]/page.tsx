"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MemberDetailsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
      <p className="text-muted-foreground font-bold text-center">
        Member profiles load from your members API. This route is ready to be
        wired when that endpoint is available.
      </p>
      <Link
        href="/app/members"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to directory
      </Link>
    </div>
  );
}
