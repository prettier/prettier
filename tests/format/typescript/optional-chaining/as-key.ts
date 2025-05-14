class A {
  [a?.b]?= 1;
  [a?.b]?= function () {};

  static [a?.b]?= 1;
  static [a?.b]?= function () {};
}
