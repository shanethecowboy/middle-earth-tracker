# Architecture: Middle Earth Tracker

## Tech Stack
- **Backend:** Go 1.25, `net/http` mux — added to the existing `fellowshipofthecode.com` backend
- **Frontend:** React + React Router + TanStack Query, built with Vite — new pages added to the existing frontend
- **Database:** MySQL 8 with sqlc for type-safe queries — new tables added to the existing `fotc` database
- **Auth:** Username + bcrypt password hash, token stored in localStorage (separate from the existing admin auth)
- **Hosting:** Existing Lightsail instance at `fellowshipofthecode.com`

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/tracker` | Tracker Home | Landing page. If logged in: dashboard with completion stats. If logged out: intro + link to register/login. |
| `/tracker/login` | Login / Register | Tab-switched form to log in or create an account. |
| `/tracker/lotr` | LotR Series | Shows all 6 LotR items (3 books + 3 movies) with the user's status on each. |
| `/tracker/hobbit` | Hobbit Series | Shows all 4 Hobbit items (1 book + 3 movies) with the user's status on each. |
| `/tracker/item/:id` | Item Detail | Full detail page for one book or movie: cover, description, user's rating and review form. |

### User Flow
1. Visitor lands on `/tracker` — sees the catalog intro and a "Sign in to track your progress" prompt
2. User registers or logs in at `/tracker/login`
3. Redirected to `/tracker` — now sees their personal dashboard (completion % per series)
4. User clicks a series to go to `/tracker/lotr` or `/tracker/hobbit`
5. User clicks an item to open `/tracker/item/:id` and update status/rating/review
6. Dashboard updates in real time via TanStack Query cache invalidation

---

## API Endpoints

All tracker endpoints are prefixed with `/api/tracker/`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/tracker/register` | None | Create a new tracker user account |
| `POST` | `/api/tracker/login` | None | Login, returns `{"token": "..."}` |
| `GET` | `/api/tracker/media` | None | Return all 10 media items |
| `GET` | `/api/tracker/media/:id` | None | Return a single media item |
| `GET` | `/api/tracker/progress` | Required | Return current user's progress for all 10 items |
| `PUT` | `/api/tracker/progress/:media_id` | Required | Set/update status, rating, review for one item |
| `GET` | `/api/tracker/community` | None | Return average ratings across all users per item |

### Example: Update Progress
```
PUT /api/tracker/progress/3
Authorization: Bearer <token>

{
  "status": "completed",
  "rating": 5,
  "review": "The best of the three."
}
```

Response:
```json
{ "ok": true }
```

### Example: Get Progress
```
GET /api/tracker/progress
Authorization: Bearer <token>
```

Response:
```json
[
  { "media_id": 1, "title": "The Hobbit", "type": "book", "series": "hobbit", "status": "completed", "rating": 4, "review": "A fun adventure." },
  { "media_id": 2, "title": "The Fellowship of the Ring", "type": "book", "series": "lotr", "status": "in_progress", "rating": null, "review": null },
  ...
]
```
