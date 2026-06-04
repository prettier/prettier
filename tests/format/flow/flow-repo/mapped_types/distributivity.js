// Tests that we correctly distribute mapped types over unions.
// A failure here would be trying to access a key from a branch
// that only exists in one branch of the union.
{
  type Homomorphic<O extends {...}> = {[key in keyof O]: O[key]};
  declare const o: Homomorphic<{foo: number} | {bar: number}>; // OK
  o as {foo: number} | {bar: number}; // OK
  o as {foo: empty} | {bar: empty}; // ERROR x2
}

{
  type SemiHomomorphic<O extends {...}, Keys extends keyof O> = {[key in Keys]: O[key]};
  declare const o: SemiHomomorphic<{foo: number, bar: number} | {foo: string, baz: number}, 'foo'>;
  o as {foo: number} | {foo: string}; // OK
  o as {}; // ERROR
}

{
  type DistributeNullAndVoid<O> = {writeonly [key in keyof O]: number};

  type O = {foo: number};

  declare const oExplicit: DistributeNullAndVoid<O | null | void>;
  oExplicit as {writeonly foo: number} | null | void;
  oExplicit as {writeonly foo: number}; // ERROR 2x

  declare const oMaybe: DistributeNullAndVoid<?O>;
  oMaybe as {writeonly foo: number} | null | void;
  oMaybe as {writeonly foo: number}; // ERROR
}
