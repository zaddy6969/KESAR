document.documentElement.classList.add("story-enhanced");

const premiumLoader = document.getElementById("pageLoader");
const premiumProgress = document.getElementById("scrollProgress");
const premiumHeroMedia = document.getElementById("heroMedia");
const premiumCursor = document.getElementById("cursorRing");
const premiumReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const premiumFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const premiumHeroVideo = document.querySelector(".hero-video");

function startHeroVideo() {
  if (!premiumHeroVideo || premiumReduceMotion) return;
  premiumHeroVideo.muted = true;
  premiumHeroVideo.defaultMuted = true;
  const playAttempt = premiumHeroVideo.play();
  if (playAttempt) playAttempt.catch(() => {
    premiumHeroVideo.addEventListener("canplay", () => premiumHeroVideo.play().catch(() => {}), { once: true });
  });
}

startHeroVideo();
window.addEventListener("pageshow", startHeroVideo);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) startHeroVideo();
});

function finishPremiumLoading() {
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-loaded");
}

if (premiumReduceMotion) {
  finishPremiumLoading();
} else if (document.readyState === "complete") {
  window.setTimeout(finishPremiumLoading, 650);
} else {
  window.addEventListener("load", () => window.setTimeout(finishPremiumLoading, 650), { once: true });
  window.setTimeout(finishPremiumLoading, 2200);
}

document.querySelectorAll(".section-title").forEach(item => item.classList.add("reveal-title"));
document.querySelectorAll(".menu-showcase-media, .gallery-track figure").forEach(item => item.classList.add("reveal-image"));

const premiumStoryImages = document.querySelectorAll(".story-media img");
premiumStoryImages.forEach(image => {
  const markStoryImageLoaded = () => image.closest(".story-media")?.classList.add("is-loaded");

  if (image.complete) {
    markStoryImageLoaded();
  } else {
    image.addEventListener("load", markStoryImageLoaded, { once: true });
    image.addEventListener("error", markStoryImageLoaded, { once: true });
  }
});

const premiumReservation = document.querySelector(".reservation");

function updatePremiumScroll() {
  const scrollY = window.scrollY;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  premiumProgress.style.transform = `scaleX(${Math.min(scrollY / maxScroll, 1)})`;

  if (!premiumReduceMotion && premiumHeroMedia && scrollY < window.innerHeight * 1.25) {
    premiumHeroMedia.style.setProperty("--hero-scroll", `${scrollY * 0.11}px`);
  }

  if (!premiumReduceMotion && premiumReservation) {
    const rect = premiumReservation.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      premiumReservation.style.setProperty("--watermark-x", `${(window.innerHeight - rect.top) * 0.025}px`);
    }
  }
}

updatePremiumScroll();
window.addEventListener("scroll", updatePremiumScroll, { passive: true });
window.addEventListener("resize", updatePremiumScroll, { passive: true });

if (premiumFinePointer && !premiumReduceMotion) {
  let targetX = -100;
  let targetY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener("pointermove", event => {
    targetX = event.clientX;
    targetY = event.clientY;
    premiumCursor.classList.add("visible");
  }, { passive: true });

  window.addEventListener("pointerleave", () => premiumCursor.classList.remove("visible"));

  function animatePremiumCursor() {
    ringX += (targetX - ringX) * 0.16;
    ringY += (targetY - ringY) * 0.16;
    premiumCursor.style.left = `${ringX}px`;
    premiumCursor.style.top = `${ringY}px`;
    requestAnimationFrame(animatePremiumCursor);
  }
  animatePremiumCursor();

  document.querySelectorAll("a, button, input, select, textarea, .menu-combo-card summary, .menu-signature-card, .philosophy-row, figure").forEach(element => {
    element.addEventListener("pointerenter", () => premiumCursor.classList.add("active"));
    element.addEventListener("pointerleave", () => premiumCursor.classList.remove("active"));
  });

  document.querySelectorAll(".reserve-nav, .link-line, .story-cta, .menu-combo-action button, .submit-button").forEach(element => {
    element.classList.add("magnetic");
    element.addEventListener("pointermove", event => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate3d(${x * 0.14}px, ${y * 0.18}px, 0)`;
    });
    element.addEventListener("pointerleave", () => {
      element.style.transform = "translate3d(0,0,0)";
    });
  });

  const premiumHero = document.querySelector(".hero");
  premiumHero.addEventListener("pointermove", event => {
    const x = (event.clientX / window.innerWidth - 0.5) * -12;
    const y = (event.clientY / window.innerHeight - 0.5) * -8;
    premiumHeroMedia.style.setProperty("--hero-x", `${x}px`);
    premiumHeroMedia.style.setProperty("--hero-y", `${y}px`);
  });
  premiumHero.addEventListener("pointerleave", () => {
    premiumHeroMedia.style.setProperty("--hero-x", "0px");
    premiumHeroMedia.style.setProperty("--hero-y", "0px");
  });

  const premiumParallaxImages = document.querySelectorAll(".story-media[data-story-parallax] img, .menu-showcase-media img, .gallery-track figure img");
  let premiumParallaxFrame = 0;

  function updatePremiumParallax() {
    premiumParallaxFrame = 0;

    premiumParallaxImages.forEach((image, index) => {
      const frame = image.parentElement;
      const parallaxFrame = image.closest("[data-story-parallax]") || frame;
      const rect = parallaxFrame.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const storyLimit = Number(parallaxFrame.dataset.storyParallax);

        if (Number.isFinite(storyLimit) && window.innerWidth > 1000) {
          const movement = Math.max(-Math.abs(storyLimit),Math.min(Math.abs(storyLimit),centerOffset * storyLimit));
          parallaxFrame.style.setProperty("--story-parallax-y", `${movement}px`);
        } else if (Number.isFinite(storyLimit)) {
          parallaxFrame.style.setProperty("--story-parallax-y", "0px");
        } else {
          const speed = index % 2 === 0 ? -18 : -12;
          frame.style.setProperty("--parallax-y", `${centerOffset * speed}px`);
        }
      }
    });
  }

  function schedulePremiumParallax() {
    if (!premiumParallaxFrame) premiumParallaxFrame = requestAnimationFrame(updatePremiumParallax);
  }

  schedulePremiumParallax();
  window.addEventListener("scroll", schedulePremiumParallax, { passive: true });
  window.addEventListener("resize", schedulePremiumParallax, { passive: true });
}

const premiumSections = [...document.querySelectorAll("main section[id]")];
const premiumNavLinks = [...document.querySelectorAll('.nav-link[href^="#"]')];
const premiumSectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const activeSectionId = entry.target.id === "story-craft" ? "story" : entry.target.id;
      premiumNavLinks.forEach(link => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${activeSectionId}`);
      });
    }
  });
}, { rootMargin: "-35% 0px -55%", threshold: 0 });

premiumSections.forEach(section => premiumSectionObserver.observe(section));
