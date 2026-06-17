import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

// A4 portrait (มม.)
const A4 = { w: 210, h: 297 };

interface Captured {
  data: string;
  /** สัดส่วนความสูงเมื่อปรับกว้างเต็มหน้า A4 (มม.) */
  hMm: number;
  /** px ต่อ มม. ของ canvas ที่ render */
  pxPerMm: number;
  canvas: HTMLCanvasElement;
}

async function capture(el: HTMLElement, scale: number): Promise<Captured> {
  const canvas = await html2canvas(el, {
    scale,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });
  const hMm = (canvas.height / canvas.width) * A4.w;
  return {
    data: canvas.toDataURL("image/jpeg", 0.95),
    hMm,
    pxPerMm: canvas.width / A4.w,
    canvas,
  };
}

/**
 * หาตำแหน่ง "ตัดหน้าได้อย่างปลอดภัย" (canvas px) = ขอบล่างของแต่ละบล็อกในเอกสาร
 * เพื่อไม่ให้การแบ่งหน้าไปหั่นกลางบล็อก (เช่น ช่องลงชื่อ / แบบตอบรับ / ข้อในรายการ)
 */
function safeBreakPositions(body: HTMLElement, canvasHeight: number): number[] {
  const bodyTop = body.getBoundingClientRect().top;
  const ratio = canvasHeight / body.getBoundingClientRect().height;

  const atomic: HTMLElement[] = [];
  for (const child of Array.from(body.children) as HTMLElement[]) {
    if (child.style.display === "none" || child.offsetParent === null) continue;
    // รายการ (ol) ตัดระหว่างข้อ (li) ได้ จึงเก็บ li เป็นหน่วยย่อย
    // ส่วนบล็อกอื่น (แบบตอบรับ / ช่องลงชื่อ / ย่อหน้า) ถือเป็นก้อนเดียว ห้ามหั่น
    if (child.tagName === "OL") {
      child.querySelectorAll<HTMLElement>(":scope > li").forEach((li) => atomic.push(li));
    } else {
      atomic.push(child);
    }
  }

  const breaks = atomic
    .map((el) => (el.getBoundingClientRect().bottom - bodyTop) * ratio)
    .filter((y) => y > 0 && y < canvasHeight)
    .sort((a, b) => a - b);
  breaks.push(canvasHeight); // ปิดท้ายเสมอ
  return breaks;
}

/**
 * สร้าง PDF A4 จากเอกสารบนหน้าจอแล้วสั่งดาวน์โหลด
 * - ใช้แทน window.print() เพราะ Android หลายเบราว์เซอร์ (รวม in-app webview) ไม่รองรับ print
 * - หัวกระดาษ (letterhead) ถูกวางซ้ำทุกหน้าเหมือนตอนพิมพ์
 * - แบ่งหน้าที่ขอบระหว่างบล็อกเท่านั้น ไม่หั่นกลางช่องลงชื่อ/แบบตอบรับ
 */
export async function exportLetterPdf(fileName: string): Promise<void> {
  const paper = document.getElementById("letter-paper");
  if (!paper) throw new Error("ไม่พบเอกสารสำหรับ export");

  const header = paper.querySelector<HTMLElement>(".letterhead");
  const body = paper.querySelector<HTMLElement>(".doc-pad");
  if (!body) throw new Error("ไม่พบเนื้อหาเอกสาร");

  // ปิด zoom ที่ใช้ย่อกระดาษให้พอดีจอ (media query) ชั่วคราว เพื่อ render เต็มขนาดจริง
  const prevZoom = paper.style.zoom;
  paper.style.zoom = "1";

  // ซ่อนองค์ประกอบ .no-print (เช่นบรรทัด "เซ็นเมื่อ…") ไม่ให้ติดไปใน PDF
  const hidden = Array.from(paper.querySelectorAll<HTMLElement>(".no-print"));
  const prevDisplay = hidden.map((e) => e.style.display);
  hidden.forEach((e) => (e.style.display = "none"));

  // รอให้ฟอนต์ TH Sarabun โหลดเสร็จก่อน ไม่งั้นตัวอักษรอาจเพี้ยน
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  } catch {
    /* บางเบราว์เซอร์ไม่มี document.fonts — ข้ามได้ */
  }

  try {
    const scale = Math.min(3, Math.max(2, window.devicePixelRatio || 2));
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

    const head = header ? await capture(header, scale) : null;
    const cont = await capture(body, scale);
    const canvasH = cont.canvas.height;

    const headerHmm = head ? head.hMm : 0;
    const bottomMm = 8;
    const pageContentPx = Math.floor((A4.h - headerHmm - bottomMm) * cont.pxPerMm);

    const breaks = safeBreakPositions(body, canvasH);

    let start = 0;
    let page = 0;
    while (start < canvasH - 1) {
      const target = start + pageContentPx;

      // เลือกจุดตัดที่เป็นขอบบล็อก ใหญ่สุดที่ยังไม่เกิน target
      let cut = -1;
      for (const b of breaks) {
        if (b > start + 1 && b <= target) cut = b;
      }
      // ไม่มีขอบบล็อกพอดี (บล็อกเดียวสูงเกินหนึ่งหน้า) → จำเป็นต้องตัดตรง ๆ
      if (cut < 0) cut = Math.min(target, canvasH);
      cut = Math.round(cut);

      const slicePx = cut - start;
      const slice = document.createElement("canvas");
      slice.width = cont.canvas.width;
      slice.height = slicePx;
      const ctx = slice.getContext("2d");
      if (!ctx) throw new Error("ไม่สามารถสร้างภาพเอกสารได้");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(
        cont.canvas,
        0, start, cont.canvas.width, slicePx,
        0, 0, cont.canvas.width, slicePx,
      );

      if (page > 0) pdf.addPage();
      if (head) pdf.addImage(head.data, "JPEG", 0, 0, A4.w, head.hMm);
      pdf.addImage(
        slice.toDataURL("image/jpeg", 0.95),
        "JPEG",
        0, headerHmm, A4.w, slicePx / cont.pxPerMm,
      );

      start = cut;
      page++;
    }

    pdf.save(`${fileName}.pdf`);
  } finally {
    paper.style.zoom = prevZoom;
    hidden.forEach((e, i) => (e.style.display = prevDisplay[i]));
  }
}
