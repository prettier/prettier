/**
 * @typedef {import("@babel/types").Node} Node
 * @typedef {{
 *   shouldSkip: (text: string): boolean,
 *   test(node: Node): boolean,
 *   transform(node: Node): Node,
 *   inject: string
 * }} Transform
 * Please check https://github.com/prettier/prettier/pull/13815 for transformer implementation example.
 */

/**
 * @type {Array<Transform>}
 */
const transforms = [];

export default transforms;
