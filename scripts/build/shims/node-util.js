import * as util from "node:util";

export const styleText =
  util.styleText ?? ((format, text /* , options*/) => text);
