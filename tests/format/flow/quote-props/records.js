record R {
  42: 0,
  "43": 1,
  "property1": 2,
  property2: 3,
  "property-3": 4,
}

record R2 {
  static 42() {}
  static "43"() {}
  static "method1"() {}
  static method2() {}
  static "method-3"() {}
}

r = R {
  42: 0,
  "43": 1,
  "property1": 2,
  property2: 3,
  "property-3": 4,
}
