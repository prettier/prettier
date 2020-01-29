//@flow

declare class Super<T> {}
declare module lib {
  declare export var Super: typeof Super;
}
