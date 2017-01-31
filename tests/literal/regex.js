// Normalization of \x and \u escapes:

// Basic case.
/a\xAaAb\uB1cDE/gim;

// ES2015 unicode escapes.
/\u{1Fa3}/u;
/\u{00000000A0}/u;

// Leaves what looks like a ES2015 unicode escape alone if not using the /u flag.
/\u{1Fa3}/;

// Leaves what looks like escapes but aren't alone.
/\xA\u00BG/;

// Leaves other escapes alone.
/\B\S/;

// Handles escaped backslashes.
/\\xAB\\\xAB\\\\xAB\B\\\B\uAbCd/;
