[
  "abc",
  'abc',

  '\'',

  '"',
  '\"',
  '\\"',

  "'",
  "\'",
  "\\'",

  "'\"",
  '\'"',

  '\\',
  "\\",

  '\0',
  '🐶',

  '\uD801\uDC28',
];

// Normalization of \x and \u escapes:

// Basic case.
"a\xAaAb\uB1cDE";
`a\xAaAb\uB1cDE`;

// ES2015 unicode escapes.
"\u{1Fa3}";
`\u{1Fa3}`;
"\u{00000000A0}";
`\u{00000000A0}`;

// Leaves other escapes alone.
"\B\S";
`\B\S`;

// Handles escaped backslashes.
"\\xAB\\\xAB\\\\xAB\B\\\B\u1234";
`\\xAB\\\xAB\\\\xAB\B\\\B\u1234`;

// Mix of everything.
"\xF0"`a\uaBcD${'\xFdE'}\\\u{00AbCdE}`;
