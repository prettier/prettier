function locStart(node) {
  return node.loc?.start?.offset ?? 0;
}

function locEnd(node) {
  return node.loc?.end?.offset ?? 0;
}

export { locEnd, locStart };
