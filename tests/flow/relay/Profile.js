/**
 * @format
 * @flow
 */

import * as React from 'react';
import {type Fragment, createFragmentContainer} from './Relay';
import ProfilePic from './ProfilePic';

import type {Profile_user} from './Profile.graphql';

type Props = {
  user: Profile_user,
  foo: number,
};

class Profile extends React.Component<Props> {
  render() {
    (this.props.foo: empty); // Error: number ~> empty
    (this.props.user.id: empty); // Error: string ~> empty
    (this.props.user.name: empty); // Error: string ~> empty
    (this.props.user.pic.id: empty); // Error: string ~> empty
    <ProfilePic image={{url: 'https://facebook.com'}} />; // Error: object ~> opaque type
    return (
      <div>
        <p>{this.props.user.name}</p>
        <p>{this.props.foo}</p>
        <p>{this.props.user.pic.id}</p>
        <ProfilePic image={this.props.user.pic} />
      </div>
    );
  }
}

export default createFragmentContainer(Profile);
