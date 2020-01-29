/**
 * @format
 * @flow
 */

import * as React from 'react';
import {createFragmentContainer} from './Relay';

import type {ProfilePic_image} from './ProfilePic.graphql';

type Props = {
  image: ProfilePic_image,
};

class ProfilePic extends React.Component<Props> {
  render() {
    (this.props.image.url: empty); // Error: string ~> empty
    return <img src={this.props.image.url} />;
  }
}

export default createFragmentContainer(ProfilePic);
