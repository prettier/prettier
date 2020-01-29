//@flow

function test(x: React$AbstractComponent<any, any>) {
  if (x.displayName) {
    x.displayName;
    x.displayName = null;
  }
  x.displayName.toString(); // Error maybe null or undefined
  x.definitelyNotHere.toString(); // Error missing prop
  x.displayName = 'display name';
  x.displayName = 3; // Error num ~> string
}
