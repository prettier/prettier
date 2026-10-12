// https://github.com/prettier/prettier/issues/20170
// With `semi: false`, quoted keys that `quoteProps` unquotes must get the same
// ASI protection as written-unquoted keys.
interface I1 {
  "get"
  a: string
}
interface I2 {
  "set"
  a: string
}
type T = {
  "get"
  a: string
}
