type A = & string;
type B =
  & { foo: string }
  & { bar: number };

type C = [& { foo: 1 } & { bar: 2 }, & { foo: 3 } & { bar: 4 }];
type D = (number | string) & boolean;
type E = ((number | string)) & boolean;
type F = (((number | string))) & boolean;
type G = ((((number | string)))) & boolean;
