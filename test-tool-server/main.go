package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
)

// Widget represents the JSON payload for creating a widget.
type Widget struct {
	Name string `json:"name"`
}

// createWidgetHandler handles POST requests to "/create-widget".
func createWidgetHandler(w http.ResponseWriter, r *http.Request) {
	// Ensure the request method is POST.
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Decode the JSON request body.
	var widget Widget
	if err := json.NewDecoder(r.Body).Decode(&widget); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Check that the name field is provided.
	if widget.Name == "" {
		http.Error(w, "Missing widget name", http.StatusBadRequest)
		return
	}

	// Create the response message.
	response := map[string]string{
		"message": fmt.Sprintf("Created %s", widget.Name),
	}

	// Return the JSON response.
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

// searchListHandler handles POST requests to "/search-list".
// It expects a JSON body with an "id" field and returns a hard-coded array [1,2,...,10].
func searchListHandler(w http.ResponseWriter, r *http.Request) {
	// Ensure the request method is POST.
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Define a struct to decode the incoming JSON request.
	var req struct {
		ID int `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create a hard-coded array with numbers 1 to 10.
	result := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

	// Build the response with the key "result".
	response := map[string]interface{}{
		"result": result,
	}

	// Return the JSON response.
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func main() {
	// Register endpoint handlers.
	http.HandleFunc("/create-widget", createWidgetHandler)
	http.HandleFunc("/search-list", searchListHandler)

	// Serve the index.html file when the root path is requested.
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join("static", "index.html"))
	})

	// Serve the JavaScript file.
	http.Handle("/bundle.js", http.FileServer(http.Dir("./static")))

	log.Println("Server is running on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed: %s", err)
	}
}
