"use strict";

module.exports = {
  getStream: function() {
    throw new Error("getStream is not supported in the browser");
  },
  cosmiconfig: function() {
    throw new Error("cosmiconfig is not supported in the browser");
  }
};
