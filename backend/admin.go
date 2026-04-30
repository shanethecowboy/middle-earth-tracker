package main

import (
	"encoding/json"
	"net/http"
	"os"
)

func adminLoginHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}

	adminUser := os.Getenv("ADMIN_USERNAME")
	adminPass := os.Getenv("ADMIN_PASSWORD")

	if body.Username != adminUser || body.Password != adminPass {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"token": adminPass})
}

func adminUsersListHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`
		SELECT
			u.id, u.username, u.created_at,
			COALESCE(SUM(CASE WHEN p.status = 'completed'   THEN 1 ELSE 0 END), 0) AS completed,
			COALESCE(SUM(CASE WHEN p.status = 'in_progress' THEN 1 ELSE 0 END), 0) AS in_progress
		FROM tracker_users u
		LEFT JOIN user_progress p ON u.id = p.user_id
		GROUP BY u.id, u.username, u.created_at
		ORDER BY u.created_at DESC
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}
	defer rows.Close()

	type User struct {
		ID         int    `json:"id"`
		Username   string `json:"username"`
		CreatedAt  string `json:"created_at"`
		Completed  int    `json:"completed"`
		InProgress int    `json:"in_progress"`
	}

	users := []User{}
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Username, &u.CreatedAt, &u.Completed, &u.InProgress); err != nil {
			writeError(w, http.StatusInternalServerError, "server error")
			return
		}
		users = append(users, u)
	}

	writeJSON(w, http.StatusOK, users)
}

func adminUserProgressHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")

	rows, err := db.Query(`
		SELECT m.id, m.title, m.type, m.series, m.year, m.order_in_series,
		       COALESCE(p.status, 'not_started') AS status,
		       p.rating, p.review
		FROM media m
		LEFT JOIN user_progress p ON m.id = p.media_id AND p.user_id = ?
		ORDER BY m.series, m.order_in_series
	`, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}
	defer rows.Close()

	type ProgressItem struct {
		MediaID       int     `json:"media_id"`
		Title         string  `json:"title"`
		Type          string  `json:"type"`
		Series        string  `json:"series"`
		Year          int     `json:"year"`
		OrderInSeries int     `json:"order_in_series"`
		Status        string  `json:"status"`
		Rating        *int    `json:"rating"`
		Review        *string `json:"review"`
	}

	items := []ProgressItem{}
	for rows.Next() {
		var p ProgressItem
		if err := rows.Scan(
			&p.MediaID, &p.Title, &p.Type, &p.Series, &p.Year, &p.OrderInSeries,
			&p.Status, &p.Rating, &p.Review,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "server error")
			return
		}
		items = append(items, p)
	}

	writeJSON(w, http.StatusOK, items)
}

func adminProgressUpdateHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("user_id")
	mediaID := r.PathValue("media_id")

	var body struct {
		Status string  `json:"status"`
		Rating *int    `json:"rating"`
		Review *string `json:"review"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}

	valid := map[string]bool{"not_started": true, "in_progress": true, "completed": true}
	if !valid[body.Status] {
		writeError(w, http.StatusBadRequest, "status must be not_started, in_progress, or completed")
		return
	}

	_, err := db.Exec(`
		INSERT INTO user_progress (user_id, media_id, status, rating, review)
		VALUES (?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			status = VALUES(status),
			rating = VALUES(rating),
			review = VALUES(review),
			completed_at = IF(VALUES(status) = 'completed', COALESCE(completed_at, NOW()), NULL)
	`, userID, mediaID, body.Status, body.Rating, body.Review)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func adminUserDeleteHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	_, err := db.Exec("DELETE FROM tracker_users WHERE id = ?", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
