/* 循光践道官网 · 交互脚本
 * 原生 JS，零依赖
 * 1) 页头随滚动变实
 * 2) 移动端菜单
 * 3) 首屏「光 → 道」滚动进度
 * 4) 内容入场
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ========== 页头 ========== */
  var header = document.querySelector(".xg-header");
  var navToggle = document.querySelector(".xg-nav-toggle");
  var nav = document.querySelector(".xg-nav");
  var darkSection = document.querySelector(".xg-dawn, .xg-page-hero");

  function solidThreshold() {
    if (!darkSection) return 40;
    var top = darkSection.getBoundingClientRect().top + window.scrollY;
    return top + darkSection.offsetHeight - 76;
  }

  function syncHeader() {
    if (!header) return;
    var solid =
      window.scrollY > solidThreshold() ||
      document.body.classList.contains("xg-nav-open");
    header.classList.toggle("is-solid", solid);
  }

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开菜单");
    document.body.classList.remove("xg-nav-open");
    syncHeader();
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      if (open) {
        closeNav();
      } else {
        nav.classList.add("is-open");
        navToggle.setAttribute("aria-expanded", "true");
        navToggle.setAttribute("aria-label", "关闭菜单");
        document.body.classList.add("xg-nav-open");
        syncHeader();
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) closeNav();
    });
  }

  /* ========== 首屏滚动叙事 ========== */
  var dawn = document.querySelector(".xg-dawn");

  function updateDawn() {
    if (!dawn) return;

    if (reduceMotion) {
      dawn.style.setProperty("--p", "0.7");
      dawn.dataset.phase = "3";
      return;
    }

    var rect = dawn.getBoundingClientRect();
    var travel = rect.height - window.innerHeight;
    if (travel <= 0) {
      dawn.style.setProperty("--p", "0");
      dawn.dataset.phase = "0";
      return;
    }

    var progress = Math.min(1, Math.max(0, -rect.top / travel));
    dawn.style.setProperty("--p", progress.toFixed(4));

    var phase = 0;
    if (progress > 0.16) phase = 1;
    if (progress > 0.38) phase = 2;
    if (progress > 0.62) phase = 3;
    dawn.dataset.phase = String(phase);
  }

  /* ========== 滚动调度 ========== */
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      syncHeader();
      updateDawn();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  syncHeader();
  updateDawn();

  /* ========== 内容入场 ========== */
  var revealItems = Array.prototype.slice.call(
    document.querySelectorAll(".xg-reveal")
  );

  if (!revealItems.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  revealItems.forEach(function (item) {
    observer.observe(item);
  });
})();
