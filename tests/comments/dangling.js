var x = {/* dangling */};
var x = {
  // dangling
};
var x = [/* dangling */];
function x() {
  /* dangling */
}
new Thing(/* dangling */);
Thing(/* dangling */);
declare class Foo extends Qux<string> {/* dangling */}
export /* dangling */{};
