interface I {
  foo: number;
}

type MappedInterface = {readonly [key in keyof I]: I[key]};
{
  declare const i: MappedInterface;
  i as interface {readonly foo: number}; // OK
  i as interface {foo: number}; // ERROR
  i as {readonly foo: number, ...}; // ERROR (class object subtyping)
}

interface WithIndexer {
  foo: number;
  [string]: boolean;
}
type MappedInterfaceWithIndexer = {readonly [key in keyof WithIndexer]: WithIndexer[key]};
{
  declare const i: MappedInterfaceWithIndexer;
  i as interface {readonly foo: number, readonly [string]: boolean}; // OK
  i as interface {readonly foo: number, [string]: boolean}; // ERROR
}

class A {
  static bar: number;
  foo: number;
}

type MappedInstance = {readonly [key in keyof A]: A[key]};
{
  declare const inst: MappedInstance;
  inst as interface {readonly foo: number}; // OK
  inst as interface {foo: number}; // ERROR
  (inst['bar']); // ERROR
}

type MappedClass = {readonly [key in keyof Class<A>]: Class<A>[key]};
{
  declare const c: MappedClass;
  c as interface {readonly bar: number}; // OK
  c as interface {bar: number}; // ERROR
}
