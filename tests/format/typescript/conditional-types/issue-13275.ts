type Foo<T> = T extends ((...a: any[]) => infer R extends string) ? R : never;
