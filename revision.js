(() => {
  "use strict";

  const BASE = "https://cdn.jsdelivr.net/gh/zaddy6969/KESAR@05aae2cd1d1ad4d662c48f02c15e5f33d1eae99b/script.js";
  const $ = (query, root = document) => root.querySelector(query);
  const $$ = (query, root = document) => [...root.querySelectorAll(query)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = performance.now();

  document.body.classList.add("loader-hold");

  const release = () => setTimeout(() => {
    document.body.classList.add("loaded", "loader-release");
    document.body.classList.remove("loader-hold");
    setTimeout(() => document.body.classList.add("loader-done"), 1180);
  }, Math.max(0, 3200 - (performance.now() - start)));

  function loadStoryStyles() {
    if (document.querySelector('link[data-kesar-story-editorial]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/story-editorial.css?v=4570ddc";
    link.dataset.kesarStoryEditorial = "true";
    document.head.append(link);
  }

  function buildStory() {
    const currentStory = $("#story");
    if (!currentStory || currentStory.classList.contains("story-editorial")) return;

    const editorial = document.createElement("section");
    editorial.id = "story";
    editorial.className = "story-editorial";
    editorial.setAttribute("aria-labelledby", "storyEditorialTitle");
    editorial.innerHTML = `
      <div class="story-editorial__layout">
        <div class="story-editorial__copy">
          <div class="story-editorial__label reveal story-reveal">The Kesar Story</div>

          <h2 id="storyEditorialTitle" class="story-editorial__title">
            <span class="reveal story-reveal">Where fire</span>
            <span class="reveal story-reveal">becomes <em>flavour.</em></span>
          </h2>

          <div class="story-editorial__symbol reveal story-reveal" aria-hidden="true">
            <svg viewBox="0 0 48 48"><path d="M24 5c2 8 7 13 15 15-8 2-13 7-15 15-2-8-7-13-15-15 8-2 13-7 15-15Z"/><path d="M8 41h32"/></svg>
          </div>

          <div class="story-editorial__description reveal story-reveal">
            <p>At Kesar, every dish is a celebration of heritage, where time-honoured traditions meet the art of fire and spice.</p>
            <p>From slow-roasted mandi to our signature blends, we honour the roots, rituals and generosity of Arabian dining.</p>
          </div>

          <div class="story-editorial__organic reveal story-reveal">
            <h3 class="story-editorial__organic-label">Carefully Sourced Spices</h3>
            <p>Our spices are selected for their purity, aroma and natural depth.</p>
            <p>Saffron, cardamom, cinnamon, cloves and pepper are gently warmed and layered to reveal their full character.</p>
            <p>Every blend is prepared with patience, allowing each spice to enrich the rice and slow-roasted meats without overpowering them.</p>
          </div>

          <a class="story-editorial__cta reveal story-reveal" href="#menu">Discover our craft <span aria-hidden="true">→</span></a>
        </div>

        <div class="story-editorial__gallery" aria-label="Kesar mandi and carefully sourced spice story">
          <figure class="story-editorial__media story-editorial__media--main reveal story-reveal">
            <img src="/assets/images/story-page-mandi.png" width="1122" height="1402" loading="lazy" decoding="async" alt="Steaming slow-roasted mutton mandi served over fragrant basmati rice">
          </figure>

          <figure class="story-editorial__media story-editorial__media--saffron reveal story-reveal">
            <img src="/assets/images/story-page-spices.png" width="1122" height="1402" loading="lazy" decoding="async" alt="Saffron strands displayed in a traditional brass bowl">
          </figure>

          <figure class="story-editorial__media story-editorial__media--spices reveal story-reveal">
            <img src="/assets/images/storypage-spices2.png" width="1122" height="1402" loading="lazy" decoding="async" alt="Cardamom, cinnamon, cloves, pepper and aromatic whole spices">
          </figure>

          <figure class="story-editorial__media story-editorial__media--mandi-small reveal story-reveal">
            <img src="/assets/images/storypage-mandi2.png" width="1122" height="1402" loading="lazy" decoding="async" alt="A closer view of roasted mandi meat, aromatic rice and garnishes">
          </figure>

          <div class="story-editorial__ornament story-editorial__ornament--one reveal story-reveal" aria-hidden="true">
            <svg viewBox="0 0 100 100"><path d="M50 5c6 18 17 29 35 35-18 6-29 17-35 35-6-18-17-29-35-35 18-6 29-17 35-35Z"/><circle cx="50" cy="40" r="16"/><path d="M50 24v32M34 40h32M39 29l22 22M61 29 39 51"/></svg>
          </div>
        </div>
      </div>`;

    currentStory.replaceWith(editorial);
    $("#story-craft")?.remove();

    const revealFallback = () => {
      $$(".story-editorial .story-reveal").forEach(element => element.classList.add("visible"));
    };

    if (reduced) revealFallback();
    else setTimeout(revealFallback, 1800);
  }

  function hero() {
    const media = $("#heroMedia");
    const img = media?.querySelector("img");
    if (!media || !img) return;

    img.classList.add("hero-fallback");
    img.src = "/assets/images/heropage-mandi-4k.webp";
    media.querySelector(".hero-video")?.remove();

    const video = document.createElement("video");
    video.className = "hero-video";
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.poster = img.src;
    video.src = "/assets/videos/heropage-mandi.mp4";
    video.setAttribute("aria-hidden", "true");
    ["canplay", "loadeddata"].forEach(name => video.addEventListener(name, () => video.classList.add("is-ready"), { once: true }));
    video.addEventListener("error", () => video.remove(), { once: true });
    img.after(video);

    if (!media.querySelector(".hero-glow")) {
      const glow = document.createElement("div");
      glow.className = "hero-glow";
      video.after(glow);
    }
    video.play().catch(() => {});
  }

  const dishes = [
    ["Chicken Mandi", "Mandi · Signature", "Fragrant mandi rice served with tender, slow-roasted chicken.", "Best enjoyed with house sauces and fresh salad.", "/assets/images/menupage-chicken%20mandi.png"],
    ["Al Faham Chicken", "Charcoal · Grill", "Charcoal-grilled chicken marinated with aromatic Arabian-inspired spices.", "Pair with mandi rice and cooling raita.", "/assets/images/menupage-al%20faham.png"],
    ["Biryani", "Rice · Classic", "Aromatic long-grain basmati layered with spice and tender meat.", "Complete the plate with raita and salad.", "/assets/images/menupage-biryani.png"],
    ["Chicken Kebab", "Grill · Sharing", "Juicy chicken kebabs with warm spice and charred edges.", "Serve with garlic dip and fresh salad.", "/assets/images/menupage-chicken%20kebab.png"],
    ["Grill Chicken", "Grill · House Favourite", "Fire-grilled chicken finished with citrus and fragrant spice.", "Best paired with mandi rice and house sauce.", "/assets/images/menupage-grill%20chicken.png"],
    ["Kathi Rolls", "Rolls · Street Classic", "Soft flatbread wrapped around smoky chicken, vegetables and house sauce.", "Perfect with a chilled drink.", "/assets/images/menupage-kathi%20rolles.png"],
    ["Shawarma", "Wrap · Classic", "Tender spiced chicken, fresh vegetables and creamy sauce in a warm wrap.", "Enjoy with fries and garlic sauce.", "/assets/images/menupage-shawarma.png"],
    ["Tandoori Chicken", "Tandoor · Classic", "Deeply marinated chicken roasted in the tandoor until smoky and tender.", "Best with mint chutney and onion salad.", "/assets/images/menupage-tandoori%20chicken.png"]
  ];

  function modal(card, button) {
    const dialog = $("#dishDialog");
    if (!dialog) return;
    $("#dialogImage").src = $("img", card).src;
    $("#dialogImage").alt = $("img", card).alt;
    $("#dialogCategory").textContent = card.dataset.category;
    $("#dialogTitle").textContent = card.dataset.title;
    $("#dialogCopy").textContent = card.dataset.copy;
    $("#dialogPairing").textContent = card.dataset.pairing;
    document.body.classList.add("dialog-open");
    dialog.showModal();
    $(".dialog-close", dialog)?.focus();
    dialog.addEventListener("close", () => button.focus(), { once: true });
  }

  function rail() {
    const track = $("#dishTrack");
    if (!track) return;
    track.innerHTML = dishes.map(dish => `<article class="dish-card reveal visible" data-title="${dish[0]}" data-category="${dish[1]}" data-copy="${dish[2]}" data-pairing="${dish[3]}"><img src="${dish[4]}" alt="${dish[0]}"><div><span>${dish[1]}</span><h3>${dish[0]}</h3><p>${dish[2]}</p><button type="button" data-fixed-detail>View details ↗</button></div></article>`).join("");
    $$("[data-fixed-detail]", track).forEach(button => button.onclick = () => modal(button.closest(".dish-card"), button));

    const step = () => {
      const card = $(".dish-card", track);
      const gap = parseFloat(getComputedStyle(track).gap || 18);
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth * .82;
    };
    const max = () => track.scrollWidth - track.clientWidth;
    const controls = () => {
      const previous = $("#dishPrev");
      const next = $("#dishNext");
      if (previous) previous.disabled = track.scrollLeft <= 3;
      if (next) next.disabled = track.scrollLeft >= max() - 3;
    };
    const bind = (id, direction) => {
      const old = $(id);
      if (!old) return;
      const button = old.cloneNode(true);
      old.replaceWith(button);
      button.onclick = () => track.scrollBy({ left: direction * step(), behavior: reduced ? "auto" : "smooth" });
    };
    bind("#dishPrev", -1);
    bind("#dishNext", 1);
    track.addEventListener("scroll", controls, { passive: true });
    track.addEventListener("wheel", event => {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        track.scrollLeft += event.deltaY;
      }
    }, { passive: false });

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    track.onpointerdown = event => {
      if (event.target.closest("button,a")) return;
      dragging = true;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture(event.pointerId);
    };
    track.onpointermove = event => {
      if (dragging) track.scrollLeft = startScroll - (event.clientX - startX);
    };
    ["pointerup", "pointercancel"].forEach(name => track.addEventListener(name, () => {
      dragging = false;
      track.classList.remove("is-dragging");
      controls();
    }));
    addEventListener("resize", controls, { passive: true });
    requestAnimationFrame(controls);
  }

  function apply() {
    loadStoryStyles();
    buildStory();
    hero();
    rail();
    document.body.classList.add("loaded");
  }

  loadStoryStyles();
  buildStory();
  hero();
  release();

  const baseScript = document.createElement("script");
  baseScript.src = BASE;
  baseScript.async = false;
  baseScript.onload = () => setTimeout(apply, 0);
  baseScript.onerror = apply;
  document.head.append(baseScript);
})();
