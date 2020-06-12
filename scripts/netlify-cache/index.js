"use strict";
const path = require('path');

module.exports = {
  async onPreBuild({ constants, utils }) {
    const CACHE_DIR = path.join(constants.PUBLISH_DIR, '../.cache')

    if (await utils.cache.restore([CACHE_DIR])) {
      console.log('Cache Restored.');
    } else {
      console.log('No cache found. Building fresh.');
    }
  },
  async onPostBuild({ utils }) {
    const CACHE_DIR = path.join(constants.PUBLISH_DIR, '../.cache')

    if (await utils.cache.save(cacheDirs)) {
      console.log('Stored the cache to speed up future builds.');
    } else {
      console.log('No build found.');
    }
  },
};
