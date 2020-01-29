// @flow

declare function displayString(_: string): void;

type Correlated =
  | { type: "string", val: string }
  | { type: "number", val: number };

function stringIsString(x: Correlated) {
  if (x.type === "string") {
    displayString(x.val);
  }
}
stringIsString({ type: "string", val: 0 }); // error
