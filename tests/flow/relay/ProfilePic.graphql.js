/**
 * @format
 * @flow
 */

import * as Relay from './Relay';

declare export opaque type ProfilePic_imageRef;

export type ProfilePic_image = Relay.Fragment<
  ProfilePic_imageRef,
  {|
    +$$typeof: Relay.$$TypeofFragment,
    +url: string,
  |},
>;
