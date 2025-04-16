const fn1 = () => ({
  foo: 1,
});

const fn2 = () => ({
  foo: 1,
}) as const;

call1(() => ({
  foo: 1,
}));

call2(() => ({
  foo: 1,
}) as const);
