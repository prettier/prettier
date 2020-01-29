const x: Array<number> = [];
for (const x of x) { // error: can not reference undeclared x in right-hand expr
  (x: empty);
}
