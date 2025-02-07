package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
)

// Widget represents the expected JSON payload.
type Widget struct {
	Name string `json:"name"`
}

// createWidgetHandler processes POST requests to "/create-widget".
func createWidgetHandler(w http.ResponseWriter, r *http.Request) {
	// Ensure the request method is POST.
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Decode the JSON request body into a Widget struct.
	var widget Widget
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&widget); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Ensure the name field is provided.
	if widget.Name == "" {
		http.Error(w, "Missing widget name", http.StatusBadRequest)
		return
	}

	// Create the response message.
	response := map[string]string{
		"message": fmt.Sprintf("Created %s", widget.Name),
	}

	// Set the header to indicate JSON response.
	w.Header().Set("Content-Type", "application/json")
	// Write the JSON response.
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func main() {
	// Handle the widget creation endpoint.
	http.HandleFunc("/create-widget", createWidgetHandler)

	// Serve the index.html file when the root path is requested.
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Use filepath.Join to support different OS path separators.
		http.ServeFile(w, r, filepath.Join("static", "index.html"))
	})

	// Serve the JavaScript file.
	// When a request is made to "/app.js", serve the file from the "static" directory.
	http.Handle("/bundle.js", http.FileServer(http.Dir("./static")))

	// Optionally, if you have additional static assets (CSS, images, etc.), you could serve them under a /static/ path:
	// http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	log.Println("Server is running on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed: %s", err)
	}
}
