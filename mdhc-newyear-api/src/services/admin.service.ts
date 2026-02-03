import { prisma } from "../prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function login(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw new Error("User not found");
  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) throw new Error("Invalid credentials");

  const secret = process.env.JWT_SECRET || "secret";
  const token = jwt.sign({ id: admin.id, email: admin.email }, secret, {
    expiresIn: "8h",
  });
  return token;
}
