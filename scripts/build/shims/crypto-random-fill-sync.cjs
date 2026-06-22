"use strict";

// eslint-disable-next-line no-redeclare
const { crypto } = globalThis;

if (crypto && typeof crypto.getRandomValues === "function") {
  module.exports = {
    randomFillSync(view) {
      crypto.getRandomValues(view);
      return view;
    },
  };
}

let state = 0x9e3779b9;
module.exports = {
  randomFillSync(view) {
    for (let index = 0; index < view.length; index++) {
      state = Math.imul(state ^ (state >>> 15), state | 1);
      state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
      view[index] = (state ^ (state >>> 14)) & 255;
    }
    return view;
  },
};
