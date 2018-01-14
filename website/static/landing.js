"use strict";

/* eslint-disable */

if (location.hash.substring(1).startsWith(encodeURIComponent("{"))) {
  location.pathname = "/playground/";
}

// eslint-disable-next-line
window.addEventListener("load", function() {
  var logo = document.querySelector(".animatedLogo");

  logo.classList.remove("initial");

  logo.addEventListener("click", function(event) {
    logo.classList.toggle("initial");
    event.preventDefault();
  });

  var yarnButton = document.querySelector(".showYarnButton");
  var npmButton = document.querySelector(".showNpmButton");
  var getStartedSection = document.querySelector(".getStartedSection");

  npmButton.addEventListener("click", function(event) {
    event.preventDefault();
    npmButton.classList.add("active");
    yarnButton.classList.remove("active");
    getStartedSection.classList.add("getStartedSection--npm");
  });
  yarnButton.addEventListener("click", function(event) {
    event.preventDefault();
    yarnButton.classList.add("active");
    npmButton.classList.remove("active");
    getStartedSection.classList.remove("getStartedSection--npm");
  });
});
