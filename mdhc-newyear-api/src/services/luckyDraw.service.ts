import { prisma } from "../prismaClient";
import { randomPick } from "../utils/random";
import { broadcast } from "../utils/broadcast";
/**
 * เริ่มสุ่ม (ปกติ)
 * 1. load prize
 * 2. find candidates (participants not in lucky_draw_results)
 * 3. pick random
 * 4. save result, decrement prize.remaining
 * 5. broadcast
 */
export async function startDraw(prizeId: string) {
  if (!prizeId) throw new Error("prizeId is required");

  // 1) validate prize
  const prize = await prisma.prize.findUnique({
    where: { id: prizeId },
  });

  if (!prize) throw new Error("Prize not found");
  if (!prize.isActive) throw new Error("Prize is not active");
  if (prize.remaining <= 0)
    throw new Error("This prize has no remaining stock");

  // 2) ถ้าเป็นรางวัล GRAND ต้อง check-in เท่านั้น
  //    รางวัลอื่นๆ (SMALL, MEDIUM, BIG) ไม่จำเป็นต้อง check-in
  let participants;
  if (prize.category === "GRAND") {
    participants = await prisma.participant.findMany({
      where: { checkedIn: true },
    });
    if (participants.length === 0) {
      throw new Error("No participants checked-in for GRAND prize");
    }
  } else {
    // รางวัล SMALL, MEDIUM, BIG - ทุกคนลุ้นได้
    participants = await prisma.participant.findMany();
    if (participants.length === 0) {
      throw new Error("No participants available");
    }
  }

  // 3) ดึงคนที่เคยได้รางวัลไปแล้ว
  const winners = await prisma.luckyDrawResult.findMany({
    select: { participantId: true },
  });

  const winnerIds = new Set(winners.map((w) => w.participantId));

  // 4) filter เอาเฉพาะคนที่ยังไม่เคยได้รางวัล
  const eligibleParticipants = participants.filter((p) => !winnerIds.has(p.id));

  if (eligibleParticipants.length === 0) {
    throw new Error("All participants have already won a prize.");
  }

  // 5) random ผู้ชนะ
  const winner =
    eligibleParticipants[
      Math.floor(Math.random() * eligibleParticipants.length)
    ];

  // 6) atomic decrement prize remaining
  const dec = await prisma.prize.updateMany({
    where: { id: prizeId, remaining: { gt: 0 } },
    data: { remaining: { decrement: 1 } },
  });

  if (dec.count === 0) {
    throw new Error("Failed to update remaining");
  }

  // 7) บันทึกผล
  const result = await prisma.luckyDrawResult.create({
    data: {
      prizeId,
      participantId: winner.id,
    },
    include: {
      participant: true,
      prize: true,
    },
  });

  // 8) broadcast real-time
  broadcast("lucky-draw:winner", result);

  return result;
}

/**
 * Re-draw: เลือกผู้ชนะใหม่สำหรับ prize เดียวกันโดย mark is_redraw = true
 * แต่ยังคงยกเลิกผลเก่าไว้ (ไม่ลบ) — ถ้าต้องการให้คืนสิทธิ์ ต้อง implement logic เพิ่มเติม
 */
export async function redraw(resultId: string) {
  const old = await prisma.luckyDrawResult.findUnique({
    where: { id: resultId },
    include: { prize: true },
  });

  if (!old) throw new Error("Result not found");

  const prize = old.prize;
  if (!prize.isActive) throw new Error("Prize is not active");

  // 1) mark old result as redraw
  await prisma.luckyDrawResult.update({
    where: { id: resultId },
    data: { isRedraw: true },
  });

  // 2) ถ้าเป็นรางวัล GRAND ต้อง check-in เท่านั้น
  //    รางวัลอื่นๆ (SMALL, MEDIUM, BIG) ไม่จำเป็นต้อง check-in
  let participants;
  if (prize.category === "GRAND") {
    participants = await prisma.participant.findMany({
      where: { checkedIn: true },
    });
    if (participants.length === 0) {
      throw new Error("No participants checked-in for GRAND prize");
    }
  } else {
    // รางวัล SMALL, MEDIUM, BIG - ทุกคนลุ้นได้
    participants = await prisma.participant.findMany();
    if (participants.length === 0) {
      throw new Error("No participants available");
    }
  }

  // 3) ดึงคนที่เคยได้รางวัลไปแล้ว (ไม่รวมคนที่ถูก redraw)
  const winners = await prisma.luckyDrawResult.findMany({
    where: { isRedraw: false },
    select: { participantId: true },
  });

  const winnerIds = new Set(winners.map((w) => w.participantId));

  // 4) filter เอาเฉพาะคนที่ยังไม่เคยได้รางวัล
  const eligibleParticipants = participants.filter((p) => !winnerIds.has(p.id));

  if (eligibleParticipants.length === 0) {
    throw new Error("All participants have already won a prize.");
  }

  // 5) random ผู้ชนะใหม่
  const winner =
    eligibleParticipants[
      Math.floor(Math.random() * eligibleParticipants.length)
    ];

  // 6) บันทึกผลใหม่ (ไม่ decrement remaining เพราะเป็นการจับรางวัลเดิมซ้ำ)
  const result = await prisma.luckyDrawResult.create({
    data: {
      prizeId: old.prizeId,
      participantId: winner.id,
    },
    include: {
      participant: true,
      prize: true,
    },
  });

  // 7) broadcast real-time
  broadcast("lucky-draw:winner", result);

  return result;
}

export async function listResults() {
  const results = await prisma.luckyDrawResult.findMany({
    where: {
      isRedraw: false,
    },
    orderBy: { createdAt: "desc" },
    include: { participant: true, prize: true },
  });

  return results.map((r) => ({
    id: r.id,
    winner_name: r.participant.fullName,
    employeeId: r.participant.employeeId,
    department: r.participant.department,
    prize_name: r.prize.name,
    is_redraw: r.isRedraw,
    created_at: r.createdAt,
  }));
}
