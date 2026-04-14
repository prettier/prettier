hook useFoo1() {}

export default hook useFoo2() {}

export hook useFoo3() {}

hook useFoo4(): string {}

hook useFoo5<T>() {}

hook useFoo6(...foo) {}

// `?` not allowed since flow-parser@0.307.0
// hook useFoo7(...rest?: Foo) {}

hook useFoo8(foo, ...bar) {}

hook useFoo9(foo: Foo, ...bar: Bar) {}

hook useFoo10(foo: () => void,): number { return; }

hook useFoo11(o: { f(string): void }) {}

hook useFoo12(foo, ...bar): React.Element<typeof SomeComponentLonnnnnnnnnnnnnnnnnnnnnnnnnnnnng> {}

hook useFoo13(foo: Array<Fooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo>, ...bar): void {}

hook useFoo14<
  T: Fooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo,
>(): any {};

async hook useAsyncFoo1() {}

export async hook useAsyncFoo2() {}

async hook useAsyncFoo3(): string {}

async hook useAsyncFoo4(foo: Foo, ...bar: Bar) {}
