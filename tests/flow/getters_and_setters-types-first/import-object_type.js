/**
 * @flow
 */

import type {T} from './object_type';
var z: number = 123;

function test(obj: T) {
  // Test getting properties with getters
  var testGetterNoError2: number = obj.goodGetterWithAnnotation;

  var testGetterWithError2: string = obj.goodGetterWithAnnotation; // Error number ~> string

  // Test setting properties with getters
  obj.goodSetterWithAnnotation = 123;

  obj.goodSetterWithAnnotation = "hello"; // Error string ~> number

  var testSubtypingGetterAndSetter: number = obj.propWithSubtypingGetterAndSetter; // Error ?number ~> number

  // When building this feature, it was tempting to flow the setter into the
  // getter and then use either the getter or setter as the type of the
  // property. This example shows the danger of using the getter's type
  obj.exampleOfOrderOfGetterAndSetter = new C(); // Error C ~> B

  // And this example shows the danger of using the setter's type.
  var testExampleOrOrderOfGetterAndSetterReordered: number =
    obj.exampleOfOrderOfGetterAndSetterReordered; // Error A ~> B
}
