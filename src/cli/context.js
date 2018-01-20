"use strict";

const path = require("path");

const util = require("./util");
const thirdParty = require("../common/third-party");

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

  formatStdin() {
    const filepath = this.argv["stdin-filepath"]
      ? path.resolve(process.cwd(), this.argv["stdin-filepath"])
      : process.cwd();

    const ignorer = util.createIgnorer(this, this.argv["ignore-path"]);
    const relativeFilepath = path.relative(process.cwd(), filepath);

    thirdParty.getStream(process.stdin).then(input => {
      if (relativeFilepath && ignorer.filter([relativeFilepath]).length === 0) {
        util.writeOutput({ formatted: input }, {});
        return;
      }

      const options = util.getOptionsForFile(this, filepath);

      if (util.listDifferent(this, input, options, "(stdin)")) {
        return;
      }

      try {
        util.writeOutput(util.format(this, input, options), options);
      } catch (error) {
        util.handleError(this, "stdin", error);
      }
    });
  }
}

module.exports = Context;
