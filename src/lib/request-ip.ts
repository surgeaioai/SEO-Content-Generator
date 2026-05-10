import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest | Request): string {
  if ("headers" in request && request.headers) {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (forwarded) {
      return forwarded;
    }
    const real = request.headers.get("x-real-ip");
    if (real) {
      return real;
    }
  }
  return "unknown";
}
