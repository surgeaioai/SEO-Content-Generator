import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";

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
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    logger.error({ err: error }, "health check error");
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
