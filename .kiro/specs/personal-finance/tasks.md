# Implementation Plan

- [x] 1. Khởi tạo dự án và cấu hình cơ bản

- [x] 1.1 Khởi tạo Next.js 15 project với TypeScript, Tailwind CSS 4, App Router




  - Chạy `create-next-app` với các options phù hợp
  - Cài đặt và cấu hình shadcn/ui
  - Cài đặt Zustand, React Hook Form, Zod
  - Thiết lập cấu trúc thư mục: `app/`, `components/`, `lib/`, `services/`, `db/`
  - _Requirements: 6.1_



- [ ] 1.2 Cấu hình database và ORM
  - Cài đặt Drizzle ORM + drizzle-kit + postgres driver
  - Tạo file schema.ts với tất cả tables (users, transactions, jars, goals, achievements, categories)
  - Tạo drizzle config và migration scripts


  - Seed danh mục mặc định (8 categories)
  - _Requirements: 1.2, 2.1, 3.1_

- [ ] 1.3 Cấu hình Authentication (Social Login)
  - Cài đặt NextAuth.js v5 (Auth.js)
  - Cấu hình Google OAuth provider và Facebook OAuth provider

  - Tạo middleware bảo vệ routes cần auth (redirect về /login nếu chưa đăng nhập)


  - Tạo trang `/login` đơn giản: 2 nút "Đăng nhập bằng Google" và "Đăng nhập bằng Facebook"
  - Auto-create user record trong database khi đăng nhập lần đầu
  - Viết tests cho auth flow (login, session, redirect)
  - _Requirements: 6.3_



- [ ] 2. Module ghi nhận chi tiêu
- [ ] 2.1 Tạo API routes cho transactions
  - Implement `GET /api/transactions` với filter theo period, category, pagination
  - Implement `POST /api/transactions` với Zod validation
  - Implement `PUT /api/transactions/[id]` và `DELETE /api/transactions/[id]`
  - Viết unit tests cho validation logic và query filters


  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 2.2 Tạo UI ghi chi tiêu nhanh (3 click flow)
  - Tạo component `QuickAddButton` (FAB trên mobile, button trên desktop)

  - Tạo component `TransactionForm` dạng modal/sheet: nhập số tiền → chọn category → submit


  - Auto-fill ngày giờ hiện tại
  - Hiển thị danh mục dưới dạng grid icon để chọn nhanh
  - Viết tests cho form validation
  - _Requirements: 1.1, 1.2, 1.3, 6.2_

- [x] 2.3 Tạo trang danh sách chi tiêu


  - Tạo page `/transactions` hiển thị lịch sử chi tiêu
  - Implement filter theo ngày/tuần/tháng và theo danh mục
  - Implement search theo mô tả
  - Hiển thị tổng chi tiêu theo period đang chọn
  - _Requirements: 1.5_



- [ ] 3. Module hũ tài chính
- [x] 3.1 Tạo API routes cho jars

  - Implement `GET /api/jars` trả về danh sách hũ + số dư


  - Implement `POST /api/jars` với validation tổng percentage <= 100%
  - Implement `PUT /api/jars/[id]` để sửa tên, tỷ lệ, ngưỡng cảnh báo
  - Implement `POST /api/jars/[id]/allocate` để phân bổ thu nhập vào hũ
  - Viết unit tests cho logic phân bổ và validation tỷ lệ
  - _Requirements: 2.1, 2.2, 2.3_



- [ ] 3.2 Tạo UI quản lý hũ tài chính
  - Tạo page `/jars` hiển thị danh sách hũ dưới dạng cards
  - Mỗi `JarCard` hiển thị: tên, icon, màu, số dư, progress bar (% đã dùng)
  - Form tạo/sửa hũ với color picker và icon selector
  - Hiển thị cảnh báo khi hũ dưới ngưỡng (highlight đỏ)

  - _Requirements: 2.1, 2.4, 2.5_



- [ ] 3.3 Implement logic phân bổ thu nhập
  - Khi user nhập income, tự động chia vào các hũ theo tỷ lệ
  - Hiển thị preview phân bổ trước khi confirm
  - Liên kết transaction với jar_id tương ứng


  - _Requirements: 2.3, 2.4_

- [ ] 4. Module kế hoạch tiết kiệm
- [ ] 4.1 Tạo API routes cho goals
  - Implement `GET /api/goals` trả về danh sách mục tiêu + tiến độ
  - Implement `POST /api/goals` với tính toán monthly_target tự động
  - Implement `PUT /api/goals/[id]` để cập nhật thông tin


  - Implement `POST /api/goals/[id]/deposit` để nạp tiền vào mục tiêu
  - Viết unit tests cho logic tính monthly_target
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4.2 Tạo UI mục tiêu tiết kiệm

  - Tạo page `/goals` hiển thị danh sách mục tiêu


  - Mỗi `GoalCard` hiển thị: tên, progress ring (%), số tiền hiện tại/mục tiêu, deadline
  - Form tạo mục tiêu: nhập tên, số tiền, deadline → hiển thị "cần tiết kiệm X/tháng"
  - Nút "Nạp tiền" trên mỗi goal card
  - Hiển thị thông báo chúc mừng khi đạt 100%
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 5. Dashboard và báo cáo


