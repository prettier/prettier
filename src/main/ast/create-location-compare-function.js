function createLocationCompareFunction( options) {
  const {locStart, locEnd} = options;

  // Sort by `start` location first, then `end` location
  return (
    (nodeA, nodeB) =>
      locStart(nodeA) - locStart(nodeB) || locEnd(nodeA) - locEnd(nodeB)
  );
}

export default createLocationCompareFunction
