// @flow

function g<T: {}>(o: T): $ObjMapi<T, typeof makeEditedColumn> {
  return o;
}

function f1(o: Columns): Columns {
  return g(o);
}

function f2(o: Columns): Columns {
  return g<Columns>(o);
}

function f3<T: Columns>(o: T): T {
  return g(o);
}

function f4<T: Columns>(o: T): T {
  return g<T>(o);
}

function h(o: Columns): $ObjMapi<Columns, typeof makeEditedColumn> {
  return o;
}

type Columns = {[string]: number};

declare function makeEditedColumn(
  a: string,
  b: number,
  c: boolean,
): number;
