const BOM = "\uFEFF";

/** @type {(string: string) => boolean} */
const hasBom = (string) => string.charAt(0) === BOM;

/** @type {(string: string) => string} */
const stripBom = (string) => (hasBom(string) ? string.slice(1) : string);

/** @type {(string: string) => string} */
const addBom = (string) => BOM + string;

export { addBom, hasBom, stripBom };
