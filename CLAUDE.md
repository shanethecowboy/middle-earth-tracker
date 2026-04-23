# CLAUDE.md — fellowshipofthecode.com

## Project Overview
Full-stack web application hosted at fellowshipofthecode.com. Contains two features:
1. **Jones County XC** — athlete roster, meet schedule, and race results for a high school cross country team
2. **Middle Earth Tracker** — personal progress tracker for all Tolkien books and films (LotR + Hobbit)

---

## Tech Stack
- **Backend:** Go 1.25, `net/http` mux, module `fellowshipofthecode.com/backend`
- **Frontend:** React 18 + React Router + TanStack Query, built with Vite
- **Database:** MySQL 8, sqlc v1.30.0 for type-safe query generation
- **Styling:** Tailwind v4 + Shadcn/ui (dark mode, gold theme)
- **Hosting:** AWS Lightsail (Ubuntu), nginx reverse proxy, Cloudflare DNS + HTTPS

---

## Repo Structure
```
/backend        Go server (main.go, db/, sqlc.yaml)
/frontend       React app (src/pages/, src/components/, src/context/)
/docs           Project documentation
/build          Compiled artifacts (not committed)
.github/        GitHub Actions deploy workflow
```

---

## Database
- Engine: MySQL 8, Unix socket only (`skip_networking ON`)
- Local DSN: `root@unix(/var/run/mysqld/mysqld.sock)/fotc?parseTime=true`
- Production DSN: `fotc:xc_jones_2026@unix(/var/run/mysqld/mysqld.sock)/fotc?parseTime=true`
- Override with `DATABASE_URL` env var
- Migrations: Goose (`backend/db/migrations/`), run automatically on server start
- Regenerate sqlc: `~/go/bin/sqlc generate` (run from `backend/`)

### XC Tables
- `athletes` — name, grade, event, PR
- `meets` — name, date, location
- `results` — athlete_id, meet_id, time, place

### Tracker Tables (added Module 4)
- `media` — fixed catalog of 10 Tolkien books/movies (seeded in migration)
- `tracker_users` — registered tracker accounts (separate from admin auth)
- `user_progress` — per-user status, rating, and review for each media item

---

## API Routes

### XC Routes
- `GET/POST /api/athletes`
- `GET/PUT/DELETE /api/athletes/:id`
- `GET/POST /api/meets`
- `GET/PUT/DELETE /api/meets/:id`
- `GET /api/meets/:id/results`
- `GET /api/results`, `POST /api/results`
- `GET /api/top-times`
- `POST /api/login` — admin auth (checks `ADMIN_USERNAME` + `ADMIN_PASSWORD` env vars)

### Tracker Routes (added Module 4)
- `POST /api/tracker/register`
- `POST /api/tracker/login`
- `GET /api/tracker/media`
- `GET /api/tracker/media/:id`
- `GET /api/tracker/progress` — requires auth
- `PUT /api/tracker/progress/:media_id` — requires auth
- `GET /api/tracker/community`

---

## Auth
- **Admin (XC):** `ADMIN_USERNAME` + `ADMIN_PASSWORD` env vars; token = password; set in systemd service
- **Tracker users:** bcrypt password hash in `tracker_users` table; separate token

---

## Frontend Routes
- `/` — Athletes (home)
- `/fellowship` — LOTR character pages (Frodo, Sam, Gandalf, etc.)
- `/meets` — Meet schedule
- `/login` — Admin login
- `/admin` — Protected admin dashboard
- `/tracker` — Middle Earth Tracker (new)
- `/tracker/login` — Tracker register/login
- `/tracker/lotr` — LotR series view
- `/tracker/hobbit` — Hobbit series view
- `/tracker/item/:id` — Individual item detail

---

## Deploy
GitHub Actions triggers on push to `main`. Manual steps:
```bash
cd frontend && npm run build
cd backend && GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o ../build/server .
ssh ubuntu@3.222.89.230 "sudo systemctl stop fellowship"
scp build/server ubuntu@3.222.89.230:/opt/fellowship/server
scp frontend/dist/index.html ubuntu@3.222.89.230:/opt/fellowship/static/index.html
scp -r frontend/dist/assets ubuntu@3.222.89.230:/opt/fellowship/static/
ssh ubuntu@3.222.89.230 "sudo systemctl start fellowship"
```
Key: `~/.ssh/LightsailDefaultKey-us-east-1.pem`

---

## Known Issues / Notes
- `parseTime=true` causes DATE columns to serialize as full ISO timestamps — cosmetic only
- Cloudflare caches responses; users may need to clear browser cache after deploy
- MySQL is Unix-socket only; TCP connections will fail
