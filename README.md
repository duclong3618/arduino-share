# 🔧 ArduinoHub — Nền tảng chia sẻ mã Arduino

Nền tảng web cho cộng đồng Arduino Việt Nam, nơi người dùng có thể **chia sẻ sketch**, **tra cứu lỗi**, và **học hỏi** cùng nhau. Xây dựng bằng Next.js 14, Prisma ORM, Supabase, và shadcn/ui.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-3FC68E?style=flat-square&logo=supabase)

---

## 📋 Mục lục

- [Tính năng chính](#-tính-năng-chính)
- [Tech Stack](#-tech-stack)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cơ sở dữ liệu](#-cơ-sở-dữ-liệu)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Các trang (Pages)](#-các-trang-pages)
- [API Routes](#-api-routes)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [Đóng góp](#-đóng-góp)
- [License](#-license)

---

## ✨ Tính năng chính

### 📝 Đăng dự án Arduino
- Form đa bước (5 bước): Thông tin → Code → Phần cứng → Hướng dẫn → Lỗi & Tags
- Syntax highlighting cho mã Arduino/C++
- Copy-to-clipboard và tải file `.ino`
- Lưu lịch sử phiên bản (version history)

### 🐛 Thư viện lỗi Arduino
- Cơ sở dữ liệu lỗi tìm kiếm được
- Mỗi lỗi bao gồm: thông báo lỗi → nguyên nhân → cách sửa
- Code snippet fix minh họa
- Hệ thống upvote để cộng đồng xác nhận

### 🔍 Tìm kiếm & Lọc
- Tìm theo từ khóa: tên dự án, mô tả, mã nguồn, tên lỗi
- Lọc theo: độ khó, loại board, thể loại
- Sắp xếp: mới nhất, nhiều upvote, nhiều lượt xem

### 👤 Hệ thống người dùng
- Đăng ký/đăng nhập bằng Email hoặc GitHub OAuth
- Hồ sơ người dùng với điểm uy tín (reputation)
- Hệ thống huy hiệu (badges)

### 💬 Tương tác cộng đồng
- Bình luận trên mỗi dự án
- Upvote dự án và xác nhận lỗi
- "Tested & Working" badge khi dự án được xác nhận

### 🎨 Giao diện
- Dark mode mặc định (phong cách IDE)
- Responsive trên mobile/tablet/desktop
- Error cards màu đỏ dễ nhận biết
- Code blocks cuộn được, không bị cắt

---

## 🛠 Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL |
| **File Storage** | Supabase Storage |
| **Auth** | NextAuth.js (Email + GitHub OAuth) |
| **State** | React Hook Form + Zod |
| **Icons** | Lucide React |
| **Animation** | Tailwind CSS Animate |

---

## 📂 Cấu trúc dự án

```
arduino-share/
├── prisma/
│   └── schema.prisma          # Schema database đầy đủ
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # NextAuth + Register
│   │   │   ├── projects/       # CRUD dự án
│   │   │   ├── errors/         # Thư viện lỗi
│   │   │   ├── comments/       # Bình luận
│   │   │   ├── search/         # Tìm kiếm toàn cục
│   │   │   └── users/          # Hồ sơ người dùng
│   │   ├── projects/           # Trang dự án
│   │   │   ├── page.tsx        # Danh sách dự án
│   │   │   └── [id]/page.tsx   # Chi tiết dự án
│   │   ├── errors/             # Thư viện lỗi
│   │   ├── submit/             # Đăng dự án (multi-step)
│   │   ├── login/              # Đăng nhập
│   │   ├── register/           # Đăng ký
│   │   ├── profile/[username]/ # Hồ sơ người dùng
│   │   ├── dashboard/          # Quản lý dự án
│   │   ├── layout.tsx          # Root layout (navbar + footer)
│   │   ├── globals.css         # Global styles + dark mode
│   │   └── page.tsx            # Trang chủ
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components (15+)
│   │   └── layout/             # Navbar, Footer, Sheet
│   └── lib/
│       ├── auth.ts             # NextAuth config
│       ├── prisma.ts           # Prisma client singleton
│       ├── supabase.ts         # Supabase client
│       ├── session-provider.tsx
│       └── utils.ts            # Utility functions
├── .env.local                  # Environment variables
├── .env.example                # Template env
├── tailwind.config.ts          # Theme + shadcn/ui
└── package.json
```

---

## 💾 Cơ sở dữ liệu

### 12 bảng trong PostgreSQL

```
┌─────────────────────┐     ┌──────────────────────┐
│       users          │     │      projects         │
├─────────────────────┤     ├──────────────────────┤
│ id (PK)             │◄────│ userId (FK)           │
│ username (unique)   │     │ title, slug           │
│ email (unique)      │     │ code, description     │
│ passwordHash        │     │ boardType, difficulty │
│ avatarUrl           │     │ hardwareRequirements  │
│ reputation (int)    │     │ usageGuide            │
│ role (USER/MOD/ADM) │     │ status (PEND/APR/REJ) │
└─────────────────────┘     │ upvotes, viewCount    │
                            └──────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
           │ project_tags │ │project_errors│ │    comments       │
           ├──────────────┤ ├──────────────┤ ├──────────────────┤
           │ projectId(FK)│ │ projectId(FK)│ │ projectId (FK)   │
           │ tagId (FK)   │ │ errorMessage │ │ userId (FK)      │
           └──────────────┘ │ cause, fix   │ │ content          │
                            │ codeSnippet  │ │ createdAt        │
                            │ upvotes      │ └──────────────────┘
                            └──────────────┘
                                     │
                    ┌────────────────┼───────────────┐
                    ▼                ▼               ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
           │     tags     │ │  upvotes     │ │  badges      │
           ├──────────────┤ ├──────────────┤ ├──────────────┤
           │ name(unique) │ │ userId (FK)  │ │ name, icon   │
           │ category     │ │ projectId(FK)│ │ description  │
           └──────────────┘ │ errorId (FK) │ └──────────────┘
                            └──────────────┘

           ┌──────────────────┐  ┌──────────────┐  ┌──────────┐
           │ project_versions │  │ user_badges  │  │ accounts │
           ├──────────────────┤  ├──────────────┤  ├──────────┤
           │ projectId (FK)   │  │ userId (FK)  │  │ userId   │
           │ code, changelog  │  │ badgeId (FK) │  │ provider │
           └──────────────────┘  └──────────────┘  └──────────┘
```

### Enum types

| Enum | Giá trị |
|------|---------|
| `BoardType` | UNO, MEGA, NANO, ESP32, ESP8266, LEONARDO, DUE, OTHER |
| `Difficulty` | BEGINNER, INTERMEDIATE, ADVANCED |
| `ProjectStatus` | PENDING, APPROVED, REJECTED, FLAGGED |
| `TagCategory` | SENSOR, MOTOR, IOT, DISPLAY, COMMUNICATION, POWER, INPUT, LED, AUDIO, OTHER |
| `UserRole` | USER, MODERATOR, ADMIN |
| `ReportStatus` | PENDING, REVIEWED, RESOLVED, DISMISSED |

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu
- Node.js >= 18
- PostgreSQL (local hoặc Supabase)
- npm hoặc yarn

### 1. Clone repository

```bash
git clone https://github.com/duclong3618/arduino-share.git
cd arduino-share
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Environment Variables

```bash
cp .env.example .env.local
```

Chỉnh sửa `.env.local`:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/arduinohub"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SECRET_KEY=your_secret_key

# NextAuth
NEXTAUTH_SECRET=your_random_32_char_secret_here
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth (tùy chọn)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 4. Setup Database

```bash
# Tạo database migration
npx prisma migrate dev --name init

# Tạo Prisma Client
npx prisma generate

# (Tùy chọn) Seed data mẫu
npx prisma db seed
```

### 5. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## 📄 Các trang (Pages)

| Route | Mô tả | Auth |
|-------|-------|------|
| `/` | Trang chủ: dự án nổi bật, lỗi phổ biến, thống kê | ❌ |
| `/projects` | Danh sách dự án với tìm kiếm & lọc | ❌ |
| `/projects/[id]` | Chi tiết dự án: code, hướng dẫn, lỗi, bình luận | ❌ |
| `/submit` | Form đa bước đăng dự án mới | ✅ |
| `/errors` | Thư viện lỗi Arduino tìm kiếm được | ❌ |
| `/errors/[id]` | Chi tiết lỗi | ❌ |
| `/login` | Đăng nhập (Email + GitHub) | ❌ |
| `/register` | Đăng ký tài khoản | ❌ |
| `/profile/[username]` | Hồ sơ người dùng + dự án | ❌ |
| `/dashboard` | Quản lý dự án cá nhân + thống kê | ✅ |

---

## 🔌 API Routes

### Authentication
```
POST   /api/auth/register          Đăng ký tài khoản mới
POST   /api/auth/[...nextauth]     NextAuth endpoints (login, session...)
```

### Projects
```
GET    /api/projects               Danh sách dự án (hỗ trợ filter/search/pagination)
POST   /api/projects               Đăng dự án mới
GET    /api/projects/[id]          Chi tiết dự án (tăng viewCount tự động)
PATCH  /api/projects/[id]          Cập nhật dự án (chỉ chủ sở hữu)
POST   /api/projects/[id]/upvote   Toggle upvote (cộng/trừ reputation)
```

### Errors
```
GET    /api/errors                 Thư viện lỗi (tìm kiếm theo error message/cause/fix)
POST   /api/errors                 Thêm lỗi mới
POST   /api/errors/[id]/upvote     Upvote xác nhận lỗi
```

### Comments
```
POST   /api/comments               Bình luận (tăng reputation người bình luận)
```

### Search
```
GET    /api/search?q=keyword       Tìm kiếm toàn cục (projects + errors + tags)
```

### Users
```
GET    /api/users/[username]       Hồ sơ người dùng + dự án
```

---

## 🎮 Hướng dẫn sử dụng

### Đăng ký tài khoản
1. Truy cập `/register`
2. Nhập tên người dùng, email, mật khẩu (hoặc đăng ký bằng GitHub)
3. Bắt đầu chia sẻ dự án!

### Đăng dự án mới
1. Nhấn **"Đăng dự án"** trên navbar
2. **Bước 1:** Nhập tiêu đề và mô tả
3. **Bước 2:** Paste code Arduino (.ino)
4. **Bước 3:** Chọn board, độ khó, mô tả phần cứng
5. **Bước 4:** Viết hướng dẫn từng bước
6. **Bước 5:** Thêm lỗi thường gặp (tùy chọn) và gắn tags
7. Nhấn **"Đăng dự án"** — dự án sẽ ở trạng thái chờ duyệt

### Tìm lỗi nhanh
1. Truy cập `/errors`
2. Nhập thông báo lỗi chính xác từ Serial Monitor
3. Xem nguyên nhân và cách sửa
4. Upvote nếu fix đã hoạt động

### Hệ thống điểm uy tín (Reputation)
| Hành động | Điểm |
|-----------|------|
| Đăng dự án được duyệt | +10 |
| Dự án nhận được upvote | +1 |
| Viết bình luận | +1 |
| Upvote xác nhận lỗi | +1 |

---

## 🏗 Kế hoạch phát triển

- [ ] Hệ thống moderation (duyệt dự án trước khi publish)
- [ ] Nâng cấp: Supabase Storage cho ảnh wiring/Fritzing
- [ ] Tìm kiếm full-text nâng cao (Meilisearch)
- [ ] Push notification khi có bình luận mới
- [ ] Chế độ Light/Dark toggle
- [ ] Widget "Tested & Working" badge
- [ ] Leaderboard người dùng đóng góp nhiều nhất
- [ ] API public cho第三方 integrations

---

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit thay đổi: `git commit -m 'Thêm tính năng mới'`
4. Push lên branch: `git push origin feature/ten-tinh-nang`
5. Mở Pull Request

### Quy tắc commit
- `feat:` — Tính năng mới
- `fix:` — Sửa lỗi
- `docs:` — Tài liệu
- `style:` — Style/formatting
- `refactor:` — Refactor code
- `test:` — Thêm test

---

## 📝 License

Dự án mã nguồn mở. Sử dụng với mục đích học tập và thương mại.

---

<p align="center">
  Xây dựng với ❤️ cho cộng đồng Arduino Việt Nam
</p>
