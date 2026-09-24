// @flow

type Minimal = new () => Instance;
type Abstract = abstract new () => Instance;
type Generic = new <T>(value:T, optional?:T, ...rest:Array<T>)=>Container<T>;
type ObjectReturn = new () => { value: string, anotherVeryLongPropertyName: number };
type UnionReturn = new () => First | Second;
type Nested = (new () => First) | (abstract new () => Second);
type Commented = abstract new /* after new */ <T>(
  /* before parameter */ value: T /* after parameter */,
) /* before arrow */ => /* after arrow */ Result<T>;
type EmptyComments = new (/* inside */) => Result;
type CommentBeforeNew = abstract // before new
new () => Result;
type CommentAfterNew = new // after new
() => Result;
type CommentBeforeArrow = new () // before arrow
=> Result;
