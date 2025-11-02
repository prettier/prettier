import {
  addAlignmentToDoc,
  align,
  conditionalGroup,
  dedent,
  dedentToRoot,
  fill,
  group,
  ifBreak,
  indent,
  indentIfBreak,
  join,
  label,
  line,
  lineSuffix,
  markAsRoot,
} from "../../src/document/builders.js";
import InvalidDocError from "../../src/document/invalid-doc-error.js";

const invalidDoc = { type: "invalid-type" };
const validDoc = "string";
const notArray = {};
describe("doc builders", () => {
  const invalid = [
    () => indent(),
    () => indent(invalidDoc),

    () => align(2),
    () => align(2, invalidDoc),

    () => group(),
    () => group(invalidDoc),
    [() => group(validDoc, { expandedStates: notArray }), TypeError],
    () => group(validDoc, { expandedStates: [invalidDoc] }),

    () => dedentToRoot(),
    () => dedentToRoot(invalidDoc),

    () => markAsRoot(),
    () => markAsRoot(invalidDoc),

    () => dedent(),
    () => dedent(invalidDoc),

    [() => conditionalGroup(), TypeError],
    () => conditionalGroup([]),
    () => conditionalGroup([invalidDoc]),
    () => conditionalGroup([validDoc, invalidDoc]),

    [() => fill(), TypeError],
    [() => fill(notArray), TypeError],
    () => fill([invalidDoc]),
    [() => fill(["abc", "abc"]), Error],
    [() => fill(["abc", line, "def", "ghi"]), Error],
    [() => fill(["abc", [line, "def"], "ghi"]), Error],
    [() => fill(["abc", "", "def"]), Error],

    () => ifBreak(),
    () => ifBreak(invalidDoc),
    () => ifBreak(validDoc, 0),
    () => ifBreak(validDoc, null),
    () => ifBreak(validDoc, invalidDoc),

    () => indentIfBreak(),
    () => indentIfBreak(invalidDoc),

    () => lineSuffix(),
    () => lineSuffix(invalidDoc),

    () => join(),
    () => join(invalidDoc),
    () => join(invalidDoc, []),
    [() => join(validDoc, notArray), TypeError],
    () => join(validDoc, [invalidDoc]),

    () => addAlignmentToDoc(),
    () => addAlignmentToDoc(invalidDoc),

    () => label(),
    () => label({}, invalidDoc),
  ];

  const valid = [
    group(validDoc),
    group(validDoc, { expandedStates: undefined }),

    ifBreak(validDoc),
    // eslint-disable-next-line unicorn/no-useless-undefined
    ifBreak(validDoc, undefined),
  ];

  describe("Invalid usage", () => {
    for (let invalidCase of invalid) {
      if (!Array.isArray(invalidCase)) {
        invalidCase = [invalidCase, InvalidDocError];
      }

      test(invalidCase[0].toString(), () => {
        expect(invalidCase[0]).toThrow(invalidCase[1]);
      });
    }
  });

  test("Valid usage", () => {
    for (const doc of valid) {
      expect(doc).toBeDefined();
    }
  });
});
