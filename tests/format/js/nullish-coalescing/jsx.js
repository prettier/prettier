const a = condition ? (
  <Example /> // comment
) : (
  "alpha" ?? "bravo"
);

const b = condition ? (
  <Example /> // comment
) : (
  "alpha" + "bravo"
);

const c = condition ? <Example /> : "alpha" ?? "bravo";

const d = condition ? (
  <Example />
) : (
  someVeryLongNullableValueNameHere ?? someOtherEvenLongerFallbackValueNameHere
);

const e = someNullableValue ?? someFallbackValue ? <Example /> : <Other />;

const f = condition ? (
  "alpha" ?? "bravo"
) : (
  <Example /> // comment
);
