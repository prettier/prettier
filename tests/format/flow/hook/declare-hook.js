declare hook useFoo(): void;

declare hook useFoo(): SomeComponent;

declare hook useFoo(): React.Element<typeof SomeComponentLonnnnnnnnnnnnnnnnnnnnnnnnnnnnng>;

declare hook useFoo<T>(): void;

declare hook useFoo<T>(): Array<Fooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo>;

declare hook useFoo<T: Fooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo>(): void;

declare hook useFoo(bar: string): string;

declare hook useFoo(bar?: string): string;

declare hook useFoo(data: string): string;

declare hook useFoo(...restProps: $ReadOnly<{k: string}>): {k: string};

declare hook useFoo(...$ReadOnly<{k: string}>): {k: string};

declare hook useFoo(bar: string, baz: $ReadOnly<{k: string}>): void;

declare hook useFoo(bar: string, baz: $ReadOnly<{k: string}>, realllllllllllllllllllyLong: string): void;

// Attached comment
declare hook useFoo(
  /**
   * Commet block
   */
  bar: string, // Trailing comment

  // preceding comment
  baz: $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>
  // Trailing comment
): void;

declare hook useFoo(
  ...props: $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>
  // Trailing comment
): SomeComponent;

declare hook useFoo(
  ...props: $ReadOnly<{k: string, reallllllllllllllllllllllllllllllllllllllyLong: string}>
  // Trailing comment
): SomeComponent;
