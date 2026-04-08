const e = match (x) {
  Bort {foo: 1, bar: 2} => 1,
  Burt {const x, ...} => x,
  Burt {x: 1, ...const y} => y,
  Foo.Bart {} => 0,
  Foo["one-two"] {...} => 0,
  Foo[0] {...const r} => r,
};
