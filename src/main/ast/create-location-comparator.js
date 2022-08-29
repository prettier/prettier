function createLocationComparator(locStart, locEnd) {
  // Sort by `start` location first, then `end` location
  return (nodeA, nodeB) =>
    locStart(nodeA) - locStart(nodeB) || locEnd(nodeA) - locEnd(nodeB);
}

export default createLocationComparator;
