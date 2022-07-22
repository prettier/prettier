import prettier from "../../config/prettier-entry.js";

const { printDocToString } = prettier.doc.prettier;

test("Throw error on invalid doc", () => {
  const printDocToStringOptions = { printWidth: 80, tabWidth: 2 };
  for (const doc of [
    true,
    false,
    0,
    1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    BigInt(1),
    Symbol("symbol"),
    function () {},
    () => {},
    {},
    [undefined],
    null,
    Promise.resolve("1"),
    (function* () {})(),
  ]) {
    expect(() => printDocToString(doc, printDocToStringOptions)).toThrowError(
      /is not a valid document/
    );
    expect(() => printDocToString([doc], printDocToStringOptions)).toThrowError(
      /is not a valid document/
    );
  }
});
