"use client";

import { useState } from "react";
import Link from "next/link";
import type { Letter } from "@/lib/sheet";
import { LetterDoc } from "./LetterDoc";
import { SignaturePad } from "./SignaturePad";
import { StatusBadge } from "./StatusBadge";

export function LetterView({ letter }: { letter: Letter }) {
  const [signature, setSignature] = useState<string | null>(null);
  const [showPad, setShowPad] = useState(false);
  const [exporting, setExporting] = useState(false);

  // เซ็นในหน้าจอเพื่อให้ติดไปใน PDF ตอน Export เท่านั้น (ไม่บันทึกกลับ Sheet)
  const status = signature ? "เซ็นแล้ว" : letter.status;
  const merged: Letter = { ...letter, status };

  function handleConfirm(dataUrl: string) {
    setShowPad(false);
    setSignature(dataUrl);
  }

  // สร้าง PDF ฝั่ง client แล้วดาวน์โหลด — ทำงานได้ทุกเบราว์เซอร์ (รวม Android/in-app webview)
  // ที่ window.print() ไม่รองรับ
  async function handleExport() {
    setExporting(true);
    try {
      const { exportLetterPdf } = await import("@/lib/exportPdf");
      const fileName = `${merged.docCode || "หนังสือ"}`.replace(/[\\/:*?"<>|]/g, "-");
      await exportLetterPdf(fileName);
    } catch (err) {
      console.error(err);
      alert("สร้าง PDF ไม่สำเร็จ: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      {/* แถบนำทาง + เครื่องมือ ลอยติดบนสุด (freeze) เหมาะกับ Tablet/iPad */}
      <div className="sticky-head no-print">
        <div className="topbar">
          <h1>หนังสือ {merged.docCode}</h1>
          <p>{merged.subject}</p>
        </div>
        <div className="detailbar">
          <Link className="btn" href="/">← กลับ</Link>
          <StatusBadge status={status} />
          <div className="spacer" />
          {signature ? (
            <>
              <button className="btn" onClick={() => setShowPad(true)}>
                ✍ เซ็นใหม่
              </button>
              <button className="btn" onClick={() => setSignature(null)}>
                ลบลายเซ็น
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowPad(true)}>
              ✍ เซ็นหนังสือ
            </button>
          )}
          <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
            {exporting ? "กำลังสร้าง PDF…" : "⬇ Export PDF"}
          </button>
        </div>
      </div>

      <div className="container">
        <div className="print-area paper-scale">
          <LetterDoc letter={merged} signature={signature} />
        </div>
      </div>

      {showPad && (
        <SignaturePad onCancel={() => setShowPad(false)} onConfirm={handleConfirm} />
      )}
    </>
  );
}
