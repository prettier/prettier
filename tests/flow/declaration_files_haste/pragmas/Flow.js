/**
 * @providesModule Flow
 * @flow
 *
 * Tests that a .js.flow file with the flow pragma is a Flow file, when the
 * underlying .js file has one too. That is, the .js.flow file's pragma, or
 * lack thereof, wins.
 */

export const x: number = 123;

