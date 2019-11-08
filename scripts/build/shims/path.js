export function extname(path) {
  const dotIndex = path.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return path.slice(dotIndex);
}
