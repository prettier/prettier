type Type = {
  // comment
  readonly [T in number];
};

type Type = {
  // comment
  +readonly [T in number];
};

type Type = {
  // comment
  -readonly [T in number];
};

type Type = {
  // comment
  +    readonly [T in number];
};

type Type = {
  // comment
  +readonly     [T in number];
};

type Type = {
  // comment
  readonly       [T in number];
};

type Type = {
  // comment
  [T in number];
};
