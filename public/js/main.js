const backdrop = document.querySelector(".backdrop");
const sideDrawer = document.querySelector(".mobile-nav");
const menuToggle = document.querySelector("#side-menu-toggle");

const btnAdd = document.querySelector(".btn-add");

function backdropClickHandler() {
  backdrop.style.display = "none";
  sideDrawer.classList.remove("open");
}

function menuToggleClickHandler() {
  backdrop.style.display = "block";
  sideDrawer.classList.add("open");
}

function addInput() {
  const input = document.createElement("input");
  input.setAttribute("type", "date");
  input.setAttribute("name", "dateLeave");
  document.getElementById("input").appendChild(input);
}

if (backdrop) {
  backdrop.addEventListener("click", backdropClickHandler);
}

if (menuToggle) {
  menuToggle.addEventListener("click", menuToggleClickHandler);
}

if (btnAdd) {
  btnAdd.addEventListener("click", addInput);
}
