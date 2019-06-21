var example = document.querySelector(".example");
var buttonBefore = document.querySelector(".controls__button--before");
var buttonAfter = document.querySelector(".controls__button--after");

buttonBefore.addEventListener("click", function () {
  if (example.classList.contains("example--after")) {
    example.classList.remove("example--after");
    example.classList.add("example--before");
  }
});

buttonAfter.addEventListener("click", function () {
  if (example.classList.contains("example--before")) {
    example.classList.remove("example--before");
    example.classList.add("example--after");
  }
})
