(() => {
  "use strict";

  const ORIGINAL_SCRIPT = "https://cdn.jsdelivr.net/gh/zaddy6969/KESAR@05aae2cd1d1ad4d662c48f02c15e5f33d1eae99b/script.js";
  const HERO_VIDEO = "data:video/mp4;base64,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";

  const extraDishes = [
    {
      title: "Mutton Mandi",
      category: "Mandi · House Special",
      copy: "Long-grain mandi rice served with rich, slow-cooked mutton and warm spice.",
      pairing: "Ideal with salna and fresh onion salad.",
      image: "/assets/images/royalmandiplatter-10ppl.png",
      alt: "Mutton mandi platter"
    },
    {
      title: "Tandoori Chicken",
      category: "Fire Roast · Classic",
      copy: "A bold, smoky tandoori favourite finished with citrus and char.",
      pairing: "Best paired with mint chutney and warm mandi rice.",
      image: "/assets/images/storypage-mandi2.png",
      alt: "Tandoori chicken platter"
    },
    {
      title: "Chicken Kabab",
      category: "Grill · Sharing",
      copy: "Juicy kababs with spice, char and a tender bite made for sharing.",
      pairing: "Serve with garlic dip and a chilled drink.",
      image: "/assets/images/mandicombo-8ppl.png",
      alt: "Chicken kabab platter"
    },
    {
      title: "Family Mandi Feast",
      category: "Mandi · Gathering",
      copy: "A complete family-style spread with meat, rice and generous accompaniments.",
      pairing: "Perfect for larger tables and celebratory dinners.",
      image: "/assets/images/familymandifest-6ppl.png",
      alt: "Family mandi feast"
    }
  ];

  function installHeroMotion() {
    const media = document.querySelector("#heroMedia");
    const image = media?.querySelector("img");
    if (!media || !image || media.querySelector(".hero-video")) return;

    image.classList.add("hero-fallback");

    const video = document.createElement("video");
    video.className = "hero-video";
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.poster = image.currentSrc || image.src;
    video.src = HERO_VIDEO;
    video.setAttribute("aria-hidden", "true");
    video.addEventListener("error", () => video.remove(), { once: true });
    image.insertAdjacentElement("afterend", video);

    if (!media.querySelector(".hero-glow")) {
      const glow = document.createElement("div");
      glow.className = "hero-glow";
      video.insertAdjacentElement("afterend", glow);
    }

    video.play().catch(() => {});
  }

  function openNewDish(card, trigger) {
    const dialog = document.querySelector("#dishDialog");
    if (!dialog) return;
    document.querySelector("#dialogImage").src = card.querySelector("img").src;
    document.querySelector("#dialogImage").alt = card.querySelector("img").alt;
    document.querySelector("#dialogCategory").textContent = card.dataset.category;
    document.querySelector("#dialogTitle").textContent = card.dataset.title;
    document.querySelector("#dialogCopy").textContent = card.dataset.copy;
    document.querySelector("#dialogPairing").textContent = card.dataset.pairing;
    document.body.classList.add("dialog-open");
    dialog.showModal();
    dialog.querySelector(".dialog-close")?.focus();
    dialog.addEventListener("close", () => trigger.focus(), { once: true });
  }

  function extendDishRail() {
    const track = document.querySelector("#dishTrack");
    if (!track || track.querySelector("[data-revision-dish]")) return;

    extraDishes.forEach((dish) => {
      const card = document.createElement("article");
      card.className = "dish-card reveal visible";
      card.dataset.revisionDish = "true";
      card.dataset.title = dish.title;
      card.dataset.category = dish.category;
      card.dataset.copy = dish.copy;
      card.dataset.pairing = dish.pairing;
      card.innerHTML = `
        <img src="${dish.image}" alt="${dish.alt}">
        <div>
          <span>${dish.category}</span>
          <h3>${dish.title}</h3>
          <p>${dish.copy}</p>
          <button type="button" data-revision-details>View details ↗</button>
        </div>`;
      card.querySelector("[data-revision-details]").addEventListener("click", (event) => {
        openNewDish(card, event.currentTarget);
      });
      track.append(card);
    });

    const cardStep = () => {
      const card = track.querySelector(".dish-card");
      const style = getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || "18");
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };

    const replaceControl = (selector, direction) => {
      const oldButton = document.querySelector(selector);
      if (!oldButton) return;
      const button = oldButton.cloneNode(true);
      oldButton.replaceWith(button);
      button.addEventListener("click", () => {
        track.scrollBy({ left: direction * cardStep(), behavior: "smooth" });
      });
    };

    replaceControl("#dishPrev", -1);
    replaceControl("#dishNext", 1);

    track.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    }, { passive: false });

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    track.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button,a")) return;
      dragging = true;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      track.setPointerCapture(event.pointerId);
    });
    track.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      track.scrollLeft = startScroll - (event.clientX - startX);
    });
    ["pointerup", "pointercancel"].forEach((name) => {
      track.addEventListener(name, () => { dragging = false; });
    });
  }

  function applyRevision() {
    installHeroMotion();
    extendDishRail();
    document.body.classList.add("loaded");
  }

  const original = document.createElement("script");
  original.src = ORIGINAL_SCRIPT;
  original.async = false;
  original.onload = () => window.setTimeout(applyRevision, 0);
  original.onerror = applyRevision;
  document.head.append(original);
})();
