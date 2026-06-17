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

  // เซ็นในหน้าจอเพื่อให้ติดไปใน PDF ตอน Export เท่านั้น (ไม่บันทึกกลับ Sheet)
  const status = signature ? "เซ็นแล้ว" : letter.status;
  const merged: Letter = { ...letter, status };

  function handleConfirm(dataUrl: string) {
    setShowPad(false);
    setSignature(dataUrl);
  }

  return (
    <>
      <div className="topbar no-print">
        <h1>หนังสือ {merged.docCode}</h1>
        <p>{merged.subject}</p>
      </div>

      <div className="container">
        <div className="detailbar no-print">
          <Link className="btn" href="/">← กลับหน้ารายการ</Link>
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
          <button className="btn btn-primary" onClick={() => window.print()}>
            ⬇ Export PDF
          </button>
        </div>

        <div className="print-area">
          <LetterDoc letter={merged} signature={signature} />
        </div>
      </div>

      {showPad && (
        <SignaturePad onCancel={() => setShowPad(false)} onConfirm={handleConfirm} />
      )}
    </>
  );
}
