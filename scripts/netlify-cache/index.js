"use strict";

// const CACHE_DIR = "./.cache";

module.exports = {
  onPreBuild: () => {
    console.log("Hello world from onPreBuild event!");
  },
  onBuild: () => {
    console.log("Hello world from onBuild  event!");
  },
  onPostBuild: () => {
    console.log("Hello world from onPostBuild  event!");
  },
  onSuccess: () => {
    console.log("Hello world from onSuccess  event!");
  },
  onError: () => {
    console.log("Hello world from onError   event!");
  },
  onEnd: () => {
    console.log("Hello world from onEnd   event!");
  },
};

// module.exports = {
//   async onPreBuild({ utils }) {
//     console.log(`Restoring cache ${CACHE_DIR}`);
//     await utils.cache.restore(CACHE_DIR);
//     console.log(`Cache restored ${CACHE_DIR}`);
//   },
//   async onPostBuild({ utils }) {
//     console.log(`Saving  Cache ${CACHE_DIR}`);
//     await utils.cache.save(CACHE_DIR);
//     console.log(`Cache Saved  ${CACHE_DIR}`);
//   },
// };
