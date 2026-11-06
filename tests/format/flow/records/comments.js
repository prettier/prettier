record A // comment
{
  a: string,
}

record B // comment
{}

record C<T> // comment
{
  a: T,
}

record D implements I // comment
{
  a: string,
}

record E // comment
  implements I
{
  a: string,
}

record /* comment */ F {
  a: string,
}

record G /* comment */ implements I {
  a: string,
}
