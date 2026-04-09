declare const x: 1 | 2;

hook useHook() {}

component WithMatchStatement() {
  match (x) {
    1 => {
      useHook(); // ERROR
    }
    2 => {}
  }
  return null
}

component WithMatchExpression() {
  return match (x) {
    1 => useHook(), // ERROR
    2 => undefined,
  };
}

match (x) {
  1 => {
    component NestedInMatch() {
      useHook(); // OK
      return null;
    }
  }
  2 => {}
}
