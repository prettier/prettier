/**
 * @format
 * @flow
 */

import * as Relay from './Relay';
import type {ProfilePic_imageRef} from './ProfilePic.graphql';

declare export opaque type Profile_userRef;

export type Profile_user = Relay.Fragment<
  Profile_userRef,
  {|
    +$$typeof: Relay.$$TypeofFragment,
    +id: string,
    +name: string,
    +pic: ProfilePic_imageRef & {|
      +id: string,
    |},
  |},
>;
