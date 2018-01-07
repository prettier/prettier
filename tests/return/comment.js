function f() {
  return /* a */;
}

function f() {
  return (
    foo
      // comment
      .bar()
  );
}

fn(function f() {
  return (
    foo
      // comment
      .bar()
  );
});
