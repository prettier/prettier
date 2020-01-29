// @noflow

type T =
  | {type: 'A', ...A}
  | {type: 'B', ...B}

declare var x: T;
switch (x.type) {
  case 'A':
    (x.foo: empty); // error: string ~> empty
    break;
}

// types defined below use to ensure annot resolution happens after
type B = {| bar: string |};
type A = {| foo: string |};
