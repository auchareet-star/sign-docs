"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchLetter, type Letter } from "@/lib/sheet";
import { LetterView } from "@/components/LetterView";

export default function LetterPage() {
  const [letter, setLetter] = useState<Letter | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [docNo, setDocNo] = useState("");

  useEffect(() => {
    const no = new URLSearchParams(window.location.search).get("no") || "";
    setDocNo(no);
    fetchLetter(no)
      .then((l) => setLetter(l ?? null))
      .catch((e: any) => setError(e?.message || String(e)));
  }, []);

  if (error) {
    return (
      <div className="container">
        <div className="error">อ่าน Google Sheet ไม่สำเร็จ: {error}</div>
        <p><Link className="btn" href="/">← กลับหน้ารายการ</Link></p>
      </div>
    );
  }

  if (letter === undefined) {
    return <div className="container"><div className="muted">กำลังโหลด…</div></div>;
  }

  if (letter === null) {
    return (
      <div className="container">
        <div className="error">ไม่พบหนังสือเลขที่ {docNo}</div>
        <p><Link className="btn" href="/">← กลับหน้ารายการ</Link></p>
      </div>
    );
  }

  return <LetterView letter={letter} />;
}
