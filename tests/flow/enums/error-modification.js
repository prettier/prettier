// @flow

enum E {
  A,
  B,
}

// Error: cannot modify enums - named "prop"
E.A = 1;

// Error: cannot modify enums - computed "prop"
E["A"] = 1;

// Error: cannot modify enums - deletion
delete E.A;
