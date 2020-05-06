// @flow

export function foo(x: any) {
  if (x && x.bar) {
    return x.bar();
  }
  return x;
}
