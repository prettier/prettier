"use strict";

/* eslint-env browser */

if (location.hash.substring(1).startsWith(encodeURIComponent("{"))) {
  location.pathname = "/playground/";
}

// eslint-disable-next-line
window.addEventListener("load", function() {
  document.querySelector(".animatedLogo").classList.remove("initial");
});
