declare var any: any;

class A {}
class B {}

((any: {a: A, b: B}): $Diff<{a: A, b: B}, {b: B}>); // OK
((any: {a: A}): $Diff<{a: A, b: B}, {b: B}>); // OK
((any: {b: B}): $Diff<{a: A, b: B}, {b: B}>); // Error
((any: {a: A, b: void}): $Diff<{a: A, b: B}, {b: B}>); // OK
((any: {a: void, b: B}): $Diff<{a: A, b: B}, {b: B}>); // Error
