import { prisma } from "@/lib/prisma";

export async function getSettings() {
  return prisma.settings.findUnique({ where: { id: "global" } });
}
