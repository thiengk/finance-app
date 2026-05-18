# Hướng dẫn Setup Project

## 1. Cài đặt dependencies

```bash
npm install
```

## 2. Cài đặt shadcn/ui components

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog input
```

## 3. Tạo file environment

```bash
copy .env.example .env
```

Sau đó mở file `.env` và điền thông tin:

- `DATABASE_URL` — Connection string PostgreSQL (lấy từ Neon hoặc Supabase)
- `NEXTAUTH_SECRET` — Chạy `npx auth secret` để generate
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Tạo tại https://console.cloud.google.com/apis/credentials
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` — Tạo tại https://developers.facebook.com
- `OPENAI_API_KEY` — Lấy tại https://platform.openai.com/api-keys

## 4. Setup Database

```bash
# Push schema lên database (không cần migration file)
npm run db:push

# Seed danh mục mặc định
npx tsx db/seed.ts

# (Optional) Mở Drizzle Studio để xem data
npm run db:studio
```

## 5. Chạy development server

```bash
npm run dev
```

Mở http://localhost:3000

## 6. (Optional) Tạo icon cho PWA

Đặt 2 file icon vào `public/icons/`:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

## Các lệnh thường dùng

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run start` | Chạy production build |
| `npm run lint` | Kiểm tra linting |
| `npm run test` | Chạy tests |
| `npm run db:push` | Push schema lên DB |
| `npm run db:generate` | Generate migration files |
| `npm run db:migrate` | Chạy migrations |
| `npm run db:studio` | Mở Drizzle Studio |
| `npx tsx db/seed.ts` | Seed dữ liệu mặc định |

## Yêu cầu hệ thống

- Node.js >= 20
- npm >= 10
- PostgreSQL 16 (hoặc dùng Neon/Supabase cloud)
