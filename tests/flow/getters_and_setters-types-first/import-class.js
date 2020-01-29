// @flow

import {Foo} from './class';

var foo = new Foo();

// Test getting properties with getters
var testGetterNoError1: number = foo.goodGetterNoAnnotation;
var testGetterNoError2: number = foo.goodGetterWithAnnotation;

var testGetterWithError1: string = foo.goodGetterNoAnnotation; // Error number ~> string
var testGetterWithError2: string = foo.goodGetterWithAnnotation; // Error number ~> string

// Test setting properties with getters
foo.goodSetterNoAnnotation = 123;
foo.goodSetterWithAnnotation = 123;

// TODO: Why does no annotation mean no error?
foo.goodSetterNoAnnotation = "hello"; // Error string ~> number
foo.goodSetterWithAnnotation = "hello"; // Error string ~> number

var testSubtypingGetterAndSetter: number = foo.propWithSubtypingGetterAndSetter; // Error ?number ~> number
