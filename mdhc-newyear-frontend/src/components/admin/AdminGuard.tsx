import { ReactNode, useEffect } from "react";

export function AdminGuard({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      // redirect กลับไปหน้า public แบบไม่มี "/" ท้าย
      window.location.href = window.location.origin;
    }
  }, [token]);

  if (!token) return null; // ยังไม่ redirect → ไม่แสดงอะไร

  return <>{children}</>;
}
