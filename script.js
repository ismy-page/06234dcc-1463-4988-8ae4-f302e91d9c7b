(() => {
  "use strict";

  // Utility: clamp
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  // Current year
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Smooth scroll for anchor links
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Close mobile menu when navigating
      navLinks?.classList.remove("open");
      if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    }
  });

  // Mobile nav toggle
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("open");
    });
  }

  // Intersection Observer for reveals
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add("in-view");
      }
    },
    { rootMargin: "-10% 0px -10% 0px", threshold: 0.1 }
  );
  document.querySelectorAll(".section, .project-card, .phase, .quote, .skill-map, .about-visual, .hero-copy").forEach((el) => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });

  // Orbital keywords: position nodes around a circle and rotate
  const orbit = document.getElementById("keywordOrbit");
  if (orbit) {
    const items = Array.from(orbit.children);
    const center = { x: 50, y: 50 };
    const radius = 44; // percentage within container

    items.forEach((li, i) => {
      const t = (i / items.length) * Math.PI * 2;
      const x = center.x + radius * Math.cos(t);
      const y = center.y + radius * Math.sin(t);
      li.style.left = x + "%";
      li.style.top = y + "%";
    });

    // Subtle parallax + rotation speed change on pointer
    let speed = 1;
    orbit.addEventListener("pointermove", (ev) => {
      const rect = orbit.getBoundingClientRect();
      const mx = (ev.clientX - rect.left) / rect.width;
      speed = 0.6 + Math.abs(mx - 0.5) * 1.2;
    });

    let rot = 0;
    const spin = () => {
      rot += 0.06 * speed;
      orbit.style.transform = `rotate(${rot}deg)`;
      requestAnimationFrame(spin);
    };
    spin();
  }

  // Canvas: starfield/particle flow in hero
  const canvas = document.getElementById("hero-canvas");
  if (canvas instanceof HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      W = canvas.clientWidth = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      H = canvas.clientHeight = Math.max(260, (canvas.parentElement ? canvas.parentElement.clientHeight : 420));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (n) => {
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.3) * 0.6,
          r: 0.6 + Math.random() * 1.8,
          h: 180 + Math.random() * 180
        });
      }
    };
    spawn(120);

    let mx = W / 2, my = H / 2;
    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mx = (e.clientX - rect.left);
      my = (e.clientY - rect.top);
    });

    const step = () => {
      if (!ctx) return;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        // attract to mouse slightly
        const ax = (mx - p.x) * 0.0006;
        const ay = (my - p.y) * 0.0006;
        p.vx += ax; p.vy += ay;
        p.vx *= 0.996; p.vy *= 0.996;
        p.x += p.vx; p.y += p.vy;

        // wrap
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;

        ctx.beginPath();
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, `hsla(${p.h}, 100%, 70%, .9)`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      requestAnimationFrame(step);
    };
    step();
  }

  // Tilt effect for project cards
  const tiltEls = document.querySelectorAll(".tilt");
  tiltEls.forEach((el) => {
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = clamp((0.5 - y) * 12, -12, 12);
        const ry = clamp((x - 0.5) * 12, -12, 12);
        el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        el.style.boxShadow = `0 ${Math.abs(ry)}px ${24 + Math.abs(rx)}px rgba(0,0,0,.35)`;
      });
    };
    const onLeave = () => {
      el.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg)";
      el.style.boxShadow = "0 12px 36px rgba(0,0,0,0.35)";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
  });

  // Counters
  const counters = document.querySelectorAll(".num, .stat");
  const animateCount = (el) => {
    const target = Number(el.getAttribute("data-count")) || 0;
    const dur = 1000 + Math.random() * 600;
    const t0 = performance.now();
    const from = 0;
    const step = (t) => {
      const p = clamp((t - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.floor(from + eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.4 });
  counters.forEach((el) => counterObserver.observe(el));

  // Skill map: place nodes around circle and show tooltip
  const skillMap = document.getElementById("skillMap");
  const tip = document.getElementById("nodeTip");
  if (skillMap && tip) {
    const nodes = Array.from(skillMap.querySelectorAll(".node"));
    const R = 120; // px radius
    nodes.forEach((n, i) => {
      const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * R;
      const y = Math.sin(a) * R;
      n.style.transform = `translate(${x}px, ${y}px)`;
      n.addEventListener("pointerenter", () => {
        tip.textContent = `${n.getAttribute("data-label")} — ${n.getAttribute("data-tools")}`;
      });
      n.addEventListener("focus", () => {
        tip.textContent = `${n.getAttribute("data-label")} — ${n.getAttribute("data-tools")}`;
      });
      n.addEventListener("pointerleave", () => { tip.textContent = ""; });
      n.addEventListener("blur", () => { tip.textContent = ""; });
    });
  }

  // Process timeline progress on scroll into view
  const timeline = document.getElementById("timeline");
  const progress = document.getElementById("timelineProgress");
  if (timeline && progress) {
    const onScroll = () => {
      const rect = timeline.getBoundingClientRect();
      const total = rect.height;
      const visible = clamp((window.innerHeight - rect.top) / (total + window.innerHeight * 0.2), 0, 1);
      progress.style.width = `${visible * 100}%`;
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Testimonials carousel: auto-scroll with pause on hover
  const carousel = document.getElementById("carousel");
  if (carousel) {
    let x = 0; let playing = true;
    const tick = () => {
      if (playing) x -= 0.3; // px per frame
      carousel.scrollTo({ left: -x, behavior: "auto" });
      // loop
      const max = carousel.scrollWidth - carousel.clientWidth;
      if (-x > max) x = 0;
      requestAnimationFrame(tick);
    };
    carousel.addEventListener("pointerenter", () => (playing = false));
    carousel.addEventListener("pointerleave", () => (playing = true));
    tick();
  }

  // Contact form fake submit
  const form = document.getElementById("contactForm");
  if (form) {
    const result = document.getElementById("formResult");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = /** @type {HTMLInputElement|null} */ (document.getElementById("name"));
      const email = /** @type {HTMLInputElement|null} */ (document.getElementById("email"));
      const message = /** @type {HTMLTextAreaElement|null} */ (document.getElementById("message"));
      if (!name?.value || !email?.value || !message?.value) {
        result && (result.textContent = "Please fill out all fields.");
        return;
      }
      result && (result.textContent = "Thanks! I’ll get back to you within 24 hours.");
      form.reset();
    });
  }
})();

