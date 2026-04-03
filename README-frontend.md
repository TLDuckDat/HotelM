# Frontend API Integration Guide

This frontend is served by Spring Boot static resources and now includes app pages connected to backend APIs.

## Pages

- `/login.html`
- `/register.html`
- `/dashboard.html`
- `/rooms.html`
- `/room-detail.html?id=<roomID>`
- `/search.html`
- `/bookings.html`
- `/account.html`
- `/admin-dashboard.html`
- `/contact.html`

## Current backend endpoints used

- `GET /users`
- `POST /users`
- `DELETE /users/{id}`
- `GET /rooms`
- `POST /rooms`
- `GET /bookings`
- `POST /bookings`
- `PATCH /bookings/{id}/status?status=CONFIRMED`
- `POST /bookings/{id}/cancel`

## Notes

- Login is currently frontend-side against `/users` because backend auth endpoint is not available yet.
- Registration is fixed to role `USER` from frontend.
- Admin page requires logged-in user with role `ADMIN`.
- Contact, payment, refund, review are frontend placeholders until backend APIs are implemented.

