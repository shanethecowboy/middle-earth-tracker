# fellowshipofthecode.com

A full-stack web application for Jones County High School cross country and Tolkien fans.

Live site: [fellowshipofthecode.com](https://fellowshipofthecode.com)

---

## Features

### Jones County XC
- Athlete roster with PR times
- Meet schedule and locations
- Race results with place and time
- Admin dashboard (login required) to add, edit, and delete athletes and meets

### Middle Earth Tracker *(in development)*
- Personal progress tracker for the complete Tolkien book and film catalog
- Track all 10 entries: 4 books and 6 movies across LotR and The Hobbit
- Mark each as Not Started / In Progress / Completed
- Rate items 1–5 stars and write a review
- Personal dashboard showing series-level completion progress

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Go 1.25, net/http |
| Frontend | React 18, Vite, TanStack Query |
| Styling | Tailwind v4, Shadcn/ui |
| Database | MySQL 8, sqlc |
| Hosting | AWS Lightsail, nginx, Cloudflare |
| CI/CD | GitHub Actions |

---

## Repo Structure

```
/backend    Go server and database layer
/frontend   React application
/docs       Project documentation
```

## Docs

- [Project Proposal](docs/project-proposal.md)
- [Architecture](docs/architecture.md)
- [Database Schema](docs/database-schema.md)
