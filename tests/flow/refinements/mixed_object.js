// @flow
function bad (x : mixed) {
  if (typeof x === "object" && x !== null) {
    x.a = 3;
  }
}

let obj : {a : string} = {a : "oops"};
bad(obj); // yikes
