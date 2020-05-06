// @flow
export type T1 = -1;
export type T2 = false;
export type T3 = 1;
export type T4 = true;

module.exports = {
  P1: -1,
  P2: !true,
  P3: -(-1),
  P4: !!1,
};
