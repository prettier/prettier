"use strict";

const CACHE_DIR = "./.cache";

module.exports = {
  async onPreBuild({ utils }) {
    await utils.cache.restore(CACHE_DIR);
  },
  async onPostBuild({ utils }) {
    await utils.cache.save(CACHE_DIR);
  },
};
