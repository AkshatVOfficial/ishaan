(function () {
  const mqReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersReducedMotion = () => mqReduceMotion.matches;

  const onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  function addMqListener(mq, fn) {
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", fn);
    else if (typeof mq.addListener === "function") mq.addListener(fn);
  }

  function initMobileNav() {
    const menuBtn = document.querySelector(".menu-btn");
    const nav = document.querySelector(".nav");
    if (!menuBtn || !nav) return;

    const mqMobileNav = window.matchMedia("(max-width: 760px)");

    const setOpen = (open) => {
      if (!mqMobileNav.matches) {
        nav.classList.remove("active");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.textContent = "☰";
        return;
      }
      nav.classList.toggle("active", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menuBtn.textContent = open ? "✖" : "☰";
    };

    menuBtn.addEventListener("click", () => {
      setOpen(!nav.classList.contains("active"));
    });

    nav.querySelectorAll("a[href^='#']").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("active")) return;
      if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
        setOpen(false);
      }
    });

    addMqListener(mqMobileNav, () => setOpen(false));
  }

  function initTickerMarquee() {
    if (prefersReducedMotion()) return;
    const root = document.getElementById("ticker-marquee");
    if (!root) return;
    const segment = root.querySelector(".ticker-segment");
    if (!segment) return;
    const clone = segment.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    root.appendChild(clone);
  }

  function initTopbarScroll() {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    let ticking = false;
    const threshold = 12;

    const update = () => {
      ticking = false;
      topbar.classList.toggle("is-scrolled", window.scrollY > threshold);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  function initScrollSpy() {
    const links = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
    const sectionIds = [...new Set(links.map((a) => a.getAttribute("href")).filter(Boolean))];
    const sections = sectionIds
      .map((id) => document.querySelector(id))
      .filter(Boolean);
    if (!sections.length) return;

    const linkById = new Map();
    links.forEach((a) => {
      const id = a.getAttribute("href");
      if (id && id.startsWith("#")) linkById.set(id.slice(1), a);
    });

    const setActive = (id) => {
      links.forEach((a) => a.classList.remove("is-active"));
      const link = id ? linkById.get(id) : null;
      if (link) link.classList.add("is-active");
    };

    const applyHash = () => {
      const raw = location.hash.replace(/^#/, "");
      if (raw && linkById.has(raw)) setActive(raw);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id);
        }
      },
      { root: null, rootMargin: "-38% 0px -32% 0px", threshold: [0, 0.12, 0.28, 0.55] }
    );

    sections.forEach((sec) => io.observe(sec));

    const onScroll = () => {
      const y = window.scrollY;
      const doc = document.documentElement;
      const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
      if (y < 72) {
        setActive("");
        return;
      }
      if (maxScroll > 0 && y >= maxScroll - 4) {
        const last = sections[sections.length - 1];
        if (last?.id) setActive(last.id);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", applyHash);
    onScroll();
    applyHash();
  }

  function initReveal() {
    if (prefersReducedMotion()) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    els.forEach((el) => io.observe(el));
  }

  onReady(() => {
    initMobileNav();
    initTickerMarquee();
    initTopbarScroll();
    initScrollSpy();
    initReveal();
  });
})();
