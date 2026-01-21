import { printAssignment } from "./assignment.js";
import { printPropertyKey } from "./property-key.js";

/*
- `Property`
- `ObjectProperty`
- `ImportAttribute`
*/
function printProperty(path, options, print) {
  const { node } = path;
  if (node.shorthand) {
    return print("value");
  }

  return printAssignment(
    path,
    options,
    print,
    printPropertyKey(path, options, print),
    ":",
    "value",
  );
}

export { printProperty, printPropertyKey };
