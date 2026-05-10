import { NextResponse } from "next/server";

import { auth } from "@/auth";

export async function requireUserId(options?: {
  unauthorizedMessage?: string;
}): Promise<NextResponse | { userId: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: options?.unauthorizedMessage ?? "Unauthorized" },
      { status: 401 },
    );
  }
  return { userId: session.user.id };
}
