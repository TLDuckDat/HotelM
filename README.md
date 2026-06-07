# HotelM

## Project Structure
- **`backend/`**: Spring Boot API + toàn bộ frontend (HTML, CSS, JS) được đặt trong thư mục `src/main/resources/static/` và được serve trực tiếp bởi backend.
- **`database/`**: Script SQL khởi tạo và seed dữ liệu.
- **`docs/`**: Tài liệu kỹ thuật và API.
- **`infra/`**: Cấu hình hạ tầng (ví dụ Nginx).

## Cấu trúc thư mục chi tiết

```text
HotelM/
├── backend/
│   ├── src/main/
│   │   ├── java/org/example/hotelm/
│   │   │   ├── auth/
│   │   │   ├── booking/
│   │   │   ├── branch/
│   │   │   ├── chat/
│   │   │   ├── invoice/
│   │   │   ├── kpi/
│   │   │   ├── review/
│   │   │   ├── room/
│   │   │   ├── user/
│   │   │   └── common/
│   │   │       ├── config/
│   │   │       ├── exception/
│   │   │       └── security/
│   │   │
│   │   └── resources/
│   │       ├── static/          # Chứa toàn bộ source code Frontend (HTML, JS, CSS)
│   │       │   ├── assets/      # Ảnh, CSS...
│   │       │   ├── script/      # JavaScript files
│   │       │   └── *.html       # Các trang giao diện (index.html, bookings.html...)
│   │       └── application.yml
│   │
│   └── test/                 
│
├── database/
│   ├── init-db.sql
│   └── seed-data.sql
│
├── docs/
│   ├── API.md
│   └── ARCHITECTURE.md
│
└── README.md
```

## Quick Start
Chạy backend từ thư mục `backend/`:

```powershell
Set-Location backend
.\mvnw.cmd spring-boot:run
```

Hoặc chạy từ thư mục root bằng Maven module:

```powershell
.\backend\mvnw.cmd -f .\backend\pom.xml spring-boot:run
```

## Notes
- Điểm vào ứng dụng (entry point) là `backend/src/main/java/org/example/hotelm/HotelMApplication.java`.
- CNJAVA
