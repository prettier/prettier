/**
 * @flow
 */

import {Foo} from './declare_class';

var foo = new Foo();

// Test getting properties with getters
var testGetterNoError2: number = foo.goodGetterWithAnnotation;

var testGetterWithError2: string = foo.goodGetterWithAnnotation; // Error number ~> string

// Test setting properties with getters
foo.goodSetterWithAnnotation = 123;

foo.goodSetterWithAnnotation = "hello"; // Error string ~> number

var testSubtypingGetterAndSetter: number = foo.propWithSubtypingGetterAndSetter; // Error ?number ~> number

var testPropOverridenWithGetter: number = foo.propOverriddenWithGetter; // Error string ~> number
foo.propOverriddenWithSetter = 123; // Error number ~> string
