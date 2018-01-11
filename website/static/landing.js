"use strict";

/* eslint-disable */

if (location.hash.substring(1).startsWith(encodeURIComponent("{"))) {
  location.pathname = "/playground/";
}

// eslint-disable-next-line
window.addEventListener("load", function() {
  var logo = document.querySelector(".animatedLogo");

  logo.classList.remove("initial");

  logo.addEventListener("click", function() {
    logo.classList.toggle("initial");
  });
});
