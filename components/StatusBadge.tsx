export function StatusBadge({ status }: { status: string }) {
  const s = (status || "").trim();
  let cls = "badge badge-draft";
  if (s === "เซ็นแล้ว") cls = "badge badge-signed";
  else if (s === "รอเซ็น") cls = "badge badge-wait";
  return <span className={cls}>{s || "ร่าง"}</span>;
}
