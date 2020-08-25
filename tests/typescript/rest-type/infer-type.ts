type Tail<T extends any[]> = T extends [infer U, ...infer R] ? R : never;

type ReduceNextElement<
  T extends readonly unknown[]
> = T extends readonly [infer V, ...infer R] ? [V, R] : never
