import type { Plan } from "@prisma/client";

import { db } from "@/lib/db";

const PLAN_LIMITS: Record<Plan, number> = {
  FREE: 5,
  PRO: 50,
  AGENCY: 500,
};

export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const resetDate = new Date(user.usageResetAt);
  if (
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  ) {
    await db.user.update({
      where: { id: userId },
      data: { usageCount: 0, usageResetAt: now },
    });
    user.usageCount = 0;
  }

  const limit = PLAN_LIMITS[user.plan];
  if (user.usageCount >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  await db.user.update({
    where: { id: userId },
    data: { usageCount: { increment: 1 } },
  });

  return {
    allowed: true,
    remaining: limit - user.usageCount - 1,
    limit,
  };
}
