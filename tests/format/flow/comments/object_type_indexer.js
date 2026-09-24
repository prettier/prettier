type A = {
  [key: string]: /** Comment */ B,
};

type A = {
  [key: string]: /** Comment */
    B,
};

type A = {
  [key: string] /** Comment */
    : B,
};

type A = {
  [key: string]: /** Comment */ | B,
};

type A = {
  [key: string] /** Comment */: B | C,
};

type A = {
  [key: string]: // Comment
    | B
    | C,
};
