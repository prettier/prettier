// @flow

const a = { x: 0 };
const b = { z: 0, ...a };
(b.x: string);
(b.z: string);

type A = {| x: number |}
export type B = {| z: number, ...A |}
module.exports = b;
