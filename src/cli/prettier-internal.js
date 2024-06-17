// @ts-expect-error
import { __internal as sharedWithCli } from "../index.js";

export const {
  errors,
  optionCategories,
  createIsIgnoredFunction,
  formatOptionsHiddenDefaults,
  normalizeOptions,
  getSupportInfoWithoutPlugins,
  normalizeOptionSettings,
  vnopts,
  fastGlob,
  createTwoFilesPatch,
  mockable,
} = sharedWithCli;
