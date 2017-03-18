type f = (
  currentRequest: {a: number},
  // TODO this is a very very very very long comment that makes it go > 80 columns
) => number;

f = (
  currentRequest: {a: number},
  // TODO this is a very very very very long comment that makes it go > 80 columns
): number => {};

f = (
  currentRequest: {a: number},
  // TODO this is a very very very very long comment that makes it go > 80 columns
) => {};

f = function(
  currentRequest: {a: number},
  // TODO this is a very very very very long comment that makes it go > 80 columns
) {};

class X {
  f(
    currentRequest: {a: number},
    // TODO this is a very very very very long comment that makes it go > 80 columns
  ) {}
}
