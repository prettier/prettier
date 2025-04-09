function locStart(node) {
  return node.position.start.offset;
}

function locEnd(node) {
  return node.position.end.offset;
}

export { locEnd, locStart };
