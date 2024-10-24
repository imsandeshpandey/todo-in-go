.PHONY: build run clean

build:
	@echo "Building backend..."
	go build -o bin/todo-app src/main.go

run:
	@echo "Running todo application..."
	./bin/todo-app

clean:
	@echo "Cleaning..."
	rm -rf bin/*

dev: 
	@echo "Starting dev server..."
	go run src/main.go