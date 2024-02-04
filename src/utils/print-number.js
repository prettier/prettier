function printNumber(rawNumber) {
  if (rawNumber.length === 1) {
    const code = rawNumber.charCodeAt(0);
    if (code >= /* "1" */ 48 && code <= /* "9" */ 57) {
      return rawNumber;
    }
  }
  return (
    rawNumber
      .toLowerCase()
      // Remove unnecessary plus and zeroes from scientific notation.
      .replace(/^([+-]?[\d.]+e)(?:\+|(-))?0*(?=\d)/, "$1$2")
      // Remove unnecessary scientific notation (1e0).
      .replace(/^([+-]?[\d.]+)e[+-]?0+$/, "$1")
      // Make sure numbers always start with a digit.
      .replace(/^([+-])?\./, "$10.")
      // Remove extraneous trailing decimal zeroes.
      .replace(/(\.\d+?)0+(?=e|$)/, "$1")
      // Remove trailing dot.
      .replace(/\.(?=e|$)/, "")
  );
}

export default printNumber;
