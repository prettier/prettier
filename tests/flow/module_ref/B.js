/*
 * @providesModule B
 * @flow
 */

declare function ifRequired<TModule, TYes>(
  id: $Flow$ModuleRef<TModule>,
  cbYes: (module: TModule) => TYes,
): TYes | void;

ifRequired('A', A => A.FOO); // Error - A is a plain string, not a module ref
ifRequired('m#A', A => A.FOO); // Error - FOO is not present in A's exports
ifRequired('m#A', A => A.BAR); // Ok
