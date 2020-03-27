const Profile = view.with({ name: (state) => state.name }).as((props) => (
  <div>
    <h1>Hello, {props.name}</h1>
  </div>
))

const Profile2 = view.with({ name }).as((props) => (
  <div>
    <h1>Hello, {props.name}</h1>
  </div>
))

const [firstName, setFirstName] = RR.name('user.profile.firstName').createState('John')

const name = RR.name('user.profile.firstName').createState('John')

const fullName = RR
  .createQuery((o) => `${o.firstName} ${o.lastName}`)
  .with({ firstName, lastName })
