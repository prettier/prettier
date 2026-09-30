type Type = {
  // comment
  +[T in number]: number;
};

type Type = {
  // comment1
  // comment2
  +[T in number]: number;
};

type Type = {
  // comment
  -[T in number]: number;
};

type Type = {
  // comment
  +    [T in number]: number;
};

type Type = {
  // comment
  +     [T in number]: number;
};

type Type = {
  // comment
  +       [T in number]: number;
};

type Type = {
  // comment
  [T in number]: number;
};

type Type = {
  + // foo
  /* bar */ [T in number]: number;
};

type Type<T> = { [K in keyof T]: /** Comment */ B };

type Type<T> = {
  [K in keyof T]: /** Comment */
    B,
};

type Type<T> = { [K in keyof T]: /** Comment */ | B };

type Type<T> = { [K in keyof T] /** Comment */: B | C };
