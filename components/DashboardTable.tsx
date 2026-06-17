"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Letter } from "@/lib/sheet";
import { StatusBadge } from "./StatusBadge";

export function DashboardTable({ letters }: { letters: Letter[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ทั้งหมด");

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return letters.filter((l) => {
      if (status !== "ทั้งหมด" && (l.status || "ร่าง") !== status) return false;
      if (!kw) return true;
      return [l.docNo, l.docCode, l.subject, l.docTitle, l.docType]
        .join(" ")
        .toLowerCase()
        .includes(kw);
    });
  }, [letters, q, status]);

  return (
    <>
      <div className="toolbar">
        <input
          className="grow"
          placeholder="ค้นหา เลขที่ / เรื่อง / รหัสหนังสือ ..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {["ทั้งหมด", "ร่าง", "รอเซ็น", "เซ็นแล้ว"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="muted">{filtered.length} ฉบับ</span>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th style={{ width: 70 }}>เลขที่</th>
              <th style={{ width: 150 }}>รหัสหนังสือ</th>
              <th>เรื่อง</th>
              <th style={{ width: 130 }}>ประเภท</th>
              <th style={{ width: 110 }}>สถานะ</th>
              <th style={{ width: 110 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.docNo}>
                <td className="code">{l.docNo}</td>
                <td className="code">{l.docCode}</td>
                <td>{l.subject}</td>
                <td>{l.docType}</td>
                <td><StatusBadge status={l.status} /></td>
                <td>
                  <Link className="btn" href={`/doc/${l.docNo}`}>เปิด →</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="muted" style={{ textAlign: "center", padding: 32 }}>
                ไม่พบหนังสือที่ตรงกับเงื่อนไข
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
