// @flow

function foo(xs: Array<any>) {
  const zs = [];
  xs
    .map(
      x => [],
    )
    .map(ys =>
      ys
      .map(y => [])
      .reduce((a, b) => [...a, ...b], []),
    )
    .reduce((a, b) => [...a, ...b], [])
    .forEach(z => {
        zs.push(z);
    });
}
