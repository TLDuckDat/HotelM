# 🏨 HotelM - Hotel Management System

A web-based hotel room booking and management system for small hotels.

## Features

**Guest**
- Register, login, browse and book rooms
- View booking history, cancel bookings, leave reviews

**Receptionist**
- Check-in / check-out guests, generate invoices

**Admin**
- Manage rooms, users, and view revenue reports

## Tech Stack

- **Backend:** Java Spring Boot
- **Database:** MySQL
- **Build Tool:** Maven

## Project Structure

```
HotelM/
├── src/
│   ├── main/
│   │   ├── java/org/example/hotelm/
│   │   │   ├── config/          # App configuration
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── model/           # Entity classes
│   │   │   │   ├── Booking.java
│   │   │   │   ├── Invoice.java
│   │   │   │   ├── Review.java
│   │   │   │   ├── Room.java
│   │   │   │   ├── RoomType.java
│   │   │   │   └── User.java
│   │   │   ├── repository/      # Data access layer
│   │   │   ├── service/         # Business logic
│   │   │   └── HotelMApplication.java
│   │   └── resources/
│   │       ├── static/
│   │       ├── templates/
│   │       └── application.properties
│   └── test/
└── pom.xml
```
