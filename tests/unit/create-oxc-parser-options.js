import { rawTransferSupported } from "oxc-parser";
import createOxcParserOptions from "../../src/language-js/parse/utilities/create-oxc-parser-options.js";

describe(createOxcParserOptions, () => {
  test("returns an object with valid parser options", () => {
    expect(createOxcParserOptions()).toStrictEqual({});
    expect(createOxcParserOptions({ unsupported: true })).toStrictEqual({});

    expect(createOxcParserOptions({ oxcRawTransferMode: false })).toStrictEqual(
      {},
    );
    expect(createOxcParserOptions({ oxcRawTransferMode: true })).toStrictEqual({
      experimentalRawTransfer: expect.any(Boolean),
    });
  });

  // This test is skipped because `jest-light-runner` doesn’t support mocking
  test.skip("memoizes `rawTransferSupported` calls", () => {
    jest.clearAllMocks();

    createOxcParserOptions({});
    createOxcParserOptions({ oxcRawTransferMode: false });

    expect(rawTransferSupported).toHaveBeenCalledTimes(0);

    createOxcParserOptions({ oxcRawTransferMode: true });
    createOxcParserOptions({ oxcRawTransferMode: true });

    expect(rawTransferSupported).toHaveBeenCalledTimes(1);
  });
});
