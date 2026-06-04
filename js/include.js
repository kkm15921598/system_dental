/* Loads shared partials (header/footer) and wires up navigation. */
async function loadPartials() {
  const slots = [...document.querySelectorAll("[data-include]")];

  await Promise.all(
    slots.map(async (slot) => {
      try {
        const res = await fetch(slot.dataset.include);
        slot.outerHTML = await res.text();
      } catch (err) {
        console.error("Partial load failed:", slot.dataset.include, err);
      }
    })
  );

  initNav();
}

function initNav() {
  // Highlight the current page in the menu.
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".gnb a").forEach((a) => {
    if (a.getAttribute("href") === page) {
      a.setAttribute("aria-current", "page");
    }
  });

  // Hamburger drawer.
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".gnb");
  const navBackdrop = document.querySelector(".nav-backdrop");
  if (!navToggle || !navMenu) return;

  const setMenu = (open) => {
    navToggle.classList.toggle("is-open", open);
    navMenu.classList.toggle("is-open", open);
    navBackdrop?.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  };
  const closeMenu = () => setMenu(false);

  navToggle.addEventListener("click", () => {
    setMenu(!navMenu.classList.contains("is-open"));
  });

  navBackdrop?.addEventListener("click", closeMenu);

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // 서랍 메뉴 아코디언: 화살표 누르면 하위 탭 메뉴 펼침/접힘 (한 번에 하나만)
  navMenu.querySelectorAll(".gnb-sub-toggle").forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const item = toggle.closest(".gnb-item");
      const willOpen = !item.classList.contains("is-open");
      navMenu.querySelectorAll(".gnb-item.is-open").forEach((openItem) => {
        openItem.classList.remove("is-open");
        openItem.querySelector(".gnb-sub-toggle")?.setAttribute("aria-expanded", "false");
      });
      item.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && navMenu.classList.contains("is-open")) {
      closeMenu();
    }
  });
}

document.addEventListener("DOMContentLoaded", loadPartials);
