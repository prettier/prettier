type A = {
  [[slot]]: /** Comment */ B,
};

type A = {
  [[slot]]: /** Comment */
    B,
};

type A = {
  [[slot]] /** Comment */
    : B,
};

type A = {
  [[slot]]: /** Comment */ | B,
};

type A = {
  [[slot]] /** Comment */: B | C,
};

type A = {
  [[slot]]: // Comment
    | B
    | C,
};
