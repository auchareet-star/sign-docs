# ระบบออกหนังสือ (Doc-Approve Web)

เว็บแอปอ่านข้อมูลหนังสือจาก **Google Sheet** → แสดงรายการพร้อมสถานะ (ร่าง / รอเซ็น / เซ็นแล้ว)
→ เปิดดูหนังสือตามฟอร์มจริง → **เซ็น** (วาดลายเซ็น) → **Export เป็น PDF**

## คุณสมบัติ
- อ่าน Google Sheet แบบ public CSV (ไม่ต้องตั้ง credential สำหรับการอ่าน)
- Dashboard: ค้นหา / กรองสถานะ / ป้ายสถานะสี
- เรนเดอร์หนังสือขนาด A4 ฟอนต์ Sarabun รองรับทั้ง "ปรับปรุงระบบ" และ "ปิดระบบ"
- เปิด/ปิด "แบบตอบรับคำขอ" และ "หมายเหตุความเสี่ยง" ได้ต่อฉบับ
- แปลงวันที่เซ็นจาก ค.ศ. → พ.ศ. อัตโนมัติ
- เซ็นด้วยการวาดลายเซ็น แล้ว Export PDF (ผ่านระบบพิมพ์ของเบราว์เซอร์ → Save as PDF)
- (ตัวเลือก) เขียนสถานะ "เซ็นแล้ว" + วันที่เซ็น กลับไปที่ Google Sheet

## เริ่มใช้งาน
```bash
cd web
npm install
# แก้ค่าใน .env.local ให้เป็นรหัส Google Sheet ของคุณ
npm run dev
```
เปิด http://localhost:3000/sign-docs/ (เว็บตั้ง `basePath: /sign-docs`)

> **สำคัญ:** Google Sheet ต้องตั้งค่าแชร์เป็น **"ทุกคนที่มีลิงก์ดูได้"** เพื่อให้เว็บอ่าน CSV ได้

## การตั้งค่า (.env.local)
| ตัวแปร | จำเป็น | คำอธิบาย |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_SHEET_ID` | ✅ | รหัส Sheet (ส่วนระหว่าง `/d/` กับ `/edit` ใน URL) |
| `NEXT_PUBLIC_SHEET_CSV_URL` | ⬜ | ลิงก์ CSV เต็ม (เช่น Publish to web) ใช้แทน ID เมื่อเจอปัญหา CORS |

> เพราะ build เป็น **static** (ไม่มี server) ค่าจึงต้องขึ้นต้นด้วย `NEXT_PUBLIC_` และเว็บจะอ่าน Sheet จากฝั่ง browser โดยตรง

## โครงสร้างคอลัมน์ใน Sheet
ดูไฟล์ตัวอย่าง `./ตัวอย่าง-ข้อมูลหนังสือ.xlsx` (ชีต "คำอธิบายคอลัมน์")
หัวคอลัมน์ใน Google Sheet ต้องตรงกับไฟล์นี้

## Deploy ขึ้น GitHub Pages
deploy แบบ manual จากเครื่อง (ไม่มี CI/CD) ด้วยแพ็กเกจ `gh-pages`:
```bash
cd web
npm run deploy
```
คำสั่งนี้จะ `next build` (export ออกที่โฟลเดอร์ `out/`) แล้ว push เนื้อหาขึ้น branch `gh-pages`
เว็บจะอยู่ที่ **https://auchareet-star.github.io/sign-docs/**

ครั้งแรกหลัง deploy: ไปที่ GitHub repo → **Settings → Pages** → ตั้ง Source = **Deploy from a branch**,
Branch = **`gh-pages`** / **`/ (root)`** แล้ว Save

> ฟีเจอร์ "เขียนสถานะกลับ Sheet" ผ่าน `apps-script/` ต้องมี server (เช่น Vercel) จึงไม่ทำงานในเวอร์ชัน static นี้
> — แต่การดูรายการ / เซ็น / Export PDF ใช้งานได้ครบ
