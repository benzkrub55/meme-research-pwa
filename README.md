# วิจัยมีมคอยน์ (Meme Research PWA)

แอป Progressive Web App มือถือเฟิร์สต์สำหรับดู **GMGN Hot Search** มีมคอยน์  
UI ภาษาไทย · โทนมืดคริปโต · รองรับ Add to Home Screen บน iPhone

---

## English (quick)

Mobile-first Next.js PWA for GMGN hot-search meme research. Thai UI, dark crypto aesthetic, server-only GMGN API key.

```bash
cp .env.example .env.local   # or set GMGN_API_KEY
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start
```

Get a personal API key: https://gmgn.ai/ai  
Demo key (testing only): `gmgn_solbscbaseethmonadtron`

**iPhone Add to Home Screen:** Safari → Share → Add to Home Screen → open as standalone.

---

## วิธีรัน (ไทย)

```bash
cd meme-research-pwa
cp .env.example .env.local
# แก้ GMGN_API_KEY เป็นคีย์ส่วนตัวถ้ามี
npm install
npm run dev
```

เปิด http://localhost:3000

โปรดักชัน:

```bash
npm run build
npm start
```

## Environment

| ตัวแปร | คำอธิบาย |
|--------|----------|
| `GMGN_API_KEY` | คีย์ OpenAPI ของ GMGN (ใช้ฝั่งเซิร์ฟเวอร์เท่านั้น) |

- คีย์ส่วนตัว: สร้างที่ [https://gmgn.ai/ai](https://gmgn.ai/ai)
- คีย์เดโม (ทดสอบท้องถิ่นเท่านั้น): `gmgn_solbscbaseethmonadtron`
- **อย่า**ใส่คีย์ในโค้ดฝั่ง client — Route Handlers เรียก GMGN บนเซิร์ฟเวอร์เท่านั้น
- Rate limit ประมาณ ~1 rps · GMGN รับ IPv4

ไฟล์อ้างอิง: `.env.example` (คัดลอกเป็น `.env.local`)

## ฟีเจอร์

- ฟีด Hot Search: กรองเชน `sol` (ค่าเริ่มต้น) / `bsc` / `base` / `eth` / ทั้งหมด
- ช่วงเวลา `1m` / `5m` / `1h` (ค่าเริ่มต้น) / `6h` / `24h` · limit ~50
- แถว: อันดับ, โลโก้, สัญลักษณ์/ชื่อ, เชน, ราคา, % เปลี่ยน, visiting_count, liquidity/mcap
- ดึงลงเพื่อรีเฟรช + อัตโนมัติทุก ~60 วินาที
- หน้าโทเคน: ฟิลด์วิจัย, คัดลอก address, ลิงก์ gmgn.ai
- โน้ตวิจัยต่อ address ใน `localStorage`

## API ภายใน

- `GET /api/hot-searches?chain=sol&interval=1h&limit=50`
- `GET /api/token/[chain]/[address]`

เซิร์ฟเวอร์เรียก `POST https://openapi.gmgn.ai/v1/market/hot_searches`  
(รูปแบบเดียวกับ `npx gmgn-cli market hot-searches --chain sol --interval 1h --limit 50 --raw`)

## ติดตั้งบน iPhone (Add to Home Screen)

1. เปิดเว็บด้วย **Safari**
2. แตะปุ่ม **Share** (แชร์)
3. เลือก **Add to Home Screen** / เพิ่มไปยังหน้าจอโฮม
4. เปิดไอคอน — ทำงานแบบ standalone (ไม่มีแถบ Safari)

## Git

โปรเจกต์นี้ commit บน `main` ท้องถิ่นแล้ว — **ยังไม่มี remote**  
เมื่อพร้อม: `git remote add origin <url> && git push -u origin main`

## สแต็ก

Next.js App Router · TypeScript · Tailwind CSS · GMGN OpenAPI
