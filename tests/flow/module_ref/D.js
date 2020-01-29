/**
 * @flow
 */

declare function myRequire<TModule>(
  id: $Flow$ModuleRef<TModule>,
): TModule;

const C = myRequire(
  'm#C',
);
