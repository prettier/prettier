a |> b |> c;

a |> (b |> c);

(a |> b) || c;
a |> (b || c);

let result = "hello"
  |> doubleSay
  |> capitalize
  |> exclaim;

let newScore = person.score
  |> double
  |> (_ => add(7, _))
  |> (_ => subtract(2, _))
  |> (_ => boundScore(0, 100, _));

function createPerson (attrs) {
  attrs
    |> bounded('age', 1, 100)
    |> format('name', /^[a-z]$/i)
    |> Person.insertIntoDatabase;
}
