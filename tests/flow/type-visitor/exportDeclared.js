//@flow

module.exports = require("foo"); // CJS objects have read only props,
                                 // so we don't need to error here.
