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
│   │       ├── static/        
│   │       └── application.yml
│   │
│   └── test/                 
│
├── frontend/
│   ├── components/
│   │   ├── app-shell/
│   │   └── chatbox/
│   │
│   ├── core/
│   │   ├── api/
│   │   ├── guards/
│   │   └── store/
│   │
│   ├── features/
│   │   ├── about/
│   │   ├── account/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── contact/
│   │   ├── dashboard/
│   │   ├── home/
│   │   ├── offer/
│   │   ├── payment/
│   │   ├── refund/
│   │   ├── restaurant/
│   │   ├── review/
│   │   ├── room/
│   │   ├── search/
│   │   ├── service/
│   │   ├── villa/
│   │   └── wedding/
│   │
│   ├── images/
│   └── index.html
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

Hoặc chạy từ root bằng Maven module:

```powershell
.\backend\mvnw.cmd -f .\backend\pom.xml spring-boot:run
```

## Notes

- Điểm vào ứng dụng vẫn là `backend/src/main/java/org/example/hotelm/HotelMApplication.java`.
- Frontend runtime hiện tại vẫn nằm trong `backend/src/main/resources/static/` để tránh phá vỡ hành vi hiện có.
- `frontend/` là không gian tổ chức lại code UI theo hướng chuyên nghiệp, có thể gắn pipeline build/copy sau.

