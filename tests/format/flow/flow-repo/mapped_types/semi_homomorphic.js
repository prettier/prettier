type Semi<O extends {...}, Keys extends keyof O> = {
  [key in Keys]: O[key],
}
{
  // Regular properties work
  type O = {readonly foo: number};

  type Mapped = Semi<O, 'foo'>;

  declare const a: Mapped;
  a.foo = 3; // ERROR

  type MappedBad = Semi<O, 'bar'>; // ERROR HERE
  declare const b: MappedBad;
  b as {bar: empty}; // NO ERROR
}

{
  // Indexers work
  type P = {foo: number, bar: string, [string]: boolean};

  type MappedWithIndexer = Semi<P, 'foo' | string>;

  declare const withIndexer: MappedWithIndexer;
  withIndexer as {foo: number, [string]: boolean}; // OK
  withIndexer as {foo: number}; // ERROR, missing indexer

  type MappedWithoutIndexer = Semi<P, 'foo' | 'bar'>;

  declare const withoutIndexer: MappedWithoutIndexer;
  withoutIndexer as {foo: number, bar: string}; // OK
  withoutIndexer as P; // Arguably should error, but pre-existing unsoundness
  declare const p: P;
  p as MappedWithoutIndexer; // ERROR

  // Incompatible indexers cause an error at the instantiation site
  // but persist the indexer type.
  type IndexedBad = Semi<P, number>; // ERROR
  declare const bad: IndexedBad;
  bad as {[number]: boolean}; // NO ERROR

  // Indexers when the original type has none cause an error at the instantiation
  // site and an any-typed indexer
  type NoIndexerBad = Semi<{}, number>; // ERROR
  declare const noIndexerBad: NoIndexerBad;
  noIndexerBad as {[number]: empty}; // NO ERROR
}
