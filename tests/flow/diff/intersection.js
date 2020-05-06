declare var any: any;

class A {}
class B {}
class C {}

((any: {a: A} & {b: B}): $Diff<{a: A, b: B}, {b: B}>); // OK
((any: {a: A} & {c: C}): $Diff<{a: A, b: B}, {b: B}>); // OK
((any: {c: C} & {b: B}): $Diff<{a: A, b: B}, {b: B}>); // Error
((any: {a: A, b: B}): $Diff<{a: A} & {b: B}, {b: B}>); // OK
((any: {a: A}): $Diff<{a: A} & {b: B}, {b: B}>); // OK
((any: {b: B}): $Diff<{a: A} & {b: B}, {b: B}>); // Error
((any: {a: A}): $Diff<{a: A, b: B, c: C}, {b: B} & {c: C}>); // OK
((any: {b: B}): $Diff<{a: A, b: B, c: C}, {b: B} & {c: C}>); // Error
