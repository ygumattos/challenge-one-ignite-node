const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const foundUsername = users.find(user => user.username === username)

  if(!foundUsername) response.status(404).json({error: 'User dont exists'})

  request.user = foundUsername

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const foundUsername = users.find(user => user.username === username)

  if(foundUsername) response.status(400).json({error: 'User already exists'})

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = { 
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)
  users[users.indexOf(user)] = user;
  
  
  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) response.status(404).json({ error: 'Todo not found' })
  
  const newTodo = { ...todo, title, deadline: new Date(deadline) }

  user.todos[user.todos.indexOf(todo)] = newTodo
  users[users.indexOf(user)] = user
  
  response.status(201).json(newTodo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) response.status(404).json({ error: 'Todo not found' })

  const updatedTodo = { ...todo, done: true }

  user.todos[user.todos.indexOf(todo)] = updatedTodo
  users[users.indexOf(user)] = user
  
  response.status(201).json(updatedTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todos = user.todos.filter( todo => todo.id !== id );

  if(todos.length === user.todos.length) response.status(404).json({ error: 'Todo not found' })

  user.todos = todos;
  users[users.indexOf(user)] = user

  response.status(204).send()
});

module.exports = app;