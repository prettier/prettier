/**
 * @format
 * @flow
 */

import * as React from 'react';

/**
 * All Relay fragment types must be compatible with FragmentData. FragmentData
 * has a private $$typeof property using the opaque type $$TypeofFragment. It is
 * important that all fragment data types are compatible with FragmentData for
 * GetPropFragmentRef.
 *
 * Consider the implementation of the branching logic for GetPropFragmentRef:
 *
 *     function getPropFragmentRef(fragmentOrValue) {
 *       if (isFragment(fragmentOrValue)) {
 *         // fragmentOrValue is a fragment...
 *       } else {
 *         // fragmentOrValue is a value...
 *       }
 *     }
 *
 * What is the implementation of isFragment() such that we include all Relay
 * fragments, but exclude any other JavaScript value? Because all Relay
 * fragments are compatible with FragmentData the implementation of isFragment()
 * could be:
 *
 *   function isFragment(fragmentOrValue) {
 *     return fragmentOrValue.$$typeof === $$TypeofFragment;
 *   }
 *
 * This is why all Relay fragment types must be compatible with FragmentData. We
 * need a way to distinguish Relay fragments from any other value for
 * the GetPropFragmentRef function.
 */
declare export opaque type $$TypeofFragment;
type FragmentData = {+$$typeof: $$TypeofFragment};

export type Fragment<Ref, +Data: FragmentData> = Data;

type GetPropFragmentRef = (<T>(Fragment<T, FragmentData>) => T) & (<T>(T) => T);

export function createFragmentContainer<Props>(
  Component: React.ComponentType<Props>,
): React.ComponentType<$ObjMap<Props, GetPropFragmentRef>> {
  return (null: any);
}
