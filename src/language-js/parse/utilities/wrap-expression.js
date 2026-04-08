/**
@import {Comment, Node} from "../../types/estree.js"
*/

/**
 * @param {{
 *   text: string,
 *   expression?: Node,
 *   type?: string,
 *   rootMarker?: string,
 *   comments?: Comment[],
 * }} options
 */
function wrapExpression(options) {
  const {
    type = "JsExpressionRoot",
    expression,
    comments = expression?.comments ?? [],
    text,
    rootMarker,
  } = options;

  const root = {
    type,
    comments,
    range: [0, text.length],
    rootMarker,
  };

  if (expression) {
    delete expression.comments;
    root.node = expression;
  }

  return root;
}

export default wrapExpression;
