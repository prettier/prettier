"use strict";

/* eslint-env browser */

if (location.hash.substring(1).startsWith(encodeURIComponent("{"))) {
  location.pathname = "/playground/";
}
