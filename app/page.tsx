import { fetchLetters } from "@/lib/sheet";
import { DashboardTable } from "@/components/DashboardTable";

export const dynamic = "force-dynamic"; // อ่านสด ๆ จาก Sheet ทุกครั้ง

export default async function HomePage() {
  let content;
  try {
    const letters = await fetchLetters();
    content = <DashboardTable letters={letters} />;
  } catch (e: any) {
    content = (
      <div className="error">
        เกิดข้อผิดพลาดในการอ่าน Google Sheet: {e?.message || String(e)}
        <br />
        ตรวจสอบว่าตั้งค่า <code>GOOGLE_SHEET_ID</code> ใน <code>.env.local</code> แล้ว
        และแชร์ Sheet เป็น “ทุกคนที่มีลิงก์ดูได้”
      </div>
    );
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
