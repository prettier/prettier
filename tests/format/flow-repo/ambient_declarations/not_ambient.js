// @flow
// Test that uninitialized const/var/let is NOT allowed in regular .js files

const x: string; // Error - const must be initialized
let y: number; // OK - let can be uninitialized
var z: boolean; // OK - var can be uninitialized
