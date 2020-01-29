// @flow

type ReturnType = {|
  a: string
|};

// works
const a = [].reduce(
  (p: ReturnType, e: string): ReturnType => {
    // annotate return type
    return { a: "" };
  },
  { a: "" }
);

// works
const b = [].reduce(
  (p: ReturnType, e: string) => {
    // without annotation
    return { a: "" };
  },
  { a: "" }
);

(a: ReturnType); // ok
(b: ReturnType); // ok
