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

// filter out ThisExpression
this.compose(sortBy(x => x), flatten);
this.a.b.c.compose(sortBy(x => x), flatten);
someObj.someMethod(this.field.compose(a, b));

// filter out Super
class A extends B {
  compose() {
    super.compose(sortBy(x => x), flatten);
  }
}
