for (
  let i of a // Hello
) {
}

for (
  let i in b // Hello
) {
}

for (
  let i of c // Hello
) {
  d();
}

for (const short of items) {
  e();
}

for (const srcPath of [123, 123_123_123, 123_123_123_1, 13_123_3123_31_4321]) {
  f(srcPath);
}
