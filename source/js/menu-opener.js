var siteNav = document.querySelector(".site-nav");
var siteNavToggle = document.querySelector(".site-nav__toggle");

siteNav.classList.remove("no-js");

siteNavToggle.addEventListener("click", function () {
  if (siteNav.classList.contains("site-nav--closed")) {
    siteNav.classList.remove("site-nav--closed");
    siteNav.classList.add("site-nav--opened");
  } else {
    siteNav.classList.remove("site-nav--opened");
    siteNav.classList.add("site-nav--closed");
  }
});
