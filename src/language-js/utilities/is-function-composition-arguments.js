import { getCallArguments } from "./call-arguments.js";
import { isCallExpression, isFunctionOrArrowExpression } from "./node-types.js";
import { stripChainElementWrappers } from "./strip-chain-element-wrappers.js";

// Logic to check for args with multiple anonymous functions. For instance,
// the following call should be split on multiple lines for readability:
// source.pipe(map((x) => x + x), filter((x) => x % 2 === 0))
function isFunctionCompositionArguments(args) {
  if (args.length <= 1) {
    return false;
  }
  let count = 0;
  for (let arg of args) {
    if (isFunctionOrArrowExpression(arg)) {
      count += 1;
      if (count > 1) {
        return true;
      }
    } else {
      arg = stripChainElementWrappers(arg);
      if (isCallExpression(arg)) {
        for (const childArg of getCallArguments(arg)) {
          if (isFunctionOrArrowExpression(childArg)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export { isFunctionCompositionArguments };
