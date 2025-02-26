// Indent multiline logical expressions used as function arguments
foo(long_long_long_long_long_long_long_condition_1 &&
  long_long_long_long_long_long_long_variable_2);
foo(long_long_long_long_long_long_long_condition_1 ||
  long_long_long_long_long_long_long_variable_2);
foo(long_long_long_long_long_long_long_condition_1 ??
  long_long_long_long_long_long_long_variable_2);

// Indent multiline logical sub expressions
long_long_long_long_long_long_long_condition_1 ||
  (long_long_long_long_long_long_long_condition_2 &&
    long_long_long_long_long_long_long_condition_3);
long_long_long_long_long_long_long_condition_1 &&
  (long_long_long_long_long_long_long_condition_2 ||
    long_long_long_long_long_long_long_condition_3);
long_long_long_long_long_long_long_condition_1 ||
  (long_long_long_long_long_long_long_condition_2 ??
    long_long_long_long_long_long_long_condition_3);
