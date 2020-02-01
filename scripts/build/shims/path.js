const sep = /[\\/]/;

export function extname(path) {
  path = path.split(sep).pop();
  const dotIndex = path.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return path.slice(dotIndex);
}

export function basename(path) {
  return path.split(sep).pop();
}

export function isAbsolute() {
  return true;
}
