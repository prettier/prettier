// lwc: html`<my-element data-for={value}></my-element>`
function isLwcInterpolation({ node }, options) {
  return (
    options.parser === "lwc" &&
    node.value.startsWith("{") &&
    node.value.endsWith("}")
  );
}

function printLwcInterpolation({ node }) {
  return [node.rawName, "=", node.value];
}

export { isLwcInterpolation, printLwcInterpolation };
