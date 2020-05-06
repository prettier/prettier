// @flow

function g<T: number>(o: T): $Call<typeof makeEditedColumn, T> {
  return o;
}

function f1(o: Columns): Columns {
  return g(o);
}

function f2(o: Columns): Columns {
  return g<Columns>(o);
}

function h(o: Columns): $Call<typeof makeEditedColumn, Columns> {
  return o;
}

type Columns = number;

declare function makeEditedColumn(
  a: number,
  b: string,
): number;
