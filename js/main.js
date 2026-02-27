/* ═══════════════════════════════════════════════════
   JASMINE E. TRAN — main.js
   Dark mode toggle · Carousel · Scroll reveal
═══════════════════════════════════════════════════ */

/* ── DARK MODE ─────────────────────────────────────── */
(function () {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();

document.addEventListener("DOMContentLoaded", () => {
  /* ── Set active nav link ──────────────────────────── */
  const path = window.location.pathname;
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (
      href === path ||
      (path === "/" && href === "/index.html") ||
      (href !== "/" && href !== "/index.html" && path.startsWith(href))
    ) {
      a.classList.add("active");
    }
  });

  /* ── Dark mode toggle ─────────────────────────────── */
  const toggle = document.getElementById("theme-toggle");
  const thumb = document.querySelector(".theme-toggle-thumb");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (thumb) {
      thumb.textContent = theme === "dark" ? "🌙" : "☀️";
    }
  }

  // Set initial icon
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  if (thumb) thumb.textContent = currentTheme === "dark" ? "🌙" : "☀️";

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "light"
          : "dark";
      applyTheme(next);
    });
  }

  /* ── Scroll Reveal ────────────────────────────────── */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            e.target.style.transitionDelay = e.target.dataset.delay || "0s";
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
    );

    reveals.forEach((el) => io.observe(el));
  }

  /* ── Image Carousel ───────────────────────────────── */
  const track = document.querySelector(".carousel-track");
  const slides = document.querySelectorAll(".carousel-slide");
  const dotsWrap = document.querySelector(".carousel-dots");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");

  if (!track || !slides.length) return;

  const VISIBLE = window.innerWidth <= 640 ? 2 : 3;
  const MAX_IDX = Math.max(0, slides.length - VISIBLE);
  let current = 0;
  let autoTimer = null;

  // Build dots
  const dotCount = MAX_IDX + 1;
  const dots = [];
  if (dotsWrap) {
    for (let i = 0; i <= MAX_IDX; i++) {
      const d = document.createElement("button");
      d.className = "carousel-dot" + (i === 0 ? " active" : "");
      d.setAttribute("aria-label", `Go to slide ${i + 1}`);
      d.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(d);
      dots.push(d);
    }
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, MAX_IDX));
    const slideWidth = slides[0].offsetWidth + 16; // gap = 1rem = 16px
    track.style.transform = `translateX(-${current * slideWidth}px)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function next() {
    goTo(current >= MAX_IDX ? 0 : current + 1);
  }
  function prev() {
    goTo(current <= 0 ? MAX_IDX : current - 1);
  }

  if (prevBtn)
    prevBtn.addEventListener("click", () => {
      resetAuto();
      prev();
    });
  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      resetAuto();
      next();
    });

  function startAuto() {
    autoTimer = setInterval(next, 3800);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }
  startAuto();

  // Pause on hover
  const outer = document.querySelector(".carousel-track-outer");
  if (outer) {
    outer.addEventListener("mouseenter", () => clearInterval(autoTimer));
    outer.addEventListener("mouseleave", startAuto);
  }

  // Touch swipe
  let touchStartX = 0;
  if (outer) {
    outer.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );
    outer.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        resetAuto();
        diff > 0 ? next() : prev();
      }
    });
  }

  // Resize
  window.addEventListener("resize", () => goTo(current));
});
