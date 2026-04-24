# Frontend Workspace

Thư mục này chứa mã nguồn frontend, được tổ chức lại nhằm tăng tính rõ ràng, dễ bảo trì và mở rộng trong tương lai.

## Tổng quan

Frontend hiện đang được phát triển như một workspace riêng.
Tuy nhiên, ở thời điểm runtime, toàn bộ file tĩnh vẫn được serve bởi Spring Boot từ thư mục:

`backend/src/main/resources/static/`

Cách làm này giúp giữ nguyên hành vi hiện tại của hệ thống, đồng thời cho phép frontend được cải tiến độc lập.

## Cấu trúc thư mục

* `frontend/index.html`
  Trang entry chính của ứng dụng.

* `frontend/features/`
  Chứa các module theo từng chức năng (feature).
  Mỗi feature bao gồm HTML, CSS và JavaScript riêng.

* `frontend/core/`
  Chứa các phần dùng chung toàn hệ thống (API, guard, ...).

* `frontend/components/`
  Các thành phần UI tái sử dụng (chatbox, app-shell).

* `frontend/assets/`
  Tài nguyên tĩnh như CSS global, hình ảnh, ...

## Tương thích runtime

* Backend vẫn serve file tĩnh từ:
  `backend/src/main/resources/static/`

* Thư mục `frontend/` hiện đóng vai trò là môi trường phát triển (workspace), chưa ảnh hưởng trực tiếp đến runtime.

* Có thể bổ sung pipeline build/copy trong tương lai để đồng bộ frontend sang thư mục static của backend.

## Ghi chú

* Cấu trúc sử dụng hướng tiếp cận theo feature để tăng khả năng mở rộng.
* Tên file được đặt theo chuẩn chữ thường và kebab-case.
* Việc tách riêng frontend giúp dễ dàng nâng cấp lên các framework hiện đại (SPA) trong tương lai.
