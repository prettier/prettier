
export type A = (
  | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
  | bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
);

export type B = (
  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa |
  bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
);

export type C =
  | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
  | bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb;

export type D =
  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa |
  bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb;

export type Multi = (string | number)[];

function f(): (string | number) {}

var x: (string | number);
var y: ((string | number));

class Foo<T extends (string | number)> {}

interface Interface {
    i: (X | Y) & Z;
    j: Partial<(X | Y)>;
}

type State = {
  sharedProperty: any;
} & (
  | { discriminant: "FOO"; foo: any }
  | { discriminant: "BAR"; bar: any }
  | { discriminant: "BAZ"; baz: any } 
);

const foo = [abc, def, ghi, jkl, mno, pqr, stu, vwx, yz] as (
  | string
  | undefined
)[];

const foo: (
  | AAAAAAAAAAAAAAAAAAAAAA
  | BBBBBBBBBBBBBBBBBBBBBB
  | CCCCCCCCCCCCCCCCCCCCCC
  | DDDDDDDDDDDDDDDDDDDDDD
)[] = [];

const foo: keyof (
  | AAAAAAAAAAAAAAAAAAAAAA
  | BBBBBBBBBBBBBBBBBBBBBB
  | CCCCCCCCCCCCCCCCCCCCCC
  | DDDDDDDDDDDDDDDDDDDDDD
) = bar;

const foo:
  | foo
  | (
      | AAAAAAAAAAAAAAAAAAAAAA
      | BBBBBBBBBBBBBBBBBBBBBB
      | CCCCCCCCCCCCCCCCCCCCCC
      | DDDDDDDDDDDDDDDDDDDDDD
    ) = bar;
