import Link from "next/link";

export default function Login() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
      <p className="text-muted-foreground">
        Placeholder page (scaffold). Wire this up to your auth flow next.
      </p>
      <Link className="text-sm underline underline-offset-4" href="/">
        Back home
      </Link>
    </main>
  );
}

