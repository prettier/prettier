// #13275
type Foo<T> = T extends ((...a: any[]) => infer R extends string) ? R : never;
type Foo<T> = T extends (new (...a: any[]) => infer R extends string) ? R : never;

// Nest
type Foo<T> = T extends (
  (...a: any[]) => infer R extends (
    T extends ((...a: any[]) => infer R extends string) ? R : never
  )
) ? R : never;

// #14275
type Test<T> = T extends ((
  token: TSESTree.Token
) => token is infer U extends TSESTree.Token)
  ? U
  : TSESTree.Token;
type Test<T> = T extends ((
  token: TSESTree.Token
) => asserts token is infer U extends TSESTree.Token)
  ? U
  : TSESTree.Token;
type Test<T> = T extends (new (
  token: TSESTree.Token
) => token is infer U extends TSESTree.Token)
  ? U
  : TSESTree.Token;
