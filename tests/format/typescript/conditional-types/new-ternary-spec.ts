// TypeScript has the same behavior, including a line break after =, but no parens around "conditional":
type KnownKeys<T> =
  {
    [K in keyof T]: string extends K ? never
    : number extends K ? never
    : K;
  } extends { [_ in keyof T]: infer U } ?
    {} extends U ? never
    : U
  : never;

type KnownKeysWithLongExtends<T> =
  {
    [K in keyof T]: string extends K ? never
    : number extends K ? never
    : K;
  } extends {
    [_ in keyof T]: SomeReallyLongThingThatBreaksTheLine<infer U>
  } ? U
  : never;

// TypeScript examples:
type TypeName<T> =
  T extends string ? "string"
  : T extends number ? "number"
  : T extends boolean ? "boolean"
  : T extends undefined ? "undefined"
  : T extends Function ? "function"
  : "object";

type Unpacked<T> =
  T extends (infer U)[] ? U
  : T extends (...args: any[]) => infer U ?
    SomeReallyLongThingThatBreaksTheLine<U>
  : T extends Promise<infer U> ? U
  : T;

type LinkFieldName<Entity extends object> =
  keyof Entity extends infer ExpFieldName extends keyof Entity ?
    ExpFieldName extends `${infer FieldName}__resolved` ?
      Entity[ExpFieldName] extends | { title: string } | undefined ?
        FieldName
      : never
    : never
  : never;

type LinkFieldNameWithLongerExtends<Entity extends object> =
  keyof Entity extends infer ExpandedFieldName extends keyof Entity ?
    ExpandedFieldName extends `${infer FieldName}__resolved` ?
      Entity[ExpandedFieldName] extends (
        | { title: string }
        | { titleInAnotherWayThatIsLong: string }
        | { titleInAThirdWayThatIsLong: string }
        | undefined
      ) ?
        FieldName
      : never
    : never
  : never;
