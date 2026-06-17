/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Export เป็นไฟล์ static ทั้งหมด (ไม่มี server) สำหรับ GitHub Pages
  output: "export",
  // เว็บอยู่ที่ https://<user>.github.io/sign-docs/ จึงต้องตั้ง basePath
  basePath: "/sign-docs",
  // ใส่ slash ท้าย URL เพื่อให้ routing บน GitHub Pages ทำงานถูก
  trailingSlash: true,
  // ปิด Image Optimization (ต้องมี server) — ใช้ <img> ธรรมดา
  images: { unoptimized: true },
};

export default nextConfig;
