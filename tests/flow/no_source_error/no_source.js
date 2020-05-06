// @flow

/*
 * This code generates an error where one of the locations has no source
 * associated with it. This example shows that any code that processes errors
 * must be tolerant of this case. I came across it when changing the code that
 * processes suppressions, and building in an assumption that every error
 * location included a source. This assumption turned out to be false.
 */

type Foo = {foo: string};
type FooPlus = {foo: string, bar: number};

class Baz {
  z(x: FooPlus): boolean { return true; }
  f() {
    const x: Array<Foo> = [];
    x.filter(this.z);
  }
}
