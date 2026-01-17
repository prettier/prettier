function x() {
  return (a.b
      //comment
      ).bar();
  return (a?.b
      //comment
      )!.bar();
}

function f() {
  return (
    (a.b
      //comment
      ).bar()
  );
  return (
    (a?.b
      //comment
      )!.bar()
  );
}

fn(function f() {
  return (
    (a.b
      //comment
      ).bar()
  );
  return (
    (a?.b
      //comment
      )!.bar()
  );
});
