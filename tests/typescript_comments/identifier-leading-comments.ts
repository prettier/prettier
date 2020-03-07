// https://github.com/prettier/prettier/issues/7725
type T = (arg:
  // comment 1
  | T1
  // comment 2
  | T2
  // comment 3
) => void

const a: // comment 4
  T = v;
