// แปลงวันที่ ค.ศ. -> พ.ศ. และจัดรูปแบบให้สวยงาม
// รองรับรูปแบบจาก Google Sheet เช่น "2-ก.พ.-2026", "23-พ.ค.-2026"
// และรูปแบบอื่น ๆ เท่าที่พบบ่อย (ISO, dd/mm/yyyy)

const TH_MONTHS_ABBR = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

const TH_MONTHS_FULL = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const toBE = (year: number) => (year < 2400 ? year + 543 : year);

/** index เดือนจากชื่อย่อ/เต็มภาษาไทย (0-based) หรือ -1 ถ้าไม่พบ */
function monthIndexFromThai(s: string): number {
  const t = s.trim().replace(/\s/g, "");
  let i = TH_MONTHS_ABBR.findIndex((m) => m.replace(/\s/g, "") === t);
  if (i >= 0) return i;
  i = TH_MONTHS_FULL.findIndex((m) => m === t);
  return i;
}

/**
 * แปลงสตริงวันที่ให้เป็นรูปแบบไทย พ.ศ. เช่น "2 ก.พ. 2569"
 * - ถ้าแปลงไม่ได้ จะคืนค่าเดิมกลับไป (ปลอดภัยไว้ก่อน)
 */
export function toThaiDate(input: string | null | undefined): string {
  if (!input) return "";
  const raw = String(input).trim();
  if (!raw) return "";

  // รูปแบบ "2-ก.พ.-2026" หรือ "2 ก.พ. 2026"
  const m = raw.match(/^(\d{1,2})\s*[-/]?\s*([ก-๙.]+)\s*[-/]?\s*(\d{4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const mi = monthIndexFromThai(m[2]);
    const year = toBE(parseInt(m[3], 10));
    if (mi >= 0) return `${day} ${TH_MONTHS_ABBR[mi]} ${year}`;
  }

  // รูปแบบ ISO 2026-02-02 หรือ 2026/2/2
  const iso = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (iso) {
    const year = toBE(parseInt(iso[1], 10));
    const mi = parseInt(iso[2], 10) - 1;
    const day = parseInt(iso[3], 10);
    if (mi >= 0 && mi < 12) return `${day} ${TH_MONTHS_ABBR[mi]} ${year}`;
  }

  // รูปแบบ dd/mm/yyyy
  const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const mi = parseInt(dmy[2], 10) - 1;
    const year = toBE(parseInt(dmy[3], 10));
    if (mi >= 0 && mi < 12) return `${day} ${TH_MONTHS_ABBR[mi]} ${year}`;
  }

  // แปลงไม่ได้ -> คืนค่าเดิม
  return raw;
}
