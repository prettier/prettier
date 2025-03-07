function printNumber(rawNumber) {
  if (rawNumber.length === 1) {
    return rawNumber;
  }
  return (
    rawNumber
      .toLowerCase()
      // Remove unnecessary plus and zeroes from scientific notation.
      .replace(/^([+-]?[\d.]+e)(?:\+|(-))?0*(?=\d)/u, "$1$2")
      // Remove unnecessary scientific notation (1e0).
      .replace(/^([+-]?[\d.]+)e[+-]?0+$/u, "$1")
      // Make sure numbers always start with a digit.
      .replace(/^([+-])?\./u, "$10.")
      // Remove extraneous trailing decimal zeroes.
      .replace(/(\.\d+?)0+(?=e|$)/u, "$1")
      // Remove trailing dot.
      .replace(/\.(?=e|$)/u, "")
  );
}

export default printNumber;
