// @flow

declare module a {
  declare export class A {}
}

declare var m: $Exports<'a'>;
export var m = m;