- [ ] 5.1 Tạo API routes cho reports
  - Implement `GET /api/reports/summary` trả về tổng thu/chi theo period
  - Implement `GET /api/reports/category-breakdown` trả về chi tiêu theo từng danh mục
  - Implement `GET /api/reports/trend` trả về dữ liệu xu hướng theo tháng


  - Viết unit tests cho aggregation queries
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5.2 Tạo Dashboard page

  - Tạo page `/` (home) hiển thị tổng quan


  - Widget: tổng chi tiêu hôm nay/tuần/tháng
  - Widget: hũ tài chính (mini cards)
  - Widget: mục tiêu tiết kiệm gần nhất
  - Widget: chi tiêu gần đây (5 transactions mới nhất)
  - QuickAddButton luôn hiển thị

  - _Requirements: 6.1, 1.5_


- [ ] 5.3 Tạo trang Reports với biểu đồ
  - Tạo page `/reports`
  - Implement pie chart chi tiêu theo danh mục (Recharts)

  - Implement line chart xu hướng chi tiêu theo thời gian


  - Filter chọn khoảng thời gian (ngày/tuần/tháng/năm)
  - So sánh với tháng trước, highlight thay đổi đáng chú ý
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Tích hợp AI

- [-] 6.1 Tạo AI Service và API routes

  - Implement `POST /api/ai/categorize` — nhận mô tả, trả về category gợi ý
  - Implement `POST /api/ai/chat` — trả lời câu hỏi tài chính bằng ngôn ngữ tự nhiên
  - Implement `GET /api/ai/insights` — phân tích thói quen chi tiêu
  - Implement `GET /api/ai/budget-suggestion` — đề xuất ngân sách tháng tới


  - Implement rule-based fallback khi OpenAI unavailable


  - Viết tests với mock OpenAI responses
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6.2 Tích hợp AI vào flow ghi chi tiêu

  - Khi user nhập mô tả, gọi AI categorize để gợi ý danh mục

  - Hiển thị suggestion chip, user tap để chấp nhận hoặc chọn khác
  - Fallback: nếu AI không phản hồi trong 2s, cho user chọn manual
  - _Requirements: 1.4, 5.5_

- [ ] 6.3 Tạo trang AI Chat
  - Tạo page `/ai` với chat interface
  - User có thể hỏi: "tháng này tôi tiêu bao nhiêu cho ăn uống?"
  - AI trả lời dựa trên dữ liệu thực của user
  - Hiển thị insights cards trên đầu trang (gợi ý tự động)
  - _Requirements: 5.1, 5.3, 5.4_

- [ ] 7. Notifications và Gamification
- [ ] 7.1 Implement hệ thống achievements
  - Tạo logic kiểm tra milestones (7 ngày liên tiếp, first transaction, first goal completed, etc.)
  - Tạo component `AchievementBadge` popup khi đạt milestone
  - Lưu achievements vào database
  - Viết tests cho milestone detection logic
  - _Requirements: 6.4_

- [ ] 7.2 Implement notification system
  - Cấu hình Web Push API với Service Worker
  - Implement nhắc nhở khi user không mở app 2 ngày
  - Implement cảnh báo hũ sắp hết
  - Implement nhắc nhở nạp tiền tiết kiệm đúng lịch
  - Tạo trang settings cho notification preferences
  - _Requirements: 2.5, 3.4, 5.2, 6.5_

- [ ] 8. PWA và Offline Support
- [ ] 8.1 Cấu hình PWA
  - Cài đặt và cấu hình next-pwa
  - Tạo manifest.json (app name, icons, theme color)
  - Cấu hình Service Worker cache strategies (app shell + API responses)
  - Tạo offline fallback page
  - _Requirements: 6.1_

- [ ] 8.2 Implement offline transaction sync
  - Sử dụng IndexedDB (via idb library) để lưu transactions khi offline
  - Implement Background Sync để đồng bộ khi có mạng
  - Tạo component `SyncIndicator` hiển thị trạng thái (online/offline/syncing)
  - Xử lý conflict resolution (last-write-wins)
  - Viết tests cho sync logic
  - _Requirements: 6.1, 6.2_

- [ ] 9. Onboarding và Polish
- [ ] 9.1 Tạo Onboarding flow
  - Tạo page `/onboarding` với 3 bước: giới thiệu → thiết lập hũ → tạo mục tiêu đầu tiên
  - Redirect user mới đến onboarding sau đăng ký
  - Cho phép skip
  - _Requirements: 6.3_

- [ ] 9.2 Responsive design và accessibility
  - Đảm bảo tất cả pages responsive (mobile-first)
  - Kiểm tra và fix accessibility (aria labels, keyboard navigation, color contrast)
  - Tối ưu performance (lazy loading, image optimization)
  - Viết Playwright E2E tests cho các flow chính trên mobile viewport
  - _Requirements: 6.1, 6.2_
