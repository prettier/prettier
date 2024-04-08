type T = component();

type T = component() renders SomeComponent;

type T = component() renders React.Element<typeof SomeComponentLonnnnnnnnnnnnnnnnnnnnnnnnnnnnng>;

type T = component<T>();

type T = component<T: Fooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo>();

type T = component(bar: string);

type T = component(bar?: string);

type T = component('data-bar': string);

type T = component(...restProps: $ReadOnly<{k: string}>);

type T = component(...$ReadOnly<{k: string}>);

type T = component(bar: string, baz: $ReadOnly<{k: string}>);

type T = component(bar: string, baz: $ReadOnly<{k: string}>, realllllllllllllllllllyLong: string);

// Attached comment
type T = component(
  /**
   * Commet block
   */
  bar: string, // Trailing comment

  // preceding comment
  'data-baz': $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>
  // Trailing comment
);

type T = component(
  ...props: $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>
  // Trailing comment
);

type T = component(
  ...props: $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>
  // Trailing comment
) renders SomeComponent;

type T = component(bar: string) | component(baz: $ReadOnly<{k: string}>) | component(realllllllllllllllllllyLong: string, reallllllllllllllllllllllllllllllllllllllyLong: string);


function A(realllllllllllllllllllyLong: string, reallllllllllllllllllllllllllllllllllllllyLong: string): component(realllllllllllllllllllyLong: string, reallllllllllllllllllllllllllllllllllllllyLong: string) {}