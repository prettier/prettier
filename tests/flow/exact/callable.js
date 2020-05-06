/* The exactness constraint describes the shape of an object. When it comes to
 * operations like object spread, Object.values, hasOwnProperty, etc., the
 * callable signature is distinct from the shape of the named properties.
 *
 * However, Flow does not allow callable signatures to be elided. This behavior
 * is partly historical; call signatures used to be stored in the prop map, and
 * participated in the exactness check "by accident."
 *
 * On the other hand, it is potentially useful to know that an exact object
 * without a call signature is in fact not callable, and thus not a function.
 * Consider a refinement of the form `typeof o === "function"`. If `o` were an
 * exact object without a call property, we can know for certain that it is not
 * a function.
 */

declare var f: {| (): void, x: string |};
var g: {| x: string |} = f; // error: callable signature in f missing in g
