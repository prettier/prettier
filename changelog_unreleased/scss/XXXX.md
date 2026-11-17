#### Fix trailing comma position before multiple line comments in maps (#XXXX by @peralva)

<!-- prettier-ignore -->
```scss
// Input
$my-map: (
  'foo': 1,
  'bar': 2 // Comment
  // Comment
);

// Prettier stable
$my-map: (
  "foo": 1,
  "bar": 2 // Comment
  , // Comment
);

// Prettier main
$my-map: (
  "foo": 1,
  "bar": 2, // Comment
  // Comment
);
```
