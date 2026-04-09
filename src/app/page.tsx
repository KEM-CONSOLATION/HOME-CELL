import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">HOME-CELL</h1>
        <p className="text-muted-foreground">
          App Router scaffold with Tailwind v4 + shadcn conventions + proxy
          route handler.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          href="/app"
        >
          Go to app shell
        </Link>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium"
          href="/api/hello"
        >
          Ping API route
        </Link>
      </div>
    </main>
  );
}

