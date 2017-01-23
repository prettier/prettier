function* f() {
  a = (yield) ? 1 : 1;
  a = yield 1 ? 1 : 1;
  a = 1 ? yield : yield;
  a = 1 ? yield 1 : yield 1;
}
