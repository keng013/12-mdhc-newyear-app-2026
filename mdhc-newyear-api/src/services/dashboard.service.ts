import { prisma } from "../prismaClient";

export async function getDashboardStats() {
  const totalParticipants = await prisma.participant.count();
  const checkedInParticipants = await prisma.participant.count({
    where: { checkedIn: true },
  });

  const totalPrizes = await prisma.prize.count();

  const distributedPrizes = await prisma.luckyDrawResult.count({
    where: { isRedraw: false },
  });

  const remainingPrizes = await prisma.prize.aggregate({
    _sum: { remaining: true },
  });

  return {
    totalParticipants,
    checkedInParticipants,
    totalPrizes,
    distributedPrizes,
    remainingPrizes: remainingPrizes._sum.remaining || 0,
  };
}

export async function getRecentActivities() {
  const checkedIn = await prisma.participant.findMany({
    where: { checkedIn: true },
    orderBy: { checkedInAt: "desc" },
    take: 20, // เอามาแค่ 20 รายการล่าสุด
    select: {
      fullName: true,
      department: true,
      checkedInAt: true,
    },
  });

  return checkedIn.map((item) => ({
    name: item.fullName,
    department: item.department,
    action: "Checked in",
    time: item.checkedInAt,
  }));
}
