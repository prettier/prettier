// @flow

function g<T: $ReadOnlyArray<number>>(o: T): $TupleMap<T, typeof makeEditedColumn> {
  return o;
}

function f1(o: Columns): Columns {
  return g(o);
}

function f2(o: Columns): Columns {
  return g<Columns>(o);
}

function h(o: Columns): $TupleMap<Columns, typeof makeEditedColumn> {
  return o;
}

type Columns = Array<number>;

declare function makeEditedColumn(
  a: number,
  b: string,
): number;
