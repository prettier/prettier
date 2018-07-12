compose(
  sortBy(x => x), 
  flatten, 
  map(x => [x, x*2])
);

somelib.compose(
  sortBy(x => x), 
  flatten, 
  map(x => [x, x*2])
);

composeFlipped(
  sortBy(x => x), 
  flatten, 
  map(x => [x, x*2])
);

somelib.composeFlipped(
  sortBy(x => x), 
  flatten, 
  map(x => [x, x*2])
);

// no regression (#4602)
const hasValue = hasOwnProperty(a, b);

// filter out cases when all args are Identifiers or literals
compose(a, b, c);
compose(1, 2, 3);
compose(
  a(),
  b,
  3
);
