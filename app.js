// ===== TEST NAVIGATION SEULE =====
document.addEventListener("DOMContentLoaded", () => {
  console.log("JS chargé");

  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".section");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      console.log("Click sur", item.dataset.section);

      navItems.forEach(n => n.classList.remove("active"));
      sections.forEach(s => s.classList.remove("active"));

      item.classList.add("active");
      const section = document.getElementById(item.dataset.section);

      if (section) {
        section.classList.add("active");
      }
    });
  });
});
