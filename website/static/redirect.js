"use strict";

/* eslint-env browser */

(function() {
  if (location.hash.substring(1).startsWith(encodeURIComponent("{"))) {
    location.pathname = "/prettier/playground/";
  }
});
