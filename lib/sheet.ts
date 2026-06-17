import Papa from "papaparse";

// ---- ชนิดข้อมูลของหนังสือ 1 ฉบับ ----
export type LetterStatus = "ร่าง" | "รอเซ็น" | "เซ็นแล้ว" | string;

export interface Letter {
  docNo: string;          // เลขที่ เช่น 001
  docCode: string;        // รหัสหนังสือ เช่น AYD-NPH69/001
  status: LetterStatus;   // ร่าง / รอเซ็น / เซ็นแล้ว
  docType: string;        // ปรับปรุงระบบ / ปิดระบบ
  docTitle: string;       // ต่อท้ายคำว่า "หนังสือ"
  subject: string;        // เรื่อง
  to: string;             // เรียน
  issueDate: string;      // วันที่ออกหนังสือ
  intro: string;          // เกริ่นนำ
  workDay: string;        // วันที่ดำเนินการ
  timeStart: string;
  timeEnd: string;
  duration: string;       // ระยะเวลารวม
  itemsIntro: string;     // ข้อความนำรายการ
  items: string[];        // รายการ (แยกบรรทัด)
  steps: string[];        // ขั้นตอน (แยกบรรทัด)
  closing: string;        // ข้อความปิดท้าย
  hasResponseForm: boolean;
  hasRiskNote: boolean;
  riskNote: string;
  signerName: string;
  signerPosition: string;
  signerCompany: string;
  approverName: string;   // ผู้เซ็นอนุมัติ (เว็บเติม)
  signedDate: string;     // วันที่เซ็น (ค.ศ. จาก sheet)
  pdfUrl: string;
}

// แม็ปหัวคอลัมน์ไทย -> key (ตรงกับไฟล์ Excel/Google Sheet)
const HEADER_MAP: Record<string, keyof RawRow> = {
  "เลขที่": "docNo",
  "รหัสหนังสือ": "docCode",
  "สถานะ": "status",
  "ประเภทหนังสือ": "docType",
  "ชื่อหนังสือ (ใต้ที่...)": "docTitle",
  "เรื่อง": "subject",
  "เรียน": "to",
  "วันที่ออกหนังสือ": "issueDate",
  "เกริ่นนำ (ย่อหน้าแรก)": "intro",
  "วันที่ดำเนินการ": "workDay",
  "เวลาเริ่ม": "timeStart",
  "เวลาสิ้นสุด": "timeEnd",
  "ระยะเวลารวม": "duration",
  "ข้อความนำรายการ": "itemsIntro",
  "รายการ (1 บรรทัด/ข้อ)": "items",
  "ขั้นตอนการดำเนินการ": "steps",
  "ข้อความปิดท้าย": "closing",
  "มีแบบตอบรับคำขอ": "hasResponseForm",
  "มีหมายเหตุความเสี่ยง": "hasRiskNote",
  "ข้อความหมายเหตุ": "riskNote",
  "ผู้ลงนาม (บริษัท)": "signerName",
  "ตำแหน่งผู้ลงนาม": "signerPosition",
  "บริษัท": "signerCompany",
  "ผู้เซ็นอนุมัติ": "approverName",
  "วันที่เซ็น": "signedDate",
  "ลิงก์ไฟล์ PDF": "pdfUrl",
};

type RawRow = Record<string, string>;

const splitLines = (v: string): string[] =>
  (v || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

const yes = (v: string): boolean => /^(ใช่|true|yes|y|1)$/i.test((v || "").trim());

function buildUrl(sheetId: string): string {
  // อ่านแบบ public CSV (ต้องตั้งค่าแชร์เป็น "ทุกคนที่มีลิงก์ดูได้")
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
}

/** ดึง + แปลง Google Sheet เป็นรายการหนังสือ */
export async function fetchLetters(): Promise<Letter[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("ยังไม่ได้ตั้งค่า GOOGLE_SHEET_ID ใน .env.local");

  const res = await fetch(buildUrl(sheetId), { cache: "no-store" });
  if (!res.ok) throw new Error(`อ่าน Google Sheet ไม่สำเร็จ (HTTP ${res.status})`);
  const csv = await res.text();

  const parsed = Papa.parse<RawRow>(csv, { header: true, skipEmptyLines: true });

  return parsed.data
    .map((row) => normalizeRow(row))
    .filter((l): l is Letter => !!l && !!l.docNo);
}

function normalizeRow(row: RawRow): Letter | null {
  // แปลงหัวคอลัมน์ไทย -> key
  const r: RawRow = {};
  for (const [thHeader, value] of Object.entries(row)) {
    const key = HEADER_MAP[thHeader.trim()];
    if (key) r[key] = value ?? "";
  }
  if (!r.docNo) return null;

  return {
    docNo: r.docNo.trim(),
    docCode: r.docCode || "",
    status: (r.status || "ร่าง").trim(),
    docType: r.docType || "",
    docTitle: r.docTitle || "",
    subject: r.subject || "",
    to: r.to || "",
    issueDate: r.issueDate || "",
    intro: r.intro || "",
    workDay: r.workDay || "",
    timeStart: r.timeStart || "",
    timeEnd: r.timeEnd || "",
    duration: r.duration || "",
    itemsIntro: r.itemsIntro || "",
    items: splitLines(r.items),
    steps: splitLines(r.steps),
    closing: r.closing || "",
    hasResponseForm: yes(r.hasResponseForm),
    hasRiskNote: yes(r.hasRiskNote),
    riskNote: r.riskNote || "",
    signerName: r.signerName || "",
    signerPosition: r.signerPosition || "",
    signerCompany: r.signerCompany || "",
    approverName: r.approverName || "",
    signedDate: r.signedDate || "",
    pdfUrl: r.pdfUrl || "",
  };
}

/** เทียบเลขที่แบบยืดหยุ่น: "002" = "2" = " 2 " (กันกรณี Google เก็บเป็นตัวเลข) */
function sameDocNo(a: string, b: string): boolean {
  const norm = (s: string) => s.trim().replace(/^0+(?=\d)/, "");
  if (norm(a) === norm(b)) return true;
  const na = Number(a), nb = Number(b);
  return !Number.isNaN(na) && !Number.isNaN(nb) && na === nb;
}

export async function fetchLetter(docNo: string): Promise<Letter | undefined> {
  const all = await fetchLetters();
  return all.find((l) => sameDocNo(l.docNo, docNo));
}
