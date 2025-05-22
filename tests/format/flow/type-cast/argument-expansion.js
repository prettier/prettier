const bar1 = [1,2,3].reduce((carry, value) => {
  return [...carry, value];
}, ([]: Array<string>));
