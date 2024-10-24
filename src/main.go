package main

import (
	"fmt"
	"net/http"
	"todo-app/src/pkg/todo"
)

func main() {
	fileServer := http.FileServer(http.Dir("../frontend"))

	http.HandleFunc("/todos", todo.TodosHandler)
	http.HandleFunc("/todos/", todo.TodoByIdHandler)

	http.Handle("/", fileServer)
	fmt.Println("App is running on port 3000")

	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		fmt.Println("Error starting server", err)
	}
}
