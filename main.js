/* =========================================================
   BABATUNDE OGUNLADE WEBSITE
   MAIN JAVASCRIPT
   ========================================================= */

"use strict";


/* =========================
   DOM READY
   ========================= */

document.addEventListener("DOMContentLoaded", () => {

  initMobileNavigation();

  initHeaderScroll();

  initCurrentYear();

  initActiveNavigation();

  initSmoothScrolling();

});


/* =========================
   MOBILE NAVIGATION
   ========================= */

function initMobileNavigation() {

  const menuToggle = document.getElementById("menuToggle");
  const primaryNav = document.getElementById("primaryNav");

  if (!menuToggle || !primaryNav) {
    return;
  }


  menuToggle.addEventListener("click", () => {

    const isOpen =
      primaryNav.classList.toggle("open");

    menuToggle.classList.toggle(
      "active",
      isOpen
    );

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      isOpen
        ? "Close navigation menu"
        : "Open navigation menu"
    );

    document.body.classList.toggle(
      "no-scroll",
      isOpen
    );

  });


  /* Close menu after clicking a link */

  const navLinks =
    primaryNav.querySelectorAll("a");

  navLinks.forEach((link) => {

    link.addEventListener("click", () => {

      primaryNav.classList.remove("open");

      menuToggle.classList.remove("active");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );

      document.body.classList.remove(
        "no-scroll"
      );

    });

  });


  /* Close menu when clicking outside */

  document.addEventListener("click", (event) => {

    const clickedInsideNav =
      primaryNav.contains(event.target);

    const clickedToggle =
      menuToggle.contains(event.target);

    if (
      !clickedInsideNav &&
      !clickedToggle &&
      primaryNav.classList.contains("open")
    ) {

      primaryNav.classList.remove("open");

      menuToggle.classList.remove("active");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );

      document.body.classList.remove(
        "no-scroll"
      );

    }

  });


  /* Close mobile menu on desktop resize */

  window.addEventListener("resize", () => {

    if (window.innerWidth > 760) {

      primaryNav.classList.remove("open");

      menuToggle.classList.remove("active");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );

      document.body.classList.remove(
        "no-scroll"
      );

    }

  });

}


/* =========================
   HEADER SCROLL EFFECT
   ========================= */

function initHeaderScroll() {

  const header =
    document.getElementById("siteHeader");

  if (!header) {
    return;
  }


  const updateHeader =
    () => {

      if (window.scrollY > 20) {

        header.classList.add("scrolled");

      } else {

        header.classList.remove("scrolled");

      }

    };


  updateHeader();


  window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
  );

}


/* =========================
   CURRENT YEAR
   ========================= */

function initCurrentYear() {

  const yearElement =
    document.getElementById("currentYear");

  if (!yearElement) {
    return;
  }


  yearElement.textContent =
    new Date().getFullYear();

}


/* =========================
   ACTIVE NAVIGATION
   ========================= */

function initActiveNavigation() {

  const currentPage =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();


  const page =
    currentPage === ""
      ? "index.html"
      : currentPage;


  const navLinks =
    document.querySelectorAll(
      ".primary-nav a"
    );


  navLinks.forEach((link) => {

    const href =
      link.getAttribute("href");


    if (!href) {
      return;
    }


    const linkPage =
      href
        .split("/")
        .pop()
        .split("#")[0]
        .toLowerCase();


    link.classList.toggle(
      "active",
      linkPage === page
    );

  });

}


/* =========================
   SMOOTH SCROLLING
   ========================= */

function initSmoothScrolling() {

  const links =
    document.querySelectorAll(
      'a[href^="#"]'
    );


  links.forEach((link) => {

    link.addEventListener(
      "click",
      (event) => {

        const targetId =
          link.getAttribute("href");


        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }


        const target =
          document.querySelector(targetId);


        if (!target) {
          return;
        }


        event.preventDefault();


        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });


        /*
         * Update browser URL without
         * causing a page jump.
         */

        history.pushState(
          null,
          "",
          targetId
        );

      }
    );

  });

}


/* =========================
   EXTERNAL LINKS
   ========================= */

document.querySelectorAll(
  'a[target="_blank"]'
).forEach((link) => {

  link.setAttribute(
    "rel",
    "noopener noreferrer"
  );

});