$var = $abilities ?? ["foo", "bar", "bar"] ?? ["foo", "bar", "bar", "veryVeryVeryVeryVeryVeryVeryVeryVeryLongKey"];

const x = $abilities ?? ["foo", "bar", "bar"] ?? ["foo", "bar", "bar", "veryVeryVeryVeryVeryVeryVeryVeryVeryLongKey"];

const y = $abilities ?? { a: 1, b: 2 } ?? { a: 1, b: 2, c: 3, veryVeryVeryVeryVeryVeryVeryVeryVeryLongKey: true };
