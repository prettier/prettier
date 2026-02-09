import { rawTransferSupported } from "oxc-parser";

let oxcSupportsRawTransfer;

/**
@param {import("prettier").ParserOptions} options
*/
function createOxcParserOptions(options) {
  const parserOptions = {};

  if (options?.oxcRawTransferMode === true) {
    if (oxcSupportsRawTransfer === undefined) {
      oxcSupportsRawTransfer = rawTransferSupported();
    }
    if (oxcSupportsRawTransfer) {
      parserOptions.experimentalRawTransfer = true;
    }
  }

  return parserOptions;
}

export default createOxcParserOptions;
