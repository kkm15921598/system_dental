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

  const resetDesktopDropdown = (item) => {
    const submenu = item.querySelector(".gnb-submenu");
    item.classList.remove("is-hover");
    if (!submenu) return;
    submenu.style.opacity = "";
    submenu.style.visibility = "";
    submenu.style.transform = "";
    submenu.style.pointerEvents = "";
  };

  const closeDesktopDropdowns = (exceptItem) => {
    navMenu.querySelectorAll(".gnb-item").forEach((item) => {
      if (item !== exceptItem) resetDesktopDropdown(item);
    });
  };

  const openDesktopDropdown = (item) => {
    if (window.innerWidth <= 980) return;
    const submenu = item.querySelector(".gnb-submenu");
    if (!submenu) return;

    closeDesktopDropdowns(item);
    item.classList.add("is-hover");
    submenu.style.opacity = "1";
    submenu.style.visibility = "visible";
    submenu.style.transform = "translate(-50%, 0)";
    submenu.style.pointerEvents = "auto";
  };

  navMenu.querySelectorAll(".gnb-item").forEach((item) => {
    const closeDesktopDropdown = () => {
      if (window.innerWidth <= 980) return;
      resetDesktopDropdown(item);
    };

    item.addEventListener("mouseenter", () => openDesktopDropdown(item));
    item.addEventListener("mouseover", () => openDesktopDropdown(item));
    item.addEventListener("mouseleave", closeDesktopDropdown);
    item.addEventListener("focusin", () => openDesktopDropdown(item));
    item.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!item.contains(document.activeElement)) closeDesktopDropdown();
      }, 0);
    });
  });
  navMenu.querySelectorAll(".gnb-subtoggle").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".gnb-item");
      if (!item) return;
      const willOpen = !item.classList.contains("is-open");

      closeSubmenus();
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
      closeDesktopDropdowns();
      if (navMenu.classList.contains("is-open")) {
        closeMenu();
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", loadPartials);





