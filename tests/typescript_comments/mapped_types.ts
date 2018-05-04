type A = {
  // commentA
  [a in A]: string;
}

type B = {
  /* commentB */ [b in B]: string
}

type C = {
  [/* commentC */ c in C]: string
}

type D = {
  [d /* commentD */ in D]: string
}

type E = {
  [e in /* commentE */ E]: string
}

type F = {
  [f in F /* commentF */]: string
}

type G = {
  [g in G] /* commentG */: string
}
