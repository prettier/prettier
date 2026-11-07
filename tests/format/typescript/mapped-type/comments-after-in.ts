type a= {
    [
      A in
      /* comment */
      B
    ]: C  |  D
  }

type a= {
    [
      A in
      // comment
      B
    ]: C  |  D
  }

type Inline = { [K in /* comment */ U]: V };

type EndOfLine = {
  [K in // comment
  U]: V;
};

type Multiple<T> = {
  readonly [K /* before in */ in
    /* first */
    /* second */
    keyof T /* after constraint */ as K]?: T[K];
};

type Mixed = {
  [K in /* block */
    // line
    A | B]: V;
};
