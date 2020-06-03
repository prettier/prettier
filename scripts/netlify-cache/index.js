"use strict";

const CACHE_DIR = "./.cache";

module.exports = {
  async onPreBuild({ utils }) {
    console.log(`Restoring cache ${CACHE_DIR}`);
    await utils.cache.restore(CACHE_DIR);
    console.log(`Cache restored ${CACHE_DIR}`);
  },
  async onPostBuild({ utils }) {
    console.log(`Saving  Cache ${CACHE_DIR}`);
    await utils.cache.save(CACHE_DIR);
    console.log(`Cache Saved  ${CACHE_DIR}`);
  },
};
