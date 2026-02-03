import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Seed admin
  const pass = await bcrypt.hash("admin1234", 10);
  await prisma.admin.upsert({
    where: { email: "admin@mdhc.com" },
    update: {},
    create: { email: "admin@mdhc.com", password: pass, name: "Admin" },
  });
  console.log("✅ Seeded admin");

  // Clear existing lucky draw results first (foreign key constraint)
  await prisma.luckyDrawResult.deleteMany({});
  console.log("🗑️  Cleared existing lucky draw results");

  // Clear existing prizes
  await prisma.prize.deleteMany({});
  console.log("🗑️  Cleared existing prizes");

  // Seed prizes - รวมรางวัลชื่อเดียวกันเข้าด้วยกัน
  const prizesData = [
    // SMALL prizes (Supplier)
    { name: "เงินสด 1,000 บาท", category: "SMALL", stock: 2 },
    { name: "ไมโครเวฟ Toshiba", category: "SMALL", stock: 1 },
    { name: "หม้อทอดไร้น้ำมัน Philips", category: "SMALL", stock: 2 },
    { name: "หม้อทอดไร้น้ำมัน Simplus", category: "SMALL", stock: 1 },
    { name: "หม้ออบลมร้อน SmartHome", category: "SMALL", stock: 1 },
    { name: "ลำโพงพกพา Xiaomi", category: "SMALL", stock: 1 },
    { name: "ลำโพงพกพา Sony", category: "SMALL", stock: 1 },
    { name: "Chaopraya River cruise 2 ที่นั่ง", category: "SMALL", stock: 2 },
    { name: "เงินสด 4,000 บาท", category: "SMALL", stock: 2 },
    { name: "เงินสด 3,000 บาท", category: "SMALL", stock: 4 },
    { name: "กระเป๋าเดินทาง 20 นิ้ว", category: "SMALL", stock: 2 },
    { name: "บัตรแทนเงินสด Big C 1000 บาท", category: "SMALL", stock: 5 },
    { name: "คูปอง Central 500 บาท 2 ใบ", category: "SMALL", stock: 1 },

    // SMALL prizes (MD)
    { name: "MARSHALL ลำโพงบลูทูธ", category: "SMALL", stock: 1 },
    { name: "PHILIPS เครื่องฟอกอากาศ", category: "SMALL", stock: 1 },
    { name: "เครื่องชงกาแฟ Nescafe", category: "SMALL", stock: 1 },
    { name: "Philips Back Massager", category: "SMALL", stock: 1 },
    { name: "FUJI กล้อง INSTAX", category: "SMALL", stock: 1 },
    { name: "Philips Neck And Shoulder Massager", category: "SMALL", stock: 1 },
    { name: "TEFALเครื่องดูดฝุ่นแบบด้ามไร้สาย", category: "SMALL", stock: 1 },
    { name: "Xiaomi เครื่องฟอกอากาศ", category: "SMALL", stock: 1 },
    { name: "Redmi Buds 6 Pro", category: "SMALL", stock: 1 },
    { name: "Philips Massage Gun", category: "SMALL", stock: 1 },
    { name: "นาฬิกาสมาร์ทวอทช์", category: "SMALL", stock: 3 },
    { name: "JBL Go 4", category: "SMALL", stock: 2 },
    { name: "Bewell Keyboard", category: "SMALL", stock: 2 },
    { name: "JBL Buds 2 Wireless", category: "SMALL", stock: 2 },
    { name: "JISULIFE พัดลมพกพา", category: "SMALL", stock: 1 },
    { name: "RIS OHYAMA พัดลมตั้งโต๊ะ", category: "SMALL", stock: 1 },
    { name: "ไมโครเวฟ", category: "SMALL", stock: 1 },
    { name: "ชุดเซ็ตเครื่องครัว 6 ชิ้น", category: "SMALL", stock: 1 },
    { name: "เงินสด 1500", category: "SMALL", stock: 8 },
    { name: "เงินสด 1000", category: "SMALL", stock: 16 },

    // BIG prizes
    { name: "ทอง 25 สตางค์ (1 สลึง)", category: "BIG", stock: 1 },
    { name: "iPad Gen (11) Wi‑Fi - 128GB", category: "BIG", stock: 1 },
    { name: "iPhone Air 256GB สี(Cloud White)", category: "BIG", stock: 1 },
    { name: "Apple Watch SE 3 GPS", category: "BIG", stock: 1 },
    { name: "Airpod 4", category: "BIG", stock: 1 },

    // GRAND prizes
    { name: "iPhone 17 Pro - 256GB", category: "GRAND", stock: 1 },
    { name: "ทอง 50 สตางค์ (2 สลึง)", category: "GRAND", stock: 1 },
  ];

  for (const prize of prizesData) {
    await prisma.prize.create({
      data: {
        name: prize.name,
        category: prize.category as any,
        stock: prize.stock,
        remaining: prize.stock,
        description: `${prize.category} Prize`,
      },
    });
  }

  console.log(`✅ Seeded ${prizesData.length} prizes`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

// ts-node prisma/seed.ts
