/***
 * exact object types prohibit extra properties, but
 * allow per-property subtyping in the usual cases
 */

export type Flag = $Exact<{
  name: string,
  description: string,
  aliases?: Array<string>,
}>;

// fresh values have per-property subtyping
function getFlag_ok(): Flag {
  return {
    name: "help",
    description: "Shows this usage message",
    aliases: ["h"],   // prop subtyping is ok on fresh object values
  };
}
