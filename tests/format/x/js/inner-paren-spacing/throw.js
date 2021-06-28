function f() {
  throw (foo.bar());
}

lint(ast, {
  with: () => throw new Error("avoid using 'with' statements.")
  });
