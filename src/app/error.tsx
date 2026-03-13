"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-zinc-400">An unexpected error occurred while loading DealerOps.</p>
          <Button className="mt-4" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
