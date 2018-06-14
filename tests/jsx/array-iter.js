const UsersList = ({ users }) => (
  <section>
    <h2>Users list</h2>
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  </section>
)

const TodoList = ({ todos }) => (
  <div className="TodoList">
    <ul>{_.map(todos, (todo, i) => <TodoItem key={i} {...todo} />)}</ul>
  </div>
);
