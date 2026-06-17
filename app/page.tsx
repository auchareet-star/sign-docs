"use client";

import { useEffect, useState } from "react";
import { fetchLetters, type Letter } from "@/lib/sheet";
import { DashboardTable } from "@/components/DashboardTable";

export default function HomePage() {
  const [letters, setLetters] = useState<Letter[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLetters()
      .then(setLetters)
      .catch((e: any) => setError(e?.message || String(e)));
  }, []);

  let content;
  if (error) {
    content = (
      <div className="error">
        เกิดข้อผิดพลาดในการอ่าน Google Sheet: {error}
        <br />
        ตรวจสอบว่าตั้งค่า <code>NEXT_PUBLIC_GOOGLE_SHEET_ID</code> แล้ว และแชร์ Sheet
        เป็น “ทุกคนที่มีลิงก์ดูได้” (ถ้าเจอปัญหา CORS ให้ใช้ File → Share → Publish to web
        แล้วใส่ลิงก์ CSV ใน <code>NEXT_PUBLIC_SHEET_CSV_URL</code>)
      </div>
    );
  } else if (letters === null) {
    content = <div className="muted">กำลังโหลดข้อมูลจาก Google Sheet…</div>;
  } else {
    content = <DashboardTable letters={letters} />;
  }

  return (
    <>
      <div className="topbar">
        <h1>ระบบออกหนังสือ — บริษัท อโยเดีย จำกัด</h1>
        <p>รายการหนังสือทั้งหมด (ข้อมูลจาก Google Sheet)</p>
      </div>
      <div className="container">{content}</div>
    </>
  );
}
