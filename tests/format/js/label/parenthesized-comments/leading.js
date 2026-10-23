{
  foo: (
    // comment
    {
      bar: "baz",
    }
  )
}

{
  label: (
    // before the call
    call()
  );
}

{
  label: (
    // before the sequence
    (first(), second())
  );
}

{
  outer: inner: (
    // first comment
    // second comment
    { value: true }
  );
}

{
  outer: inner: // before the loop
  for (;;) {}
}
