# Database Schema: Middle Earth Tracker

Three new tables added to the existing `fotc` MySQL database.

---

## `media`
Fixed catalog of 10 items. Seeded once via Goose migration — never modified by users.

```sql
CREATE TABLE media (
    id               INT          PRIMARY KEY AUTO_INCREMENT,
    title            VARCHAR(200) NOT NULL,
    type             ENUM('book', 'movie') NOT NULL,
    series           ENUM('lotr', 'hobbit') NOT NULL,
    year             INT          NOT NULL,
    order_in_series  INT          NOT NULL
);
```

| id | title | type | series | year | order_in_series |
|---|---|---|---|---|---|
| 1 | The Hobbit | book | hobbit | 1937 | 1 |
| 2 | An Unexpected Journey | movie | hobbit | 2012 | 2 |
| 3 | The Desolation of Smaug | movie | hobbit | 2013 | 3 |
| 4 | The Battle of the Five Armies | movie | hobbit | 2014 | 4 |
| 5 | The Fellowship of the Ring | book | lotr | 1954 | 1 |
| 6 | The Two Towers | book | lotr | 1954 | 2 |
| 7 | The Return of the King | book | lotr | 1955 | 3 |
| 8 | The Fellowship of the Ring | movie | lotr | 2001 | 4 |
| 9 | The Two Towers | movie | lotr | 2002 | 5 |
| 10 | The Return of the King | movie | lotr | 2003 | 6 |

---

## `tracker_users`
Separate from the existing admin auth. Stores registered tracker accounts.

```sql
CREATE TABLE tracker_users (
    id            INT          PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
```

---

## `user_progress`
One row per (user, media item) pair. Created on first interaction; updated on subsequent saves.

```sql
CREATE TABLE user_progress (
    id           INT  PRIMARY KEY AUTO_INCREMENT,
    user_id      INT  NOT NULL,
    media_id     INT  NOT NULL,
    status       ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    rating       INT  NULL,         -- 1–5, nullable until user rates
    review       TEXT NULL,
    completed_at TIMESTAMP NULL,
    UNIQUE KEY uq_user_media (user_id, media_id),
    FOREIGN KEY (user_id)  REFERENCES tracker_users(id),
    FOREIGN KEY (media_id) REFERENCES media(id)
);
```

---

## Relationships

```
tracker_users ──< user_progress >── media
```

- One user can have many progress rows (up to 10, one per media item)
- Each media item can have many progress rows (one per user)
- `user_progress` is the join table with the tracking payload (status, rating, review)

---

## Goose Migration
New tables will be added in `backend/db/migrations/00002_tracker_schema.sql`.
The `media` seed data will be inserted in the same migration so the catalog is available immediately on first deploy.
