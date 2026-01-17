function foo() {
  return ( // Comment
    a, b
  );
  return (
    // Comment
    a, b
  );
  return /* Comment*/ (
    a, b
  );
  return (/* Comment*/
    a, b
  );
  return (
    /* Comment*/
    a, b
  );

  return ( // Comment
    a = b
  );
  return (
    // Comment
    a = b
  );

  throw (
    // Comment
    a, b
  );

  throw (
    // Comment
    a = b
  );
}
