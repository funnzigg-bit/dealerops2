import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Not found</h1>
        <p className="mt-2 text-zinc-400">The page you requested does not exist.</p>
        <Link href="/dashboard" className="mt-4 inline-block rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
