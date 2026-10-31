class InMethod {
  value = input
  "in"() {}
}

class InstanceofMethod {
  value = input
  "instanceof"() {}
}

class GetField {
  "get"
  method() {}
}

class SetField {
  "set"
  method() {}
}

class StaticField {
  "static"
  method() {}
}

class QuotedSibling {
  value = input
  "in"() {}
  "needs-quotes"() {}
}

class ConsistentIdentifiers {
  get;
  set;
  static;
  "needs-quotes"() {}
}

class ComputedMethod {
  value = input;
  ["in"]() {}
}

class StaticMethod {
  value = input
  static "in"() {}
}

class Getter {
  value = input
  get "in"() {}
}
