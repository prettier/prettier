/**
 * @format
 * @flow
 */

import * as React from 'react';
import Profile from './Profile';

import type {Profile_user, Profile_userRef} from './Profile.graphql';

declare var user: Profile_user;
declare var userRef: Profile_userRef;

<Profile user={userRef} foo={42} />; // OK
<Profile user={userRef} />; // Error: Missing foo
<Profile foo={42} />; // Error: Missing user
<Profile user={userRef} foo="bar" />; // Error: string ~> number
<Profile />; // Error: Missing user and foo
<Profile user={user} foo={42} />; // Error: You must pass in a ref
<Profile user={user} foo="bar" />; // Error: You must pass in a ref and string ~> number
<Profile user={(null: mixed)} foo={(null: mixed)} />; // Error: mixed ~> ref and mixed ~> number
