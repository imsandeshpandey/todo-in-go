/**
 *
 * @typedef {Object} AddTodo
 * @property {string} name - Name of the task
 */

/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} name
 * @property {boolean} completed
 * @property {Date} created_at
 * @property {Date} completed_at
 */

var editingTodoId = "";

/**@type {Map<string, Todo>} */
const todos = new Map();

var isEditing = false;

const addTodoBtn = document.getElementById("add-todo-btn");
const todoInput = document.getElementById("todo-input");
const todosContainer = document.getElementById("todos-container");
const initialAddTodoBtnContent = addTodoBtn.innerHTML;

//region Event Listeners
addTodoBtn.addEventListener("click", async () => {
  const todo = {
    name: todoInput.value,
  };
  addOrEditTodo(todo);
});

todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const todo = {
      name: todoInput.value,
    };
    addOrEditTodo(todo);
  }
});

// region Todo Operations
/**
 * @returns {Todo[]}
 */
async function getTodos() {
  try {
    const res = await fetch("./todos");
    const todos = await res.json();
    todos.forEach((todo) => addTodoToContainer(todo));
  } catch {
    console.log("Error getting todos");
  }
}

/** @param {AddTodo} todo */
function addOrEditTodo(todo) {
  if (isEditing) return editTodo(todo);
  return addTodo(todo);
}

/** @param {AddTodo} todo */
async function addTodo(todo) {
  try {
    const res = await fetch("./todos", {
      method: "post",
      body: JSON.stringify(todo),
    });
    /** @type {ApiTodo} */

    const newTodo = await res.json();
    todoInput.value = "";
    addTodoToContainer(newTodo);
  } catch {
    console.log("Error adding todo");
  }
}

/** @param {AddTodo} todo */
async function editTodo(todo) {
  try {
    await fetch(`./todos/${editingTodoId}`, {
      method: "put",
      body: JSON.stringify(todo),
    });

    const todoNameEl = document.getElementById(`name.${editingTodoId}`);
    todoNameEl.innerHTML = todo.name;

    stopEditing();
  } catch {
    console.log("Error editing todo");
  }
}

async function deleteTodo(id) {
  try {
    await fetch(`./todos/${id}`, {
      method: "delete",
    });
    const todoEl = document.getElementById(id);
    todoEl.remove();
    todos.delete(id);
  } catch (err) {
    console.log(err);
  }
}

async function startEditTodo(id) {
  if (!todos.has(id)) return;
  const todo = todos.get(id);
  todoInput.value = todo.name;
  todoInput.focus();
  editingTodoId = id;

  if (isEditing) return;

  isEditing = true;

  addTodoBtn.innerHTML = "Update";

  const addTodoRowEl = document.getElementById("add-todo-buttons-row");
  const cancelButton = `
    <button id="cancel-edit-button" class="btn btn-ghost" onclick="stopEditing()">
    Cancel
    </button>
  `;
  addTodoRowEl.insertAdjacentHTML("afterbegin", cancelButton);
}

function stopEditing() {
  isEditing = false;
  addTodoBtn.innerHTML = initialAddTodoBtnContent;
  todoInput.value = "";
  const cancelButton = document.getElementById("cancel-edit-button");
  cancelButton.remove();
  createLucideIcons();
}

/**
 *
 * @param {Todo} todo
 */
function addTodoToContainer(todo) {
  todos.set(todo.id, todo);
  const html = `
        <div class="todo-card" id="${todo.id}" class="flex justify-between items-center gap-2 border rounded-lg px-4 border-white/10 py-2">
            <p class="todo-name" id="name.${todo.id}">${todo.name}</p>    
            <div class="todo-action-group">
            <button id="edit.${todo.id}" class="btn btn-icon btn-ghost">
                <i data-lucide="pen" class="size-4-icon"></i>
            </button>
            <button id="delete.${todo.id}" class="btn btn-ghost btn-delete btn-icon">
                <i data-lucide="trash" class="size-4-icon"></i>
            </button>
            </div>
        </div>
        `;
  todosContainer.insertAdjacentHTML("beforeend", html);

  const deleteButton = document.getElementById(`delete.${todo.id}`);
  deleteButton.addEventListener("click", () => deleteTodo(todo.id));

  const editButton = document.getElementById(`edit.${todo.id}`);
  editButton.addEventListener("click", () => startEditTodo(todo.id));

  createLucideIcons();
}

// region INIT
getTodos();

function createLucideIcons() {
  try {
    lucide.createIcons();
  } catch (err) {
    console.log(err);
  }
}
