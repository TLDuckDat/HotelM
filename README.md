# 🏨 HotelM - Hotel Management System

HotelM is a web-based hotel room booking and management system for small to medium hotels.

It aims to:
- Simplify room booking for guests
- Support receptionists with check-in / check-out and invoice generation
- Help admins manage rooms, users, and view basic reports

---

## English Documentation

### Overview

- **Guest**
  - Register and login
  - Browse available rooms
  - Create and cancel bookings
  - View booking history
  - Leave reviews for stays

- **Receptionist**
  - Check-in / check-out guests
  - View and manage bookings
  - Generate invoices

- **Admin**
  - Manage rooms and room types
  - Manage users (guests, receptionists, admins)
  - View simple revenue / booking reports

### Tech Stack

- **Backend**: Java 17+, Spring Boot
- **Database**: MySQL
- **Build Tool**: Maven
- **Other**: Spring Data JPA, Spring Web

### Project Structure

```
HotelM/
├── src/
│   ├── main/
│   │   ├── java/org/example/hotelm/
│   │   │   ├── config/          # Application configuration
│   │   │   ├── controller/      # REST controllers (Booking, Room, User, ...)
│   │   │   ├── model/           # Entity classes
│   │   │   │   ├── Booking.java
│   │   │   │   ├── Invoice.java
│   │   │   │   ├── Review.java
│   │   │   │   ├── Room.java
│   │   │   │   ├── RoomType.java
│   │   │   │   └── User.java
│   │   │   ├── repository/      # Data access layer (JPA repositories)
│   │   │   ├── service/         # Business logic (BookingService, RoomService, ...)
│   │   │   └── HotelMApplication.java
│   │   └── resources/
│   │       ├── static/
│   │       ├── templates/
│   │       └── application.properties
│   └── test/
└── pom.xml
```

### Getting Started (Local Development)

1. **Prerequisites**
   - Java 17+ installed
   - Maven installed
   - MySQL running locally

2. **Database setup**
   - Create a database, for example:
     - Name: `hotelm`
   - Update `application.properties` with your:
     - `spring.datasource.url`
     - `spring.datasource.username`
     - `spring.datasource.password`

3. **Run the application**

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`.

4. **Example API endpoints**
   - `GET /bookings` – list all bookings
   - `GET /bookings/{id}` – get booking by ID
   - `POST /bookings` – create a new booking
   - `PATCH /bookings/{id}/status` – update booking status
   - `DELETE /bookings/{id}` – delete a booking

---

## Tài liệu tiếng Việt

### Tổng quan

HotelM là hệ thống quản lý khách sạn (đặt phòng và vận hành) dành cho khách sạn nhỏ đến trung bình.

- **Khách (Guest)**
  - Đăng ký, đăng nhập tài khoản
  - Xem danh sách phòng còn trống
  - Tạo và hủy booking
  - Xem lịch sử đặt phòng
  - Đánh giá sau khi ở

- **Lễ tân (Receptionist)**
  - Làm thủ tục check-in / check-out
  - Xem và quản lý các booking
  - Tạo hóa đơn thanh toán cho khách

- **Quản trị (Admin)**
  - Quản lý phòng, loại phòng
  - Quản lý người dùng (khách, lễ tân, admin)
  - Xem các báo cáo cơ bản (doanh thu, số lượng booking, …)

### Công nghệ sử dụng

- **Backend**: Java 17+, Spring Boot
- **Cơ sở dữ liệu**: MySQL
- **Công cụ build**: Maven
- **Khác**: Spring Data JPA, Spring Web

### Cấu trúc dự án

```
HotelM/
├── src/
│   ├── main/
│   │   ├── java/org/example/hotelm/
│   │   │   ├── config/          # Cấu hình ứng dụng
│   │   │   ├── controller/      # Các REST controller (Booking, Room, User, ...)
│   │   │   ├── model/           # Các entity ánh xạ bảng trong DB
│   │   │   ├── repository/      # Tầng truy cập dữ liệu (JPA repository)
│   │   │   ├── service/         # Tầng xử lý nghiệp vụ
│   │   │   └── HotelMApplication.java
│   │   └── resources/
│   │       ├── static/
│   │       ├── templates/
│   │       └── application.properties
│   └── test/
└── pom.xml
```

### Hướng dẫn chạy dự án (local)

1. **Chuẩn bị**
   - Cài đặt Java 17 trở lên
   - Cài đặt Maven
   - Khởi chạy MySQL trên máy

2. **Tạo database**
   - Tạo database mới, ví dụ:
     - Tên: `hotelm`
   - Cập nhật cấu hình trong `application.properties`:
     - `spring.datasource.url`
     - `spring.datasource.username`
     - `spring.datasource.password`

3. **Chạy ứng dụng**

```bash
mvn spring-boot:run
```

Ứng dụng sẽ chạy tại `http://localhost:8080`.

4. **Một số API ví dụ**
   - `GET /bookings` – lấy danh sách booking
   - `GET /bookings/{id}` – xem chi tiết một booking
   - `POST /bookings` – tạo booking mới
   - `PATCH /bookings/{id}/status` – cập nhật trạng thái booking
   - `DELETE /bookings/{id}` – xóa booking

---

Feel free to extend this README with more modules (rooms, users, reviews, invoices) as the project grows.
