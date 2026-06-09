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

  const closeSubmenus = () => {
    navMenu.querySelectorAll(".gnb-item.is-open").forEach((item) => {
      item.classList.remove("is-open");
      item.querySelector(".gnb-subtoggle")?.setAttribute("aria-expanded", "false");
    });
  };

  const closeDesktopHover = () => {
    navMenu.querySelectorAll(".gnb-item.is-hover").forEach((item) => {
      item.classList.remove("is-hover");
    });
  };

  const openDesktopHover = (item) => {
    if (window.innerWidth <= 980 || !item) return;
    navMenu.querySelectorAll(".gnb-item.is-hover").forEach((openItem) => {
      if (openItem !== item) openItem.classList.remove("is-hover");
    });
    item.classList.add("is-hover");
  };

  navMenu.addEventListener("mouseover", (event) => {
    const item = event.target.closest(".gnb-item");
    if (!item || !navMenu.contains(item)) return;
    openDesktopHover(item);
  });

  navMenu.addEventListener("mouseleave", () => {
    if (window.innerWidth > 980) closeDesktopHover();
  });

  navMenu.querySelectorAll(".gnb-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (window.innerWidth <= 980) return;
      const item = link.closest(".gnb-item");
      if (!item || !item.querySelector(".gnb-submenu")) return;

      if (!item.classList.contains("is-hover")) {
        event.preventDefault();
        openDesktopHover(item);
      }
    });
  });
  navMenu.querySelectorAll(".gnb-subtoggle").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".gnb-item");
      if (!item) return;
      const willOpen = !item.classList.contains("is-open");

      closeSubmenus();
      closeDesktopHover();
      item.classList.toggle("is-open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    });
  });

  const currentItem = navMenu.querySelector(".gnb-link[aria-current='page']")?.closest(".gnb-item");
  if (currentItem && window.innerWidth <= 980) {
    currentItem.classList.add("is-open");
    currentItem.querySelector(".gnb-subtoggle")?.setAttribute("aria-expanded", "true");
  }

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      closeSubmenus();
      closeDesktopHover();
      if (navMenu.classList.contains("is-open")) {
        closeMenu();
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", loadPartials);








