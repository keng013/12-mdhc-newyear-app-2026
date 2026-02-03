import { prisma } from "../prismaClient";
import { PrizeCategory } from "@prisma/client";

export async function listPrizes() {
  return prisma.prize.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createPrize(payload: {
  name: string;
  description?: string;
  category: string; // SMALL|MEDIUM|BIG|GRAND
  stock: number;
}) {
  const cat = payload.category.toUpperCase() as PrizeCategory;
  const p = await prisma.prize.create({
    data: {
      name: payload.name,
      description: payload.description,
      category: cat,
      stock: payload.stock,
      remaining: payload.stock,
      isActive: true,
    },
  });
  return p;
}

export async function updatePrize(id: string, payload: Partial<any>) {
  const p = await prisma.prize.update({
    where: { id },
    data: {
      name: payload.name,
      description: payload.description,
      category: payload.category ? payload.category.toUpperCase() : undefined,
      stock: payload.stock,
      remaining: payload.remaining,
      isActive: payload.isActive,
    },
  });
  return p;
}

export async function deletePrize(id: string) {
  await prisma.prize.delete({ where: { id } });
}

export async function resetAllPrizes() {
  // Reset all prizes to their original stock
  const prizes = await prisma.prize.findMany();

  for (const prize of prizes) {
    await prisma.prize.update({
      where: { id: prize.id },
      data: { remaining: prize.stock },
    });
  }

  // Delete all lucky draw results
  await prisma.luckyDrawResult.deleteMany({});

  return { message: "Lucky draw reset successfully", count: prizes.length };
}

export async function deleteAllPrizes() {
  // Count prizes before deletion
  const count = await prisma.prize.count();

  // Delete all lucky draw results first (foreign key constraint)
  await prisma.luckyDrawResult.deleteMany({});

  // Delete all prizes
  await prisma.prize.deleteMany({});

  return { message: "All prizes deleted successfully", count };
}
