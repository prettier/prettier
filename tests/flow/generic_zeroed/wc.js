// @flow
function coerce<T, U>(t: T): U {
  type Fruit<T> =
    | {| +type: "APPLE", +value: T |}
    | {| +type: "BAD_APPLE", +value: empty |};
  function corrupt<S: string>(s: S): S {
    return "BAD_" + s;
  }
  const fruit: Fruit<T> = { type: (corrupt("APPLE"): "APPLE"), value: t };
  if (fruit.type === "BAD_APPLE") {
    return fruit.value;
  } else {
    throw new Error("Unreachable.");
  }
}
const twelve: number = coerce("twelve"); // no type error!
twelve.toFixed(); // runtime error!
