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
