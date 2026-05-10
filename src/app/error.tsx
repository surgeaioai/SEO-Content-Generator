"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error.digest;
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          Please try again. If the problem continues, refresh the page.
        </p>
      </div>
      <Button onClick={() => reset()} type="button">
        Try again
      </Button>
    </div>
  );
}
