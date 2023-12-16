type FallbackFlags<F: Flags | void> =
  Equals<NonNullableFlag<F>["flags"], {}> extends true
    ? Dict<any>
    : NonNullableFlag<F>["flags"];
