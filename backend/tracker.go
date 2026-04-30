package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

func registerHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if body.Username == "" || body.Password == "" {
		writeError(w, http.StatusBadRequest, "username and password required")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}

	result, err := db.Exec(
		"INSERT INTO tracker_users (username, password_hash) VALUES (?, ?)",
		body.Username, string(hash),
	)
	if err != nil {
		if strings.Contains(err.Error(), "Duplicate entry") {
			writeError(w, http.StatusConflict, "username already taken")
			return
		}
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}

	id, _ := result.LastInsertId()
	token, err := generateToken()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}
	trackerTokens.Store(token, int(id))

	writeJSON(w, http.StatusCreated, map[string]any{
		"token":    token,
		"user_id":  id,
		"username": body.Username,
	})
}

func trackerLoginHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}

	var userID int
	var hash string
	err := db.QueryRow(
		"SELECT id, password_hash FROM tracker_users WHERE username = ?",
		body.Username,
	).Scan(&userID, &hash)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}

	if err = bcrypt.CompareHashAndPassword([]byte(hash), []byte(body.Password)); err != nil {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := generateToken()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}
	trackerTokens.Store(token, userID)

	writeJSON(w, http.StatusOK, map[string]any{
		"token":    token,
		"user_id":  userID,
		"username": body.Username,
	})
}

func mediaListHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(
		"SELECT id, title, type, series, year, order_in_series FROM media ORDER BY series, order_in_series",
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}
	defer rows.Close()

	type MediaItem struct {
		ID            int    `json:"id"`
		Title         string `json:"title"`
		Type          string `json:"type"`
		Series        string `json:"series"`
		Year          int    `json:"year"`
		OrderInSeries int    `json:"order_in_series"`
	}

	items := []MediaItem{}
	for rows.Next() {
		var m MediaItem
		if err := rows.Scan(&m.ID, &m.Title, &m.Type, &m.Series, &m.Year, &m.OrderInSeries); err != nil {
			writeError(w, http.StatusInternalServerError, "server error")
			return
		}
		items = append(items, m)
	}

	writeJSON(w, http.StatusOK, items)
}

func mediaDetailHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	type MediaItem struct {
		ID            int    `json:"id"`
		Title         string `json:"title"`
		Type          string `json:"type"`
		Series        string `json:"series"`
		Year          int    `json:"year"`
		OrderInSeries int    `json:"order_in_series"`
	}

	var m MediaItem
	err := db.QueryRow(
		"SELECT id, title, type, series, year, order_in_series FROM media WHERE id = ?", id,
	).Scan(&m.ID, &m.Title, &m.Type, &m.Series, &m.Year, &m.OrderInSeries)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}

	writeJSON(w, http.StatusOK, m)
}

func progressGetHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(ctxUserID).(int)

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

func progressUpdateHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(ctxUserID).(int)
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

func communityHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`
		SELECT
			u.id,
			u.username,
			COALESCE(SUM(CASE WHEN p.status = 'completed'   THEN 1 ELSE 0 END), 0) AS completed,
			COALESCE(SUM(CASE WHEN p.status = 'in_progress' THEN 1 ELSE 0 END), 0) AS in_progress
		FROM tracker_users u
		LEFT JOIN user_progress p ON u.id = p.user_id
		GROUP BY u.id, u.username
		ORDER BY completed DESC, in_progress DESC
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "server error")
		return
	}
	defer rows.Close()

	type Entry struct {
		UserID     int    `json:"user_id"`
		Username   string `json:"username"`
		Completed  int    `json:"completed"`
		InProgress int    `json:"in_progress"`
		Total      int    `json:"total"`
	}

	entries := []Entry{}
	for rows.Next() {
		var e Entry
		e.Total = 10
		if err := rows.Scan(&e.UserID, &e.Username, &e.Completed, &e.InProgress); err != nil {
			writeError(w, http.StatusInternalServerError, "server error")
			return
		}
		entries = append(entries, e)
	}

	writeJSON(w, http.StatusOK, entries)
}
