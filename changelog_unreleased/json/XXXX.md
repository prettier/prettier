#### Don't use trailing commas in jsonc (#XXXX by @pdavies)

Don't use trailing commas in JSONC files, as they are not valid JSONC.

<!-- prettier-ignore -->
```jsonc
// Input
["long","long","long","long","long","long","enough","to","break","into","multiple","lines"]

// Prettier stable
[
  "long",
  "long",
  "long",
  "long",
  "long",
  "long",
  "enough",
  "to",
  "break",
  "into",
  "multiple",
  "lines",
]

// Prettier main
[
  "long",
  "long",
  "long",
  "long",
  "long",
  "long",
  "enough",
  "to",
  "break",
  "into",
  "multiple",
  "lines"
]
```
