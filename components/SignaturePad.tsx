"use client";

import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

interface Props {
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
}

export function SignaturePad({ onCancel, onConfirm }: Props) {
  const ref = useRef<SignatureCanvas>(null);

  const clear = () => ref.current?.clear();
  const confirm = () => {
    const pad = ref.current;
    if (!pad || pad.isEmpty()) {
      alert("กรุณาวาดลายเซ็นก่อน");
      return;
    }
    // ใช้ getCanvas() แทน getTrimmedCanvas() เพื่อเลี่ยงปัญหา bug บางเวอร์ชัน
    onConfirm(pad.getCanvas().toDataURL("image/png"));
  };

  return (
    <div className="overlay no-print">
      <div className="modal">
        <h3 style={{ marginTop: 0 }}>เซ็นหนังสือ</h3>
        <p className="muted" style={{ marginTop: 0 }}>วาดลายเซ็นในกรอบด้านล่าง</p>
        <div className="pad-wrap">
          <SignatureCanvas
            ref={ref}
            penColor="#0b3d91"
            canvasProps={{ width: 472, height: 200, className: "pad-canvas" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
          <button className="btn" onClick={clear}>ล้าง</button>
          <button className="btn" onClick={onCancel}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={confirm}>ยืนยันลายเซ็น</button>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.45);
          display: flex; align-items: center; justify-content: center; z-index: 50;
        }
        .modal {
          background: #fff; border-radius: 14px; padding: 22px; width: 520px; max-width: 92vw;
        }
        .pad-wrap { border: 2px dashed #c2c8d4; border-radius: 10px; overflow: hidden; background: #fff; }
        :global(.pad-canvas) { display: block; touch-action: none; }
      `}</style>
    </div>
  );
}
