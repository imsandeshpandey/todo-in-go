package todo

import (
	"encoding/json"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
)

func UUID() string {
	return uuid.New().String()
}

// region Todos
type Todo struct {
	Id        string    `json:"id"`
	Name      string    `json:"name"`
	Completed bool      `json:"completed"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

var (
	todos     []Todo
	todoMutex sync.Mutex
)

func TodosHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(todos)
	case "POST":
		var newTodo Todo

		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Unable to read request body", http.StatusInternalServerError)
			return
		}

		err = json.Unmarshal(body, &newTodo)
		if err != nil || newTodo.Name == "" {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		currTime := time.Now()

		newTodo.Id = UUID()
		newTodo.CreatedAt = currTime
		newTodo.UpdatedAt = currTime

		todoMutex.Lock()
		todos = append(todos, newTodo)
		todoMutex.Unlock()

		w.WriteHeader(http.StatusCreated)
		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(newTodo)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}

}

func TodoByIdHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/todos/"):]
	if id == "" {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	todoMutex.Lock()
	defer todoMutex.Unlock()

	var todoIdx int = -1
	for idx, todo := range todos {
		if todo.Id == id {
			todoIdx = idx
		}
	}
	if todoIdx == -1 {
		http.Error(w, "Todo not found", http.StatusNotFound)
		return
	}

	switch r.Method {
	case "GET":
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(todos[todoIdx])
	case "PUT":
		var updatedTodo Todo

		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Unable to read request body", http.StatusInternalServerError)
			return
		}

		err = json.Unmarshal(body, &updatedTodo)
		if err != nil || updatedTodo.Name == "" {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		todos[todoIdx].Name = updatedTodo.Name
		todos[todoIdx].Completed = updatedTodo.Completed
		todos[todoIdx].UpdatedAt = time.Now()

		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(todos[todoIdx])

	case "DELETE":
		todos = append(todos[:todoIdx], todos[todoIdx+1:]...)
		w.WriteHeader(http.StatusNoContent)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}

}
