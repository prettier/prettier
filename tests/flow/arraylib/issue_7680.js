// @flow

function workingGenericReduce<T, V>(
  obj: { array: Array<T> },
  accumulator: V,
  mapper: (V, T) => V
): V {
  return obj.array.reduce(mapper, accumulator);
}

function brokenGenericReduce<T, V>(
  obj: { array: Array<T> },
  accumulator: V,
  mapper: (V, T) => V
): V {
  return obj.array.reduce(
    // works
    (a, v) => mapper(a, v),
    accumulator
  );
}
