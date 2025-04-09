function locStart(node) {
  return node.loc.start.offset;
}

function locEnd(node) {
  return node.loc.end.offset;
}

export { locEnd, locStart };
