function printDocToString(doc, options) {
  if (!doc) return '';
  const formatted = handleDoc(doc, options);
  return formatted;
}
