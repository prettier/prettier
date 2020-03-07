// https://github.com/prettier/prettier/issues/7725
type T = {
  // comment 1
  prop:
    // comment 2
    | T1
    // comment 3
    | T2;
  // comment 4
  prop2: // comment 5
    T3 | T4;
};

