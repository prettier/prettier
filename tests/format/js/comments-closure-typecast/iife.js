const helpers1 = /** @type {Helpers} */ ((
  (helpers = {}) => helpers
)());

const helpers2 = /** @type {Helpers} */ ((
  function() { return something }
)());

const helpers = /** @type {Helpers} */ ((
  /** @param {Partial<Helpers>} helpers */
  (helpers = {}) => helpers
)());

!(/** @param {number} x */ (x) => x);

(/** @param {string} x */ function (x) {});


( /** @param {string} x */// another comment
  function (x){ });

( /** @param {string} x */// prettier-ignore
  function (x){    });

// valid use-case with TypeScript's stripInternal option
( /** @param {string} x */ /* @internal */ function (x){    });
