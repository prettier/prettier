// @flow

enum E {
  A = true,
  B = false,
  C = true, // Error: duplicate member initializer
  D = true, // Error: duplicate member initializer
}

enum F {
  A = 1,
  B = 1, // Error: duplicate member initializer
  C = 1.0, // Error: duplicate member initializer
  D = 2,
}

enum G {
  A = "b",
  B = "a",
  C = "a", // Error: duplicate member initializer
  D = "a", // Error: duplicate member initializer
}

enum H {
  A = 0,
  // Due to IEEE 754, both below values are the same in JS
  B = 2.2204460492503130808472633361816E-16, // Number.EPSILON
  C = 2.2204460492503130808472633361815E-16, // Error: duplicate member initializer
}

enum I {
  A = 9007199254740991, // Number.MAX_SAFE_INTEGER
  // Due to IEEE 754, both below values are the same in JS
  B = 9007199254740992,
  C = 9007199254740993, // Error: duplicate member initializer
}
