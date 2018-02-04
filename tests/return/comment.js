function f() {
  return /* a */;
}

function x() {
  return func2
      //comment
      .bar();
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
