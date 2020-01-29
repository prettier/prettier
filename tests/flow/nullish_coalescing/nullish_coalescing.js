function foo(a: ?string, b: ?number, c : bool) {
  (undefined ?? "hello" : string);
  (a ?? "hello" : string);
  (a ?? "hello" : empty);
  (a ?? 42 : string | number);
  (a ?? 42 : empty);
  var d = null;
  (d ?? "true" : string);
  (d ?? a ?? b : ?(string | number));
  if (c) {
    d = a;
  } else {
    d = b;
  }
  (d ?? "hello" : string | number);
  (d ?? "hello" : empty);
}
