/* ==========================================================================
   FROSTLINK — main.js
   Site-wide behaviour: mobile navigation menu, active nav link highlight.
   ========================================================================== */

(function () {
  "use strict";

  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-nav-panel]");
    if (!toggle || !panel) return;

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      panel.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
    }

    function openMenu() {
      toggle.setAttribute("aria-expanded", "true");
      panel.classList.add("is-open");
      document.body.classList.add("no-scroll");
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on link click (so navigating actually closes the menu)
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    // Close if window is resized back to desktop width
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) closeMenu();
    });
  }

  function markActiveNavLink() {
    var current = (window.location.pathname.split("/").pop() || "index.html");
    document.querySelectorAll(".main-nav a, .mobile-panel a").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var hrefPage = href.split("#")[0] || "index.html";
      if (hrefPage === "" ) hrefPage = "index.html";
      if (hrefPage === current) {
        link.classList.add("is-active");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    markActiveNavLink();
  });
})();
