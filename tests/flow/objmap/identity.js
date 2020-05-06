// @flow

declare var any: any;

type Foo = $ObjMap<
  {
    a: number,
    b: number,
  },
  <T>(T) => T,
>;
declare var foo: Foo;

({
  a: 42, // OK
  b: 42, // OK
}: Foo);

({
  a: 'asd', // Error: string ~> number
  b: 'asd', // Error: string ~> number
}: Foo);

((any: {
  a: string, // Error: string ~> number
  b: string, // Error: string ~> number
}): Foo);

(({}: {}): Foo); // Error: `a` and `b` are not defined.

((any: {}): Foo); // Error: `a` and `b` are not defined.

(foo: {
  a: number, // OK
  b: number, // OK
});

(foo: {
  a: string, // Error: number ~> string
  b: string, // Error: number ~> string
});

(foo.a: empty); // Error: number ~> empty

({
  foo: 'asd', // OK
}: $ObjMap<
  {
    foo: number | string,
  },
  <T>(T) => T,
>);

({
  foo: 'asd', // OK
}: $ObjMap<
  ({ foo: number } | { foo: string }),
  <T>(T) => T,
>);

({
  foo: true, // Error: boolean ~> number | string
}: $ObjMap<
  {
    foo: number | string,
  },
  <T>(T) => T,
>);

({
  foo: true, // Error: boolean ~> number | string
}: $ObjMap<
  ({ foo: number } | { foo: string }),
  <T>(T) => T,
>);
