(() => {
  document.documentElement.classList.remove("no-js");

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => {
      if (el.dataset.delay) el.style.transitionDelay = `${el.dataset.delay}ms`;
      revealObserver.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav-links a").forEach((link) =>
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) =>
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const stageVideo = document.querySelector(".stage-video");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (stageVideo && !reduceMotion && !saveData && "IntersectionObserver" in window) {
    const { webm, mp4 } = stageVideo.dataset;
    let visible = false;
    const play = () => {
      if (visible) stageVideo.play().catch(() => {});
    };
    stageVideo.muted = true;
    stageVideo.addEventListener("canplay", play);
    stageVideo.addEventListener("error", () => {
      if (stageVideo.getAttribute("src") !== mp4) {
        stageVideo.src = mp4;
        stageVideo.load();
      }
    });
    new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1].isIntersecting;
        if (!visible) {
          stageVideo.pause();
          return;
        }
        if (!stageVideo.getAttribute("src")) {
          stageVideo.preload = "auto";
          stageVideo.src = stageVideo.canPlayType('video/webm; codecs="vp9"') ? webm : mp4;
          stageVideo.load();
        }
        play();
      },
      { rootMargin: "200px 0px" }
    ).observe(stageVideo);
  }

  const form = document.querySelector("#contact-form");
  if (form) {
    const status = form.querySelector(".form-status");
    const button = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      button.disabled = true;
      status.textContent = "Sending…";
      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        form.reset();
        status.textContent = "Thanks — I'll get back to you soon.";
      } catch {
        status.textContent = "Something went wrong. Please email me directly instead.";
      } finally {
        button.disabled = false;
      }
    });
  }
})();
