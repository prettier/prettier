"use strict";

if (location.hash.slice(1).startsWith(encodeURIComponent("{"))) {
  location.pathname = "/playground/";
}

window.addEventListener("load", () => {
  // We don't have access to a unique body css attribute for just the homepage
  // so instead it is set on load. It's only really visible on a vertical overscroll
  document.body.style.backgroundColor = "rgb(24, 32, 37)";

  const logoWrapper = document.querySelector(".animatedLogoWrapper");
  const logo = document.querySelector(".prettier-logo-wide");
  const lastDash = logo.querySelector("g:last-of-type path:last-of-type");

  function handleLogoDrag(event) {
    logo.classList.add("rolling");
    event.preventDefault();
  }

  logoWrapper.setAttribute("draggable", "true");
  logoWrapper.addEventListener("touchstart", handleLogoDrag);
  logoWrapper.addEventListener("dragstart", handleLogoDrag);

  lastDash.addEventListener("animationend", (event) => {
    if (/roll/.test(event.animationName)) {
      logo.classList.remove("rolling");
    }
  });
});
