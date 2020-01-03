type FooBarBuzz<T1 extends string> = (
  <T2 extends string>(bar: T1) => Output<T1, T2>
);

type FooBarBuzz<T1 extends string> = (
  <T2 extends string, T3 extends string>(bar: T1) => Output<T1, T2, T3>
);

type FooBarBuzz<T1 extends string, T2 extends string> = (
  <T3 extends string>(bar: T1) => Output<T1, T2, T3>
);

type FooBarBuzz<T1 extends string, T2 extends string> = (
  <T3 extends string, T4 extends string>(bar: T1) => Output<T1, T2, T3, T4>
);

type FooBarBuzz<T1> = (
  <T2>(bar: T1) => Output<T1, T2>
);

type FooBarBuzz<T1> = (
  <T2, T3>(bar: T1) => Output<T1, T2, T3>
);
