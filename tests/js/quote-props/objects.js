const a = {
  a: "a"
};

const b = {
  'b': "b"
};

const b2 = {
  // Escapes should stay as escapes and not be unquoted.
  '\u0062': "b",
  '\u0031': "1"
};

const c = {
  c1: "c1",
  'c2': "c2"
};

const d = {
  d1: "d1",
  'd-2': "d2"
};

const e = {
  1: null,
  1E2: null,
  1e+3: null,
  1e+100: null,
  0b10: null,
  0o10: null,
  0xf: null,
  2n: null,
  NaN: null,
}

const f = {
  "1": null,
  "1E2": null,
  "1e+3": null,
  "1e+100": null,
  "0b10": null,
  "0o10": null,
  "0xf": null,
  "2n": null,
  "NaN": null,
}

const g = {
  1: null,
  1E2: null,
  1e+3: null,
  1e+100: null,
  0b10: null,
  0o10: null,
  0xf: null,
  NaN: null,
  2n: null,
  'a-a': null,
}

const h = {
  "-1": null,
  "-0xa": null,
}

Object.keys({'g-':4,0xb_b:88,0xb_b_bn:333,
  0xan:3,
  0b100000000000_000000000000000011n:4})
