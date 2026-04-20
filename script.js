const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");

// Toggle menu + icon
menuBtn.addEventListener("click", () => {
  nav.classList.toggle("active");

  if (nav.classList.contains("active")) {
    menuBtn.textContent = "✖";
  } else {
    menuBtn.textContent = "☰";
  }
});

// Close menu when clicking a link
const navLinks = document.querySelectorAll(".nav a");

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("active");
    menuBtn.textContent = "☰"; // reset icon
  });
});