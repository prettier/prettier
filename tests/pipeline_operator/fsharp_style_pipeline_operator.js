promise
  |> await
  |> x => doubleSay(x, ', ')
  |> capitalize
  |> x => x + '!'
  |> x => new User.Message(x)
  |> x => stream.write(x)
  |> await
  |> console.log;

const result = "hello"
  |> doubleSay
  |> capitalize
  |> exclaim;

const newScore = person.score
  |> double
  |> n => add(7, n)
  |> n => boundScore(0, 100, n);

const user = url
  |> api.get
  |> await
  |> r => r.json()
  |> await
  |> j => j.data.user;
