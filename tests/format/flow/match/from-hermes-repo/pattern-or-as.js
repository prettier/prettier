const e = match (x) {
  "s" | true | null => 1,
  | "s"
  | true
  | null => 1,
  {foo: 1 | 2} => 2,
  {foo: | 1
        | 2} => 2,
  {foo: [1] as y} => y,
  {foo: 1 | 2 | 3 as y} => y,
  {foo: (1 | 2 | 3) as y} => y,
  {foo: [1] as const y} => y,
};
