// @ts-expect-error
import { __internal as sharedWithCli } from "../index.js";

export const {
  errors,
  coreOptions,
  createIsIgnoredFunction,
  formatOptionsHiddenDefaults,
  normalizeOptions,
  getSupportInfoWithoutPlugins,
  vnopts,
  fastGlob,
} = sharedWithCli;
