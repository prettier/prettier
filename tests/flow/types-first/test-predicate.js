// @flow

import {
  isStringNullOrEmpty,
  declaredIsStringNullOrEmpty
} from "./exports-predicate";

declare var s: null | string;

if (!isStringNullOrEmpty(s)) {
  (s: string);
}

if (!declaredIsStringNullOrEmpty(s)) {
  (s: string);
}
