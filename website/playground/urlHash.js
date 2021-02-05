import LZString from "lz-string";

export function read() {
  const hash = document.location.hash.slice(1);
  if (!hash) {
    return {};
  }

  // backwards support for old json encoded URIComponent
  const decode = hash.includes("%7B%22")
    ? decodeURIComponent
    : LZString.decompressFromEncodedURIComponent;

  try {
    return JSON.parse(decode(hash));
  } catch {
    return {};
  }
}

export function replace(state) {
  const hash = LZString.compressToEncodedURIComponent(JSON.stringify(state));
  if (
    typeof URL === "function" &&
    typeof history === "object" &&
    typeof history.replaceState === "function"
  ) {
    const url = new URL(location);
    url.hash = hash;
    history.replaceState(null, null, url);
  } else {
    location.hash = hash;
  }
}
