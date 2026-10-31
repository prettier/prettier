import prettier from "../../config/prettier-entry.js";

test.each(["babel", "meriyah"])(
  "format a long binary expression without overflowing the stack (%s)",
  async (parser) => {
    const operandCount = 1800;
    const source = Array.from({ length: operandCount }, () => '"a"').join(
      " + ",
    );
    const output = await prettier.format(source, { parser });

    expect(output.match(/"a"/g)).toHaveLength(operandCount);
    expect(await prettier.format(output, { parser })).toBe(output);
  },
);
