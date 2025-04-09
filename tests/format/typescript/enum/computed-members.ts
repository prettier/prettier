enum A {
  [i++],
}

const bar = "bar"
enum B {
  [bar] = 2,
}

const foo = () => "foo";
enum C {
  [foo()] = 2,
}
