import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION ?? "0.1.0",
      },
      {
        headers: {
          // Health checks should never be cached by intermediaries.
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    console.error("health check error", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION ?? "0.1.0",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
