//@flow

function corrupt<S: string>(x: S): S {
  return "A" + x;
}

var x: "B" = corrupt<"B">("B")
