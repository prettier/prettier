// Test ambient variable declarations in declare module within flow-typed
declare module 'test-module' {
  // Implicit ambient const/let/var (without 'declare' keyword)
  const foo: string;
  let bar: number;
  var baz: boolean;

  // These can be used in type expressions within the module
  declare export function getFoo(): typeof foo;
  declare export function getBar(): typeof bar;
  declare export function getBaz(): typeof baz;
}
