import Link from "next/link";
import { Home, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="min-h-dvh bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl border bg-white p-8 md:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-primary">
          404
        </div>

        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
          This page wandered off.
        </h1>
        <p className="mt-3 text-muted-foreground">
          We looked high and low, but this route is not here. It probably
          followed the lost sheep.
        </p>

        <div className="mt-6 rounded-2xl border bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">
            “What man of you, having a hundred sheep, if he has lost one of
            them, does not leave the ninety-nine in the open country, and go
            after the one that is lost, until he finds it?”
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Luke 15:4
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            <Compass className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
