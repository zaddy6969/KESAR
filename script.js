(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(navigator.connection?.saveData);
  const loaderStarted = performance.now();

  function releaseLoader() {
    const wait = Math.max(0, 650 - (performance.now() - loaderStarted));
    setTimeout(() => {
      document.body.classList.add("loaded", "loader-release");
      document.body.classList.remove("loader-hold", "is-loading");
      setTimeout(() => document.body.classList.add("loader-done"), 850);
    }, wait);
  }

  function setupStoryMotion() {
    const section = $("#story.story-editorial");
    if (!section) return;

    const animated = [
      $(".story-editorial__symbol", section),
      ...$$(".story-editorial__title span", section),
      $(".story-editorial__description", section),
      $(".story-editorial__media--main", section),
      $(".story-editorial__media--saffron", section)
    ].filter(Boolean);

    const show = () => {
      if (section.dataset.motionPlayed === "true") return;
      section.dataset.motionPlayed = "true";
      section.classList.add("story-motion-active");
      animated.forEach((element, index) => {
        setTimeout(() => element.classList.add("visible"), reducedMotion ? 0 : index * 85);
      });
    };

    section.classList.add("story-motion-ready");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      show();
      return;
    }

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      requestAnimationFrame(show);
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    observer.observe(section);
  }

  function setupHeroVideo() {
    const hero = $("#home.hero");
    const video = $(".hero-video", hero || document);
    if (!hero || !video) return;

    if (reducedMotion || saveData) {
      video.remove();
      return;
    }

    const markReady = () => {
      video.classList.add("is-ready");
      hero.classList.add("mobile-video-ready");
    };
    const play = () => video.play().then(markReady).catch(() => {});

    if (video.readyState >= 2) markReady();
    video.addEventListener("loadeddata", markReady, { once: true });
    video.addEventListener("canplay", markReady, { once: true });
    video.addEventListener("playing", markReady, { once: true });
    video.addEventListener("error", () => {
      hero.classList.remove("mobile-video-ready");
      video.remove();
    }, { once: true });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        const visible = Boolean(entries[0]?.isIntersecting && entries[0].intersectionRatio > 0.18);
        document.body.classList.toggle("mobile-hero-in-view", visible);
        if (visible) play();
        else video.pause();
      }, { threshold: [0, 0.18, 0.45] });
      observer.observe(hero);
    } else {
      play();
    }

    addEventListener("pageshow", play, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) video.pause();
      else play();
    });
    document.addEventListener("pointerdown", play, { once: true, passive: true });
  }

  function optimizeImages() {
    const hero = $("#heroMedia img");
    if (hero) {
      hero.fetchPriority = "high";
      hero.decoding = "async";
      hero.removeAttribute("loading");
    }
    $$("main img").forEach(image => {
      if (image === hero) return;
      image.loading = "lazy";
      image.decoding = "async";
      image.fetchPriority = "low";
    });
  }

  document.body.classList.add("loader-hold");
  try {
    setupStoryMotion();
    setupHeroVideo();
    optimizeImages();
  } catch (error) {
    console.error("KESAR enhancement error", error);
  } finally {
    releaseLoader();
  }
})();
