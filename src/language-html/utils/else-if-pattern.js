/**
 * Pattern used to identify an `else if` block.
 *
 * https://github.com/angular/angular/blob/327896606832bf6fbfc8f23989755123028136a8/packages/compiler/src/render3/r3_control_flow.ts#L26
 *
 **/
export const ELSE_IF_PATTERN = /^else[^\S\n\r]+if/;
