"use strict";

/* eslint-disable */

if (location.hash.substring(1).startsWith(encodeURIComponent("{"))) {
  location.pathname = "/playground/";
}

window.addEventListener("load", function() {
  var logo = document.querySelector(".animatedLogo");
  var logoWrapper = document.querySelector(".animatedLogoWrapper");

  logo.classList.remove("initial");

  function handleLogoDrag(event) {
    logo.classList.toggle("initial");
    event.preventDefault();
  }

  logoWrapper.setAttribute("draggable", "true");
  logoWrapper.addEventListener("touchstart", handleLogoDrag);
  logoWrapper.addEventListener("dragstart", handleLogoDrag);

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
