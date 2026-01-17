if (true) {
  if (condition) {
    const secondType1 = sourceCode.getNodeByRangeIndex1234(second.range[0])!
      .type;
    const secondType2 = (sourceCode?.getNodeByRangeIndex1234(second.range[0]))
      .type;
    const secondType3 = (sourceCode?.getNodeByRangeIndex1234(second.range[0])!)
      .type;
    // TODO[@fisker]: Fix
    // const secondType4 = (sourceCode?.getNodeByRangeIndex1234(second.range[0])!)!
    //   .type;
    const secondType5 = sourceCode.getNodeByRangeIndex1234(second.range[0])!!
      .type;
  }
}
