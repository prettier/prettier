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
    parserOptions.experimentalRawTransfer = oxcSupportsRawTransfer;
  }

  return parserOptions;
}

export default createOxcParserOptions;
