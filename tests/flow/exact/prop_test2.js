/***
 * more prop tests on unions of objects,
 * using {| ... |} annotation syntax
 */

type Flag = {|
  type: "string",
  name: string,
  description: string,
  argName: string,
  aliases?: Array<string>,
  default?: string,
|} | {|
  type: "boolean",
  name: string,
  description: string,
  aliases?: Array<string>,
|} | {|
  type: "enum",
  name: string,
  description: string,
  argName: string,
  validValues: Array<string>,
  aliases?: Array<string>,
  default?: string,
|};

function checkFlag_ok(flag: Flag): string {
  if (flag.default) {
    return flag.argName; // ok, refined to $Exact<StringFlag> | $Exact<EnumFlag>
  }
  return "";
}
