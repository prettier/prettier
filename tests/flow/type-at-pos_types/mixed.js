// @flow

type A = {
  kind: 'A',
  metadata: {[key: string]: mixed},
};

type B = {
  kind: 'B',
  metadata: {[key: string]: mixed},
};

type AB = A | B;

const foo: Array<AB> = [];

foo.forEach(ab => {
  const local = ab;
});
