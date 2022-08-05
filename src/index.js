const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameNotInUse = users.some((user) => user.username === username);

  if (usernameNotInUse) {
    return response.status(400).json({ error: "Username already in use!" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).json(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const todos = user.todos;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });

  return response.status(201).json(user.todos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.query;
  const { title, deadline } = request.body;
  const { user } = request;

  const todoToUpdate = user.todos.find((todo) => todo.id === id);

  todoToUpdate.title = title;
  todoToUpdate.deadline = deadline;

  return response.status(200).json(todoToUpdate);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.query;
  const { user } = request;

  const todoToUpdate = user.todos.find((todo) => todo.id === id);

  todoToUpdate.done = true;

  return response.status(200).json(todoToUpdate);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.query;
  const { user } = request;

  const todoToDelete = user.todos.find((todo) => todo.id === id);

  user.todos.splice(todoToDelete, 1);

  return response.status(204).send();
});

module.exports = app;
