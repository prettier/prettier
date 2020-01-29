// @flow

declare var mixed: mixed;
declare var any: any;
declare var myObject: Object;
declare var myFunction: Function;

declare var inexactObject: { x: string };
declare var exactObject: {| x: string |};

declare var unionOfObjects: { x: string } | { y: string };
declare var intersectionOfObjects: { x: string } & { y: string };

class myClass {}
declare var instance: myClass;

// We disallow accessing properties on mixed
if (mixed.thisPropDoesNotExist) {} // Error
// But we allow accessing properties on truthy or non-maybe mixed
if (mixed && mixed.thisPropDoesNotExist) {} // No error
if (mixed != null && mixed.thisPropDoesNotExist) {} // No error

// We allow accessing properties on the any types
if (any.thisPropDoesNotExist) {} // No error
if (myObject.thisPropDoesNotExist) {} // No error
if (myFunction.thisPropDoesNotExist) {} // No error

// We disallow testing unknown properties on inexact objects
if (inexactObject.thisPropDoesNotExist) {} // Error

// We disallow testing unknown properties on exact objects
if (exactObject.thisPropDoesNotExist) {} // Error

// We disallow testing unknown properties on unions
if (unionOfObjects.thisPropDoesNotExist) {} // Error
// But we allow testing properties which appear on at least one branch
if (unionOfObjects.y) {} // No error

// We disallow testing unknown properties on intersections
if (intersectionOfObjects.thisPropDoesNotExist) {} // Error
// But we allow testing properties which appear on at least one branch
if (intersectionOfObjects.y) {} // No error

// We disallow accessing unknown properties on class statics
if (myClass.thisPropDoesNotExist) {} // Error
// and on class instances
if (instance.thisPropDoesNotExist) {} // Error
