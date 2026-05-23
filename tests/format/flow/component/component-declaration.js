component MyComponent() {}

component MyComponent() renders SomeComponent {}

component MyComponent() renders React.Element<typeof SomeComponentLonnnnnnnnnnnnnnnnnnnnnnnnnnnnng> {}

component MyComponent() {
  return <OtherComponent />;
}

component MyComponent(a: string, b: number) renders SomeComponent {
  return <OtherComponent />;
}

export component MyComponent() {}

export default component MyComponent() {}

component MyComponent<T>() {}

component MyComponent<T: Fooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo>() {}

component MyComponent(bar: string) {}

component MyComponent(bar?: string) {}

component MyComponent(bar: string = '') {}

component MyComponent(propBar as bar: string) {}

component MyComponent(propBar as [bar]: $ReadOnlyArray<string>) {}

component MyComponent(propBar as {bar}: $ReadOnly<{bar: string}>) {}

component MyComponent(propBar as {bar, reallllllllllllllllllllllllllllllllllllllyLong}: $ReadOnly<{bar: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>) {}

component MyComponent('data-bar' as bar: string) {}

component MyComponent(...restProps: $ReadOnly<{k: string}>) {}

component MyComponent(bar: string, baz: $ReadOnly<{k: string}>) {}

component MyComponent(bar: string, baz: $ReadOnly<{k: string}>, realllllllllllllllllllyLong: string) {}

component MyComponent(bar: string, baz: $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>) {}

component MyComponent(bar: string, 'data-baz' as baz: $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>) {}

// Attached comment
component MyComponent(
  /**
   * Commet block
   */
  bar: string, // Trailing comment

  // preceding comment
  'data-baz' as baz: $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>
  // Trailing comment
) {}

component MyComponent(
  ...props: $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>
  // Trailing comment
) {}

component MyComponent() /* Trailing comment */ {}

async component MyAsyncComponent() {}

async component MyAsyncComponent() renders SomeComponent {}

async component MyAsyncComponent(bar: string, baz: number) {
  return <OtherComponent />;
}

export async component MyExportedAsyncComponent() {}

async component MyAsyncComponentWithAwait() {
  const   data   =   await   fetchData();
  return <OtherComponent data={data} />;
}

async component MyAsyncComponentWithAwaitAndParams(bar:   string,   baz:   number) {
  const   data   =   await   fetchData(bar,   baz);
  return <OtherComponent data={data} />;
}

async component MyAsyncComponentWithAwaitAndRenders(bar: string) renders SomeComponent {
  const   data   =   await   fetchData(bar);
  return <OtherComponent data={data} />;
}

async component MyAsyncComponentWithMultipleAwaits() {
  const   data   =   await   fetchData();
  const   processed   =   await   processData(data);
  return <OtherComponent data={processed} />;
}

async component MyAsyncComponentWithLongAwait() {
  const data = await fetchSomeReallllllllllllllllllllllllllllllllllllllyLongFunctionName(argumentOne, argumentTwo, argumentThree);
  return <OtherComponent data={data} />;
}
