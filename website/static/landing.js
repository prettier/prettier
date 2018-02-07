"use strict";

/* eslint-disable */

if (location.hash.substring(1).startsWith(encodeURIComponent("{"))) {
  location.pathname = "/playground/";
}

window.addEventListener("load", function() {
  // We don't have access to a unique body css attribute for just the homepage
  // so instead it is set on load. It's only really visible on a vertical overscroll
  document.body.style.backgroundColor = "rgb(24, 32, 37)";

  var logoWrapper = document.querySelector(".animatedLogoWrapper");
  var logo = document.querySelector(".prettier-logo-wide");
  var lastDash = logo.querySelector("g:last-of-type path:last-of-type");

  function handleLogoDrag(event) {
    logo.classList.add("rolling");
    event.preventDefault();
  }

  logoWrapper.setAttribute("draggable", "true");
  logoWrapper.addEventListener("touchstart", handleLogoDrag);
  logoWrapper.addEventListener("dragstart", handleLogoDrag);

  lastDash.addEventListener("animationend", function(event) {
    if (event.animationName.match(/roll/)) {
      logo.classList.remove("rolling");
    }
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
