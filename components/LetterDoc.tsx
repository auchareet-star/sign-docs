import type { Letter } from "@/lib/sheet";
import { toThaiDate } from "@/lib/thaidate";

interface Props {
  letter: Letter;
  /** dataURL ของลายเซ็น (ถ้ามี = แสดงแทนเส้นประ) */
  signature?: string | null;
}

// ที่อยู่บริษัท (คงที่) — แสดงที่หัวกระดาษ
const COMPANY_ADDR = [
  "บริษัท อโยเดีย จำกัด",
  "21/11 ถนนกรุงธนบุรี แขวงคลองต้นไทร",
  "เขตคลองสาน กรุงเทพฯ 10600",
];

/** ประกอบประโยคย่อหน้าเนื้อหา: เกริ่นนำ + วัน/เวลา + นำเข้ารายการ */
function buildBody(l: Letter): string {
  const parts: string[] = [];
  if (l.intro) parts.push(l.intro.trim());

  const time =
    l.timeStart && l.timeEnd ? ` เวลา ${l.timeStart} - ${l.timeEnd} น.` : "";
  const dur = l.duration ? ` รวมระยะเวลาทั้งสิ้น ${l.duration}` : "";
  if (l.workDay) {
    parts.push(`ทั้งนี้ทางบริษัทฯ ขออนุญาตดำเนินการใน ${l.workDay}${time}${dur}`);
  }
  let body = parts.join(" ");
  if (l.itemsIntro) body += ` ${l.itemsIntro}`;
  return body;
}

/**
 * แปลงรายการ (flat lines) เป็นโครงลำดับชั้น
 * - บรรทัดปกติ = ข้อหลัก (ลำดับเลข 1. 2. 3.)
 * - บรรทัดขึ้นต้นด้วย "- " = bullet ย่อยใต้ข้อหลักก่อนหน้า
 */
interface Node {
  text: string;
  children: string[];
}
function parseItems(items: string[]): Node[] {
  const out: Node[] = [];
  for (const raw of items) {
    const line = raw.trimEnd();
    const isSub = /^\s*-\s+/.test(line);
    if (isSub) {
      const text = line.replace(/^\s*-\s+/, "");
      if (out.length === 0) out.push({ text: "", children: [] });
      out[out.length - 1].children.push(text);
    } else {
      out.push({ text: line.trim(), children: [] });
    }
  }
  return out;
}

function ItemList({ items }: { items: string[] }) {
  const nodes = parseItems(items);
  if (nodes.length === 0) return null;
  return (
    <ol className="items">
      {nodes.map((n, i) => (
        <li key={i}>
          {n.text}
          {n.children.length > 0 && (
            <ul className="sub">
              {n.children.map((c, j) => (
                <li key={j}>{c}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

export function LetterDoc({ letter: l, signature }: Props) {
  const signed = l.status === "เซ็นแล้ว" || !!signature;

  return (
    <div className="paper" id="letter-paper">
      <table className="doc-table">
        {/* หัวกระดาษ (แสดงซ้ำทุกหน้าเวลาพิมพ์) */}
        <thead>
          <tr>
            <td>
              <div className="letterhead">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="logo" src="/sign-docs/logo.png" alt="AYODIA" />
                <div className="addr">
                  {COMPANY_ADDR.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            </td>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <div className="doc-pad">
                <p className="doc-no">ที่ {l.docCode}</p>

                <div className="doc-title">หนังสือ{l.docTitle}</div>

                <p className="row-right">วันที่ {l.issueDate}</p>

                <div className="field">
                  <span className="label">เรื่อง</span>
                  <span>{l.subject}</span>
                </div>
                <div className="field">
                  <span className="label">เรียน</span>
                  <span>{l.to}</span>
                </div>

                {/* เนื้อหา */}
                <p className="body">{buildBody(l)}</p>

                {/* รายการ */}
                <ItemList items={l.items} />

                {/* ขั้นตอนการดำเนินการ */}
                {l.steps.length > 0 && (
                  <>
                    <p>ในการปรับปรุงระบบ ทางบริษัทฯ จะดำเนินการตามขั้นตอน ดังต่อไปนี้</p>
                    <ItemList items={l.steps} />
                  </>
                )}

                {/* ปิดท้าย */}
                {l.closing && <p style={{ textIndent: "2.5em" }}>{l.closing}</p>}

                {/* ลงนามฝั่งบริษัท */}
                <div className="sign-block">
                  {signed && signature ? (
                    <img className="sign-img" src={signature} alt="ลายเซ็น" />
                  ) : null}
                  <div className="sign-line">ลงชื่อ……………………………………............</div>
                  <div>({l.signerName})</div>
                  <div>{l.signerPosition}</div>
                  <div>{l.signerCompany}</div>
                </div>

                {/* แบบตอบรับคำขอ */}
                {l.hasResponseForm && (
                  <div className="section-divider">
                    <div className="response-title">แบบตอบรับคำขอ</div>
                    <p>อนุญาตให้ดำเนินการตามรายละเอียดที่แจ้งมาในหนังสือ {l.docCode}</p>
                    <p>☐ อนุญาตให้ดำเนินการ</p>
                    <p>☐ โดยเลื่อนไปดำเนินการ ณ วันที่ <span className="dotted" /></p>
                    <p>☐ ไม่อนุญาต เนื่องจาก <span className="dotted" /></p>

                    {l.hasRiskNote && l.riskNote && (
                      <p className="risk-note">
                        <strong>หมายเหตุ :</strong> {l.riskNote}
                      </p>
                    )}

                    <div className="sign-block" style={{ marginTop: 28 }}>
                      <div className="sign-line">ลงชื่อ……………………………………............</div>
                      <div>(.....................................................)</div>
                      <div>ตำแหน่ง……………………………………</div>
                      <div>โรงพยาบาลนครปฐม</div>
                    </div>
                  </div>
                )}

                {signed && l.signedDate && (
                  <p className="no-print muted" style={{ marginTop: 18, fontSize: "12pt" }}>
                    เซ็นเมื่อ: {toThaiDate(l.signedDate)}
                    {l.approverName ? ` โดย ${l.approverName}` : ""}
                  </p>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
