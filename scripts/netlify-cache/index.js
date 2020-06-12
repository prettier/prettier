"use strict";
const path = require('path');

const CACHE_DIR = "./.cache";


module.exports = {
  async onPreBuild({ utils }) {
    const CACHE_DIR = path.join(__dirname, '../../.cache')

    console.log(`Restoring cache ${CACHE_DIR}`);
    try {
      await utils.cache.restore([CACHE_DIR]);
      console.log(`Cache restored ${CACHE_DIR}`);
    } catch (error) {
      console.error(error);
    }
  },
  async onPostBuild({ utils }) {
    const CACHE_DIR = path.join(__dirname, '../../.cache')
    console.log(`Saving  Cache ${CACHE_DIR}`);
    try {
      await utils.cache.save([CACHE_DIR]);
      console.log(`Cache Saved  ${CACHE_DIR}`);
    } catch (error) {
      console.error(error);
    }
  },
};
