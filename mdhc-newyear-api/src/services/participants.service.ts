import { prisma } from "../prismaClient";

export async function createParticipant(payload: {
  employee_id: string;
  fullName: string;
  department: string;
  dietary: string;
  remark?: string;
  checkedIn?: boolean;
  checkedInAt?: Date;
}) {
  // allow either employee_id or employeeId key
  const employeeId =
    (payload as any).employee_id || (payload as any).employeeId;
  const p = await prisma.participant.create({
    data: {
      employeeId,
      fullName: payload.fullName || (payload as any).full_name,
      department: payload.department,
      dietary: payload.dietary,
      remark: payload.remark,
    },
  });
  return p;
}

export async function findByEmployeeId(employeeId: string) {
  return prisma.participant.findFirst({ where: { employeeId } });
}

export async function listAll() {
  return prisma.participant.findMany({ orderBy: { registeredAt: "desc" } });
}

export async function checkInParticipant(employeeId: string) {
  const found = await prisma.participant.findUnique({
    where: { employeeId },
  });

  if (!found) {
    throw new Error("Participant not found");
  }

  // Toggle check-in status
  const updated = await prisma.participant.update({
    where: { id: found.id },
    data: {
      checkedIn: !found.checkedIn,
      checkedInAt: !found.checkedIn ? new Date() : null,
    },
  });

  return {
    message: updated.checkedIn
      ? "Checked in successfully"
      : "Checked out successfully",
    participant: updated,
  };
}

export async function bulkCheckInAll() {
  const now = new Date();

  const result = await prisma.participant.updateMany({
    where: {
      checkedIn: false,
    },
    data: {
      checkedIn: true,
      checkedInAt: now,
    },
  });

  return {
    message: "All participants checked in successfully",
    count: result.count,
  };
}

export async function bulkCreateParticipants(
  participants: Array<{
    EmployeeID?: string;
    employeeId?: string;
    Name?: string;
    fullName?: string;
    full_name?: string;
    Department?: string;
    department?: string;
    Dietary?: string;
    dietary?: string;
  }>,
) {
  const results = {
    created: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const item of participants) {
    try {
      // Support multiple field name formats from Excel
      const employeeId = item.EmployeeID || item.employeeId || "";
      const fullName = item.Name || item.fullName || item.full_name || "";
      const department = item.Department || item.department || "";
      const dietary = item.Dietary || item.dietary || "";

      if (!employeeId || !fullName) {
        results.errors.push(
          `Missing required fields for: ${JSON.stringify(item)}`,
        );
        results.skipped++;
        continue;
      }

      // Check if participant already exists
      const existing = await prisma.participant.findUnique({
        where: { employeeId },
      });

      if (existing) {
        results.skipped++;
        continue;
      }

      // Create new participant
      await prisma.participant.create({
        data: {
          employeeId,
          fullName,
          department,
          dietary: dietary === "None" ? null : dietary,
        },
      });

      results.created++;
    } catch (err: any) {
      results.errors.push(`Error creating participant: ${err.message}`);
      results.skipped++;
    }
  }

  return results;
}

export async function updateParticipant(
  id: string,
  payload: {
    fullName?: string;
    department?: string;
    dietary?: string;
    remark?: string;
  },
) {
  const updated = await prisma.participant.update({
    where: { id },
    data: payload,
  });
  return updated;
}

export async function deleteParticipant(id: string) {
  // Check if participant has won any prizes
  const hasWon = await prisma.luckyDrawResult.findFirst({
    where: { participantId: id },
  });

  if (hasWon) {
    throw new Error("Cannot delete participant who has won a prize");
  }

  await prisma.participant.delete({
    where: { id },
  });

  return { message: "Participant deleted successfully" };
}
