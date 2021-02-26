class A {
  #foo = "bar";
  static isA(obj) {
    return #foo in obj;
  }
}
