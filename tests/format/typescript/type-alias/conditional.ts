type FallbackFlags<F extends Flags | undefined> =
  Equals<NonNullableFlag<F>["flags"], {}>    extends   true
    ? Dict<any>
    : NonNullableFlag<F>["flags"];
