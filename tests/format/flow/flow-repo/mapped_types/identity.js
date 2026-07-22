declare const any: any;

type IdentityMap<O> = {[K in keyof O]: O[K]};
type Foo = IdentityMap<{ a: number, b: number }>;
declare const foo: Foo;

({
  a: 42, // OK
  b: 42, // OK
} as Foo);

({
  a: 'asd', // Error: string ~> number
  b: 'asd', // Error: string ~> number
} as Foo);

((any as {
  a: string, // Error: string ~> number
  b: string, // Error: string ~> number
}) as Foo);

({} as {} as Foo); // Error: `a` and `b` are not defined.

any as {} as Foo; // Error: `a` and `b` are not defined.

(foo as {
  a: number, // OK
  b: number, // OK
});

(foo as {
  a: string, // Error: number ~> string
  b: string, // Error: number ~> string
});

foo.a as empty; // Error: number ~> empty

({
  foo: 'asd', // OK
} as IdentityMap<{ foo: number | string }>);

({
  foo: 'asd', // OK
} as IdentityMap<{ foo: number } | { foo: string }>);

({
  foo: true, // Error: boolean ~> number | string
} as IdentityMap<{ foo: number | string }>);

({
  foo: true, // Error: boolean ~> number | string
} as IdentityMap<{ foo: number } | { foo: string }>);
