# Frontend Workspace

Frontend source được tách ra để tổ chức code rõ ràng hơn, nhưng runtime hiện tại vẫn được Spring Boot serve từ `backend/src/main/resources/static/` để tránh phá vỡ hành vi hiện có.

## Structure

- `frontend/index.html`: trang vào tham chiếu.
- `frontend/pages/`: tất cả trang HTML.
- `frontend/assets/`: CSS, hình ảnh, static assets.
- `frontend/js/`: JavaScript modules và API adapters.

## Current Runtime Compatibility

- Backend vẫn serve static pages trong `backend/src/main/resources/static/`.
- Thư mục `frontend/` hiện tại là workspace cho team frontend sắp xếp và nâng cấp.
- Có thể thêm pipeline copy/build sang backend static ở bước tiếp theo.
