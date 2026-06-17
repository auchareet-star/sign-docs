import Link from "next/link";
import { fetchLetter } from "@/lib/sheet";
import { LetterView } from "@/components/LetterView";

export const dynamic = "force-dynamic";

export default async function LetterPage({ params }: { params: { no: string } }) {
  let letter;
  try {
    letter = await fetchLetter(decodeURIComponent(params.no));
  } catch (e: any) {
    return (
      <div className="container">
        <div className="error">อ่าน Google Sheet ไม่สำเร็จ: {e?.message || String(e)}</div>
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="container">
        <div className="error">ไม่พบหนังสือเลขที่ {params.no}</div>
        <p><Link className="btn" href="/">← กลับหน้ารายการ</Link></p>
      </div>
    );
  }

  return <LetterView letter={letter} />;
}
