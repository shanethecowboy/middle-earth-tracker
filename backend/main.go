package main

import (
	"database/sql"
	"embed"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	_ "github.com/go-sql-driver/mysql"
	"github.com/pressly/goose/v3"
)

//go:embed db/migrations/*.sql
var migrationsFS embed.FS

var db *sql.DB

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "root@unix(/var/run/mysqld/mysqld.sock)/fotc?parseTime=true"
	}

	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatalf("ping db: %v", err)
	}

	goose.SetBaseFS(migrationsFS)
	if err = goose.SetDialect("mysql"); err != nil {
		log.Fatal(err)
	}
	if err = goose.Up(db, "db/migrations"); err != nil {
		log.Fatalf("migrations: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintln(w, `{"status":"ok"}`)
	})

	// Admin login
	mux.HandleFunc("POST /api/login", adminLoginHandler)

	// Tracker — public
	mux.HandleFunc("POST /api/tracker/register", registerHandler)
	mux.HandleFunc("POST /api/tracker/login", trackerLoginHandler)
	mux.HandleFunc("GET /api/tracker/media", mediaListHandler)
	mux.HandleFunc("GET /api/tracker/media/{id}", mediaDetailHandler)
	mux.HandleFunc("GET /api/tracker/community", communityHandler)

	// Tracker — auth required
	mux.HandleFunc("GET /api/tracker/progress", requireTrackerAuth(progressGetHandler))
	mux.HandleFunc("PUT /api/tracker/progress/{media_id}", requireTrackerAuth(progressUpdateHandler))

	// Admin — manage any user's data
	mux.HandleFunc("GET /api/admin/tracker/users", requireAdminAuth(adminUsersListHandler))
	mux.HandleFunc("GET /api/admin/tracker/users/{id}/progress", requireAdminAuth(adminUserProgressHandler))
	mux.HandleFunc("PUT /api/admin/tracker/progress/{user_id}/{media_id}", requireAdminAuth(adminProgressUpdateHandler))
	mux.HandleFunc("DELETE /api/admin/tracker/users/{id}", requireAdminAuth(adminUserDeleteHandler))

	// SPA fallback — serves React app for all non-API routes
	mux.Handle("/", spaHandler("static"))

	log.Printf("listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, corsMiddleware(mux)))
}

func spaHandler(dir string) http.Handler {
	fs := http.FileServer(http.Dir(dir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(dir, filepath.Clean(r.URL.Path))
		if _, err := os.Stat(path); os.IsNotExist(err) {
			http.ServeFile(w, r, filepath.Join(dir, "index.html"))
			return
		}
		fs.ServeHTTP(w, r)
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
