declare component MyComponent();

declare component MyComponent() renders SomeComponent;

declare component MyComponent() renders React.Element<typeof SomeComponentLonnnnnnnnnnnnnnnnnnnnnnnnnnnnng>;

declare component MyComponent<T>();

declare component MyComponent<T: Fooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo>();

declare component MyComponent(bar: string);

declare component MyComponent(bar?: string);

declare component MyComponent('data-bar': string);

declare component MyComponent(...restProps: $ReadOnly<{k: string}>);

declare component MyComponent(...$ReadOnly<{k: string}>);

declare component MyComponent(bar: string, baz: $ReadOnly<{k: string}>);

declare component MyComponent(bar: string, baz: $ReadOnly<{k: string}>, realllllllllllllllllllyLong: string);

// Attached comment
declare component MyComponent(
  /**
   * Commet block
   */
  bar: string, // Trailing comment

  // preceding comment
  'data-baz': $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>
  // Trailing comment
);

declare component MyComponent(
  ...props: $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>
  // Trailing comment
);

declare component MyComponent(
  ...props: $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>
  // Trailing comment
) renders SomeComponent;