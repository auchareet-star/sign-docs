import { NextRequest, NextResponse } from "next/server";

/**
 * บันทึกการเซ็นกลับไปที่ Google Sheet ผ่าน Google Apps Script Web App
 * - ต้องตั้งค่า APPS_SCRIPT_URL และ APPS_SCRIPT_TOKEN ใน .env.local
 * - ถ้ายังไม่ได้ตั้งค่า จะตอบกลับ ok:false (เว็บยังเซ็น/Export PDF ได้ปกติ แค่ไม่เขียนกลับ Sheet)
 */
export async function POST(req: NextRequest) {
  try {
    const { docNo, approverName } = await req.json();
    if (!docNo) {
      return NextResponse.json({ ok: false, error: "ไม่มี docNo" }, { status: 400 });
    }

    const url = process.env.APPS_SCRIPT_URL;
    const token = process.env.APPS_SCRIPT_TOKEN;
    if (!url || !token) {
      return NextResponse.json({
        ok: false,
        error: "ยังไม่ได้ตั้งค่า APPS_SCRIPT_URL / APPS_SCRIPT_TOKEN",
      });
    }

    // วันที่เซ็นวันนี้ (ค.ศ. รูปแบบ ISO) — เว็บจะแปลงเป็น พ.ศ. ตอนแสดง
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        docNo,
        status: "เซ็นแล้ว",
        signedDate: iso,
        approverName: approverName || "",
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      return NextResponse.json({ ok: false, error: data.error || `HTTP ${res.status}` });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
