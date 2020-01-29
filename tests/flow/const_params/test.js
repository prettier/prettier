/**
 * test handling of const params
 * - reassignment prohibited
 * - durable refinements
 *
 * Currently gated in .flowconfig:
 *
 * [options]
 * experimental.const_params
 *
 * Syntax to follow
 *
 * @flow
 */

function cannot_reassign(x: string) {
  x = "hey"; // error, const param cannot be reassigned
}

// Note: const params use the same machinery as explicit
// const bindings, which are tested more extensively elsewhere.
// Here we're just making sure the machinery is hooked up.
//
function durable_refi(x: ?number) {
  if (x) {
    // ok: if x is truthy here, it's truthy everywhere
    return () => { var y:number = x; };
  }
}

function const_rest_reassign(...x) {
  x = 0; // error, const param cannot be reeassigned
}

function const_obj_patt_reassign({x, ...o}) {
  x = 0; // error, const param cannot be reeassigned
  o = 0; // error, const param cannot be reeassigned
}

function const_arr_patt_reassign([x, ...a]) {
  x = 0; // error, const param cannot be reeassigned
  a = 0; // error, const param cannot be reeassigned
}
