// @flow

// The following causes an RTypeAlias to annotate a TypeDestructorTriggerT. It
// is wrong to use that name to reconstruct an alias because the TypeDestructorTriggerT
// might hide a type-app within. Instead the TypeDestructorTriggerT should have
// actually triggered the construction of another type that we'll end up normalizing
// as well.

import keyMirrorRecursive from './keyMirrorRecursive';
import typeof KeyMirrorRecursive from './keyMirrorRecursive';
const keyMirrorRecursiveObj = keyMirrorRecursive({ A: '' });

module.exports = keyMirrorRecursiveObj;
