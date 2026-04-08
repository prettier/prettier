// Annotation hint
type F = string => boolean;
{
  declare const x: 'a';

  const out: F = match (x) {
      'a' => (y => true), // OK
  };
}

// Sibling before
{
  declare const x: 'a' | 'b';

  const out = match (x) {
      'a' => [1],
      'b' => [], // Should be `Array<number>`
  };
  out as Array<number>; // OK
}

// Sibling after
{
  declare const x: 'a' | 'b';

  const out = match (x) {
      'a' => [], // Should be `Array<number>`
      'b' => [1],
  };
  out as Array<number>; // OK
}

// Multiple siblings, one valid
{
  declare const x: 'a' | 'b' | 'c' | 'd';

  const out = match (x) {
      'a' => 1,
      'b' => {},
      'c' => [1],
      'd' => [], // Should be `Array<number>`
  };
  out as number | {} | Array<number>; // OK
}

// Multiple siblings, multiple valid
{
  declare const x: 'a' | 'b' | 'c';

  const out = match (x) {
      'a' => [true],
      'b' => [1],
      'c' => [],
  };
  out as Array<boolean> | Array<number>; // OK
}
{
  declare const x: 'a' | 'b' | 'c';

  const out = match (x) {
      'a' => ((x: number) => 1),
      'b' => ((x: string) => true),
      'c' => (x => x as number), // OK
  };
}

// Cycles avoided
{
  declare const x: 'a' | 'b';

  const out: (x: number) => void = match (x) { // OK
    'a' => ((x) => {}),
    'b' => ((x) => {}),
  };
}
{
  declare const x: 'a' | 'b';

  const out: Array<number> = match (x) { // OK
    'a' => [],
    'b' => [],
  };
}
