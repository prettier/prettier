"use strict";

const util = require("./util");

/**
 * @property supportOptions
 * @property detailedOptions
 * @property detailedOptionMap
 * @property apiDefaultOptions
 */
class Context {
  constructor(args) {
    this.args = args;

    util.updateContextArgv(this);
    util.normalizeContextArgv(this, ["loglevel", "plugin"]);

    this.logger = util.createLogger(this.argv["loglevel"]);

    util.updateContextArgv(this, this.argv["plugin"]);
  }

  init() {
    // split into 2 step so that we could wrap this in a `try..catch` in cli/index.js
    util.normalizeContextArgv(this);
  }
}

module.exports = Context;
