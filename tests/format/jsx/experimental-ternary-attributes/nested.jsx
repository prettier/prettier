const withoutComment = (
  <Foo
    prop={
      bar ? "bar"
      : baz ? "baz"
      : <Bar prop={"This is a really long value to make sure that this wraps"} />
    }
  />
);

const withComment = (
  <Foo
    prop={
      bar ? "bar"
      : baz ? "baz"
      : <Bar prop={"This is a really long value to make sure that this wraps"} />
      // Keep this comment with the expression.
    }
  />
);

const nestedConsequent = (
  <Foo
    prop={
      bar ?
        baz ? "baz"
        : <Bar prop={"This is a really long value to make sure that this wraps"} />
      : "bar"
    }
  />
);

const childExpression = (
  <Foo>
    {
      bar ? "bar"
      : baz ? "baz"
      : <Bar prop={"This is a really long value to make sure that this wraps"} />
    }
  </Foo>
);
