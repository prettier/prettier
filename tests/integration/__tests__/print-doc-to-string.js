import prettier from "../../config/prettier-entry.js";

const { printDocToString } = prettier.doc.printer;

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
    /regexp/i,
    new Date(),
    new Error("error"),
    Buffer.from("buffer"),
    new Uint8Array(2),
  ]) {
    expect(() => printDocToString(doc, printDocToStringOptions)).toThrowError(
      /is not a valid document|Cannot read properties of/
    );
    expect(() => printDocToString([doc], printDocToStringOptions)).toThrowError(
      /is not a valid document|Cannot read properties of/
    );
  }
});
