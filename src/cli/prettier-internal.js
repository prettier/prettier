import prettier from "../index.js";

const {
  errors,
  coreOptions,
  createIgnorer,
  optionsHiddenDefaults,
  normalizeApiOptions,
  normalizeCliOptions,
  utils: { arrayify, getLast, isNonEmptyArray, partition },
} = prettier.__internal;

export {
  errors,
  coreOptions,
  createIgnorer,
  optionsHiddenDefaults,
  normalizeApiOptions,
  normalizeCliOptions,
  // utils
  arrayify,
  getLast,
  isNonEmptyArray,
  partition,
};
