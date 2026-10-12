// https://github.com/prettier/prettier/issues/20170
// With `semi: false`, quoted keys that `quoteProps` unquotes must get the same
// ASI protection as written-unquoted keys.
class C1 {
  x = a
  "in"() {}
}
class C2 {
  x = a
  "instanceof"() {}
}
// Not an ASI hazard, no semicolon needed
class C3 {
  x = a
  "foo"() {}
}
