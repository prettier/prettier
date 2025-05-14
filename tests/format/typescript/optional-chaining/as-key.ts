class A {
  [a?.b]?= 1;
  [a?.b]?= function () {};

  [a?.b]?() {};
  // *[a?.b]?() {};
  async [a?.b]?() {};
  async * [a?.b]?() {};
}

class B {
  static [a?.b]?= 1;
  static [a?.b]?= function () {};

  static [a?.b]?() {};
  // static *[a?.b]?() {};
  static async [a?.b]?() {};
  static async * [a?.b]?() {};
}
