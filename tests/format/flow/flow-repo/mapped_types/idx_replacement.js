declare opaque type DeepRequiredArray<out T>: ReadonlyArray<
  DeepRequired<NonNullable<T>>,
>;

declare opaque type DeepRequiredObject<out T extends interface {}>: Required<{
  readonly [K in keyof T]: DeepRequired<T[K]>,
}>;

declare opaque type IdxNonMaybeType<T>: NonNullable<T>;

declare opaque type DeepRequired<T>: T extends empty
  ? $FlowFixMe // If something can pass empty, it's already unsafe
  : T extends ReadonlyArray<infer V>
  ? DeepRequiredArray<V>
  : T extends interface {}
  ? DeepRequiredObject<T>
  : IdxNonMaybeType<T>;

type UnboxDeepRequired<T> = T extends DeepRequired<infer V> ? V : T;

declare function idx<T1, T2>(
  prop: T1,
  accessor: (prop: NonNullable<DeepRequired<T1>>) => T2,
): ?UnboxDeepRequired<T2>;

// Migrated from original idx test
{
  // Objects
  declare const obj1: {a: ?{b: {c: number}}};
  obj1.a.b.c; // error
  idx(obj1, obj => obj.a.b.c) as ?number; // ok
  idx(obj1, obj => obj["a"].b.c) as ?number; // ok
  idx(obj1, obj => obj.a.b.c) as number; // error: result must be MaybeT
  idx(obj1, obj => obj.a.b.c) as ?string; // error: number ~> string
  idx(obj1, obj => obj["a"].b.c) as number; // error: result must be MaybeT
  idx(obj1, obj => obj.notAProp); // error: prop-missing
  idx(obj1, obj => obj.a = null); // error: invalid-idx
  declare const obj2: {a?: {b: {c: number}}};
  idx(obj2, obj => obj.a.b.c) as ?number; // ok
  idx(obj2, obj => obj.a.b.c) as number; // error: result must be MaybeT
  declare const obj3: {a: null | {b: {c: number}}};
  idx(obj3, obj => obj.a.b.c) as ?number; // ok
  idx(obj3, obj => obj.a.b.c) as number; // error: result must be MaybeT
  // Nested maybes/optionals should get unwrapped
  declare const obj4: {a?: ?(?{b: number})};
  idx(obj4, obj => obj.a.b) as ?number; // ok

  // Unions
  declare const ab: {a:string}|{b:number};
  idx(ab, _ => _.a) as empty; // error
  idx(ab, _ => _.b) as empty; // error
  idx(ab, _ => _.c) as empty; // error

  // Classes
  class Foo1 { a: ?Foo1; b: ?number; }
  class Foo2 { a: Foo2 | void; b: ?number; }
  class Foo3 { a: Foo3 | null; b: ?number; }
  idx(new Foo1(), o => o.a.b) as ?number; // ok
  idx(new Foo1(), o => o.a.b) as number; // error: result must be MaybeT
  idx(new Foo1(), o => o.a = null); // error: not writable

  // Arrays
  declare const arr1: Array<?Array<number>>;
  declare const arr2: Array<Array<number> | void>;
  declare const arr3: Array<Array<number> | null>;
  idx(arr1, arr => arr[0][0]) as ?number; // ok
  idx(arr2, arr => arr[0][0]) as ?number; // ok
  idx(arr3, arr => arr[0][0]) as ?number; // ok

  // Non-objects
  idx(42, n => n) as ?number; // ok
  idx(42, n => n) as number; // error: result must be MaybeT
  idx(42, n => n.nope); // error: prop-missing

  // Weird edge cases
  // Using an annotation obscures the type wrapper mechanism that idx() uses
  // around the parameter it passes to the callback
  idx({}, (obj: any) => obj.a.b.c) as ?number; // ok
  // Can't do anything with the callback parameter other than get elements and properties off of it
  idx({}, obj => obj()); // error
}

// Additional tests
{
  declare const props: { data: { readonly id: ?string } };
  declare function nullthrows<T>(x: ?T): T;

  const a = nullthrows(idx(props, _ => _.data.id));
  a as empty; // error
  if (a != null) {
    a as empty; // error
    a as string; // ok
  }
}
