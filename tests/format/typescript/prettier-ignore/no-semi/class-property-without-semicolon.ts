abstract class WithoutSemicolon {
  // prettier-ignore
  accessor a = 1
  // prettier-ignore
  abstract b: number
  // prettier-ignore
  abstract accessor c: number
}

abstract class WithSemicolon {
  // prettier-ignore
  accessor a = 1;
  // prettier-ignore
  abstract b: number;
  // prettier-ignore
  abstract accessor c: number;
}
