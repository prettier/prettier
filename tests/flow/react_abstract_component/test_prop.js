//@flow

function test(x: React$AbstractComponent<any, any>) {
  if (x.displayName) {} // We can look for props on components
  if (x.notOnEitherSFCOrClass) {} // Error Not on any component
}
