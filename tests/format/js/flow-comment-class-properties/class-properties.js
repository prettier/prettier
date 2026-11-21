class Worker {
  #plugins /*: ReadonlyArray<MetadataWorker> */;
  publicField /*: string */;
  static #privateStatic /*: number */;
  [computed] /*: boolean */;
  "quoted field" /*: string */;
  withoutSemicolon /*: number */
  multiline /*: {
    value: string,
  } */;
  mixed /* before */ /*: string */ /* after */;
  initialized /*: number */ = 1;
  // Leading comment.
  #next /*: string */; // Trailing comment.
}

class NeedsSemicolon {
  #privateField /*: number */;
  [computed] = 1;
  publicField /*: number */;
  *method() {}
}

class Inline { #field /*: string */; other /*: number */; }
