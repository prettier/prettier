import prettier from "../index.js";

const {
  errors,
  coreOptions,
  createIgnorer,
  optionsHiddenDefaults,
  normalizeCliOptions,
  utils: { arrayify, getLast, isNonEmptyArray, partition },
} = prettier.__internal;

export {
  errors,
  coreOptions,
  createIgnorer,
  optionsHiddenDefaults,
  normalizeCliOptions,
  // utils
  arrayify,
  getLast,
  isNonEmptyArray,
  partition,
};
