{
  foo: (
    // comment
    {
      bar: "baz",
    }
  )
}

{
  foo: (
    /* comment */
    {
      bar: "baz",
    }
  )
}

{
  foo: (
    // first comment
    // second comment
    {
      bar: "baz",
    }
  )
}

{
  foo: (
    // comment
    bar
  )
}

{
  foo: (
    // comment
    bar + baz
  )
}

{
  outer: inner: (
    // comment
    {
      bar: "baz",
    }
  )
}

{
  foo: (
    {
      // property comment
      bar: "baz",
    }
    // trailing comment
  )
}

{
  foo: (/* inline comment */ { bar: "baz" })
}

{
  outer:
  // comment between labels
  inner: ({ bar: "baz" })
}

{
  foo: (
    bar +
    // operand comment
    baz
  )
}

{
  foo: (
    // optional member comment
    bar?.baz
  )
}

{
  foo: (
    // optional call comment
    bar?.()
  )
}
