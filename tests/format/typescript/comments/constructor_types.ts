type Empty = new /* before */ () => string;
type Inner = new /* before */ (/* inside */) /* after */ => string;
type Abstract = abstract new /* before */ (/* inside */) /* after */ => string;
type Multiple = new /* first */ /* second */ (/* inside */) /* after */ => string;

type EndOfLine = new // before
() => string;

type OwnLine = new
/* before */
(/* inside */) /* after */ => string;

type Mixed = new /* first */ // second
/* third */ (/* inside */) /* after */ => string;

type InnerLine = new /* before */ (
// inside
) /* after */ => string;

interface Factory {
  new /* before */ () : string;
  new /* before */ (/* inside */) /* after */ : string;
  new // before
  (/* inside */) /* after */ : string;
  new
  /* before */
  (/* inside */) /* after */ : string;
}

type Nonempty = new /* before */ (value: /* inside */ string) /* after */ => string;
type Generic = new /* before */ <T> /* between */ (/* inside */) /* after */ => T;
type AbstractGeneric = abstract /* modifier */ new /* before */ <T> /* between */ (/* inside */) /* after */ => T;
type Function = /* before */ (/* inside */) /* after */ => string;
type NestedFunction = new () => /* before */ (/* inside */) => string;
type NestedConstructor = new () => new /* before */ (/* inside */) => string;
type AbstractModifier = abstract /* modifier */ new /* before */ (/* inside */) => string;
