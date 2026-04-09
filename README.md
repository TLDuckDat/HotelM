# HotelM

Monorepo layout tách rõ backend/frontend nhưng vẫn giữ backend Spring Boot chạy ổn định.

## Project Structure

- `backend/`: Spring Boot API + static resources đang được serve bởi backend.
- `frontend/`: Bản source frontend để team UI làm việc độc lập, không làm ảnh hưởng runtime backend hiện tại.
- `database/`: Script SQL khởi tạo và seed dữ liệu.
- `docs/`: Tài liệu kỹ thuật và API.
- `infra/`: Cấu hình hạ tầng (ví dụ Nginx).

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
- Frontend runtime hiện tại vẫn nằm trong `backend/src/main/resources/static/` để tránh phá vỡ behavior.
- `frontend/` là không gian tổ chức lại code UI theo hướng chuyên nghiệp, có thể gắn pipeline build/copy sau.

