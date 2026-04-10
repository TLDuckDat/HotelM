# HotelM

Monorepo tách rõ backend/frontend nhưng vẫn giữ backend Spring Boot chạy ổn định.

## Project Structure

- `backend/`: Spring Boot API + static resources đang được serve bởi backend.
- `frontend/`: Bản source frontend để team UI làm việc độc lập, không làm ảnh hưởng runtime backend hiện tại.
- `database/`: Script SQL khởi tạo và seed dữ liệu.
- `docs/`: Tài liệu kỹ thuật và API.
- `infra/`: Cấu hình hạ tầng (ví dụ Nginx).

## Cấu trúc thư mục chi tiết

```text
HotelM/
├── pom.xml
├── README.md
├── backend/
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── README.md
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/org/example/hotelm/
│   │   │   │   ├── HotelMApplication.java            # Spring Boot entry point
│   │   │   │   ├── auth/                             # Authentication module
│   │   │   │   ├── booking/                          # Booking domain
│   │   │   │   ├── chat/                             # Chat features
│   │   │   │   ├── common/
│   │   │   │   │   ├── config/                       # Security, CORS, app config
│   │   │   │   │   ├── exception/                    # Global exception handling
│   │   │   │   │   └── security/                     # JWT filter/service
│   │   │   │   ├── contact/                          # Contact module
│   │   │   │   ├── invoice/                          # Invoice domain
│   │   │   │   ├── payment/                          # Payment domain
│   │   │   │   ├── refund/                           # Refund domain
│   │   │   │   ├── review/                           # Review domain
│   │   │   │   ├── room/                             # Room + RoomType domain
│   │   │   │   │   ├── controller/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entity/
│   │   │   │   │   ├── mapper/
│   │   │   │   │   ├── repository/
│   │   │   │   │   └── service/
│   │   │   │   └── user/                             # User domain
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application.properties
│   │   │       ├── application-dev.properties
│   │   │       ├── application-prod.properties
│   │   │       └── static/                           # Current frontend runtime served by backend
│   │   └── test/
│   │       └── java/org/...
│   └── target/
├── frontend/
│   ├── index.html
│   ├── README.md
│   ├── assets/
│   │   ├── css/
│   │   └── image/
│   ├── js/
│   │   ├── api/                                      # baseApi, roomApi, bookingApi, ...
│   │   └── *.js                                      # Page logic scripts
│   └── pages/
│       └── *.html
├── database/
│   ├── init-db.sql
│   └── seed-data.sql
├── docs/
│   ├── API.md
│   └── ARCHITECTURE.md
├── infra/
│   └── nginx/
│       └── nginx.conf
└── hotel/
```

## Quick Start

Chạy backend từ thư mục `backend/`:

```powershell
Set-Location backend
.\mvnw.cmd spring-boot:run
```

Hoặc chạy từ root bằng Maven module:

```powershell
.\backend\mvnw.cmd -f .\backend\pom.xml spring-boot:run
```

## Notes

- Điểm vào ứng dụng vẫn là `backend/src/main/java/org/example/hotelm/HotelMApplication.java`.
- Frontend runtime hiện tại vẫn nằm trong `backend/src/main/resources/static/` để tránh phá vỡ hành vi hiện có.
- `frontend/` là không gian tổ chức lại code UI theo hướng chuyên nghiệp, có thể gắn pipeline build/copy sau.

