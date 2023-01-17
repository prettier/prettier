type A<T: string/* comment */> = B;
type A<T: /* comment */string> = B;
type A<T:/* comment */ string> = B;
type A<T /* comment */:string> = B;
type A<T/* comment */ :string> = B;
type A</* comment */T :string> = B;
