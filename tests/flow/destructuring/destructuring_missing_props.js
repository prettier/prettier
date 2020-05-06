//@flow
declare var x: {| foo: string |};
var {nonExistent, defaults = "hi", foo = 3} = x; // Error, missing nonExistent
(defaults: string);
(foo: number); // Error, number | string
(foo: number | string);

declare var y: {| bar: string |};
var {nonExistent2, defaults2 = "hi", bar = 3} = y; // Error, missing nonExistent2
(defaults2: string);
(bar: string); // Error, number | string
(bar: number | string);

var { baz = 15150 } = null // Error, baz is missing in null (you can't destructure null)

declare var z : { thud : string };
var { grunt = 15210 } = z; // Error, grunt missing in inexact object type

const proto : {| foo : number |} = { foo : 3 };
const obj = { __proto__ : proto, baz : "string" };
var { qux = "string" } = obj; // Error, qux missing

// Begin React examples

const React = require('react');
function Component({defaultProps = "default", regularProp}) { // Error, missing regularProp
  (defaultProps: string);
  (regularProp: number);
  return null;
}

const _a = <Component regularProp={3} />;
const _b = <Component />;

class A {
  prop: boolean;
  // No err! prop will always be initialized to a boolean
  constructor({prop = false}: {| prop: boolean |} = {}) {
  }
}
