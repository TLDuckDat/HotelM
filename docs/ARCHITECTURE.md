# Architecture

## Current Layout

- Backend: `backend/` (Spring Boot, Java 21)
- Frontend source workspace: `frontend/`
- Database scripts: `database/`
- Infrastructure: `infra/`

## Runtime

- Entry point: `backend/src/main/java/org/example/hotelm/HotelMApplication.java`
- Static content served by Spring Boot from: `backend/src/main/resources/static/`

## Migration Direction

1. Keep backend runtime stable.
2. Continue organizing frontend in `frontend/`.
3. Add build/sync pipeline from `frontend/` to backend static resources when team is ready.

