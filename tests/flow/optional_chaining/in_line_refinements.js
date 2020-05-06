// @flow

declare var x: ?{
  a: number,
  f: number => string,
  i: Array<number>,
  of?: number => string,
  oi?: Array<number>,
  i2: Array<Array<number>>,
  i3: Array<{a: ?number}>,
  f2: number => number => string,
};

x?.f(x.a);
x?.i[x.a];
x?.i[x?.a]; // unnecessary optional chain
x?.of?.(x.a);
x?.oi?.[x.a];

delete x?.i[x.a];
delete x?.i2[x.a][0];
delete x?.i3[x.a].a;

x?.f2(x.a)(x.a); // havoc refinements
