/**
 * @format
 * @flow
 */

declare var any: any;
declare opaque type T;

((any: {p: T}): {p: T}); // Ok
((any: {p: T}): {+p: T}); // Ok
((any: {p: T}): {-p: T}); // Ok
((any: {+p: T}): {p: T}); // Error: read-only ~> writable
((any: {+p: T}): {+p: T}); // Ok
((any: {+p: T}): {-p: T}); // Error: read-only ~> write-only
((any: {-p: T}): {p: T}); // Error: write-only ~> readable
((any: {-p: T}): {+p: T}); // Error: write-only ~> read-only
((any: {-p: T}): {-p: T}); // Ok
