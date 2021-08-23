<null>x;
!(<null>x /* foo */);
!(/* foo */ <null>x);
!(
  /* foo */
  <null>x
);
!(
  <null>x
  /* foo */
);
!(
  <null>x // foo
);

x as string;
!(x as string /* foo */);
!(/* foo */ x as string);
!(
  /* foo */
  x as string
);
!(
  x as string
  /* foo */
);
!(
  x as string // foo
);