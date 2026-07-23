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

  function installGuestSelectStyles() {
    if ($("#kesarGuestSelectStyles")) return;
    const style = document.createElement("style");
    style.id = "kesarGuestSelectStyles";
    style.textContent = `
      .reservation-control.has-kesar-guest-select{position:relative!important}
      .reservation-control.has-kesar-guest-select>.reservation-native-guest-select{
        position:absolute!important;width:1px!important;height:1px!important;min-height:1px!important;
        margin:0!important;padding:0!important;border:0!important;opacity:0!important;
        clip-path:inset(50%)!important;overflow:hidden!important;white-space:nowrap!important;
        pointer-events:none!important
      }
      .kesar-guest-select__trigger{
        position:relative;z-index:1;width:100%;height:44px;min-height:44px;display:flex;align-items:center;
        padding:0 44px 0 44px;border:1px solid rgba(23,19,15,.14);border-radius:11px;
        background:#fbf8f2;color:#17130f;text-align:left;font:500 13px/1.35 "DM Sans",Arial,sans-serif;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.82);cursor:pointer;
        transition:border-color .22s ease,box-shadow .22s ease,background .22s ease,transform .22s ease
      }
      .kesar-guest-select__trigger:hover{border-color:rgba(182,117,50,.72);background:#fffaf2}
      .kesar-guest-select__trigger:focus-visible{outline:0;border-color:#b67532;box-shadow:0 0 0 3px rgba(182,117,50,.14),inset 0 1px 0 rgba(255,255,255,.9)}
      .kesar-guest-select__trigger[aria-expanded="true"]{border-color:#b67532;background:#fffaf2;box-shadow:0 0 0 3px rgba(182,117,50,.12),0 8px 24px rgba(78,48,22,.08)}
      .reservation-native-guest-select[aria-invalid="true"]+.kesar-guest-select__trigger{border-color:#a84536!important;box-shadow:0 0 0 3px rgba(168,69,54,.1)!important}
      .kesar-guest-select__value{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .kesar-guest-select__value.is-placeholder{color:rgba(23,19,15,.48)}
      .kesar-guest-select__chevron{position:absolute;right:16px;top:50%;width:9px;height:9px;border-right:1.6px solid currentColor;border-bottom:1.6px solid currentColor;transform:translateY(-70%) rotate(45deg);transition:transform .22s ease}
      .kesar-guest-select__trigger[aria-expanded="true"] .kesar-guest-select__chevron{transform:translateY(-25%) rotate(225deg)}
      .kesar-guest-select__popover{
        position:fixed;z-index:26050;padding:8px;border:1px solid rgba(182,117,50,.62);border-radius:13px;
        background:rgba(255,250,242,.985);box-shadow:0 22px 58px rgba(27,18,11,.24),0 2px 8px rgba(27,18,11,.08);
        opacity:0;transform:translateY(-8px) scale(.985);transform-origin:top center;
        transition:opacity .16s ease,transform .2s cubic-bezier(.2,.75,.2,1);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)
      }
      .kesar-guest-select__popover[hidden]{display:none!important}
      .kesar-guest-select__popover.is-visible{opacity:1;transform:none}
      .kesar-guest-select__popover.is-above{transform-origin:bottom center}
      .kesar-guest-select__list{display:grid;gap:3px;max-height:min(330px,calc(100dvh - 32px));overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(182,117,50,.42) transparent}
      .kesar-guest-select__option{
        width:100%;min-height:48px;display:grid;grid-template-columns:34px minmax(0,1fr) 24px;align-items:center;gap:10px;
        padding:7px 10px;border:0;border-radius:9px;background:transparent;color:#211a14;text-align:left;cursor:pointer;
        transition:background .16s ease,color .16s ease,transform .16s ease
      }
      .kesar-guest-select__option:hover,.kesar-guest-select__option:focus-visible{outline:0;background:rgba(182,117,50,.1);transform:translateX(2px)}
      .kesar-guest-select__option[aria-selected="true"]{background:linear-gradient(90deg,rgba(182,117,50,.18),rgba(182,117,50,.08));color:#7d4315}
      .kesar-guest-select__count{width:32px;height:32px;display:grid;place-items:center;border:1px solid rgba(182,117,50,.42);border-radius:50%;background:#fffaf2;color:#955117;font:700 10px/1 "DM Sans",Arial,sans-serif;letter-spacing:.02em}
      .kesar-guest-select__option[aria-selected="true"] .kesar-guest-select__count{border-color:#b67532;background:#b67532;color:#fffaf2}
      .kesar-guest-select__copy{min-width:0;display:grid;gap:2px}
      .kesar-guest-select__copy strong{font:650 12px/1.1 "DM Sans",Arial,sans-serif}
      .kesar-guest-select__copy small{color:#75695e;font:500 8.5px/1.2 "DM Sans",Arial,sans-serif;letter-spacing:.025em}
      .kesar-guest-select__check{width:20px;height:20px;display:grid;place-items:center;border:1px solid rgba(149,81,23,.22);border-radius:50%;color:#955117;font:700 11px/1 Arial,sans-serif;opacity:0;transform:scale(.7);transition:opacity .16s ease,transform .16s ease}
      .kesar-guest-select__option[aria-selected="true"] .kesar-guest-select__check{opacity:1;transform:scale(1)}
      @media(max-width:700px){
        .kesar-guest-select__popover{padding:7px;border-radius:12px}
        .kesar-guest-select__option{min-height:46px;padding:6px 9px}
        .kesar-guest-select__copy strong{font-size:11.5px}
      }
      @media(prefers-reduced-motion:reduce){
        .kesar-guest-select__trigger,.kesar-guest-select__chevron,.kesar-guest-select__popover,.kesar-guest-select__option,.kesar-guest-select__check{transition:none!important;transform:none!important}
      }
    `;
    document.head.append(style);
  }

  function setupGuestSelect() {
    const select = $("#guests");
    const dialog = $("#reservationDialog");
    const control = select?.closest(".reservation-control");
    if (!select || !dialog || !control || control.dataset.guestSelectReady === "true") return false;

    installGuestSelectStyles();
    control.dataset.guestSelectReady = "true";
    control.classList.add("has-kesar-guest-select");
    select.classList.add("reservation-native-guest-select");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");

    const field = select.closest(".field");
    const label = field?.querySelector('label[for="guests"]');
    if (label && !label.id) label.id = "reservationGuestsLabel";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "kesar-guest-select__trigger";
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-autocomplete", "none");

    const value = document.createElement("span");
    value.id = "reservationGuestsValue";
    value.className = "kesar-guest-select__value is-placeholder";
    value.textContent = "Choose party size";
    const chevron = document.createElement("span");
    chevron.className = "kesar-guest-select__chevron";
    chevron.setAttribute("aria-hidden", "true");
    trigger.append(value, chevron);
    select.after(trigger);

    const popover = document.createElement("div");
    popover.className = "kesar-guest-select__popover";
    popover.hidden = true;

    const list = document.createElement("div");
    list.id = "reservationGuestsListbox";
    list.className = "kesar-guest-select__list";
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", "Number of guests");
    popover.append(list);
    dialog.append(popover);

    trigger.setAttribute("aria-controls", list.id);
    trigger.setAttribute("aria-labelledby", [label?.id, value.id].filter(Boolean).join(" "));

    const hints = {
      "2 guests": "Table for two",
      "3 guests": "Small gathering",
      "4 guests": "Family table",
      "5 guests": "Popular group size",
      "6 guests": "Large family table",
      "7+ guests": "Larger gathering"
    };

    const optionButtons = [...select.options]
      .filter(option => option.value)
      .map((option, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.id = `reservationGuestsOption${index + 1}`;
        button.className = "kesar-guest-select__option";
        button.setAttribute("role", "option");
        button.dataset.value = option.value;
        const count = option.textContent.trim().replace(/\s*guests?$/i, "");
        button.innerHTML = `
          <span class="kesar-guest-select__count" aria-hidden="true">${count}</span>
          <span class="kesar-guest-select__copy"><strong>${option.textContent.trim()}</strong><small>${hints[option.value] || "Guest table"}</small></span>
          <span class="kesar-guest-select__check" aria-hidden="true">✓</span>`;
        list.append(button);
        return button;
      });

    let closeTimer = 0;

    const syncFromNative = () => {
      const selected = [...select.options].find(option => option.value === select.value && option.value);
      value.textContent = selected?.textContent.trim() || "Choose party size";
      value.classList.toggle("is-placeholder", !selected);
      optionButtons.forEach(button => {
        const active = button.dataset.value === select.value;
        button.setAttribute("aria-selected", String(active));
      });
    };

    const positionPopover = () => {
      if (popover.hidden) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(rect.width, innerWidth - 20);
      popover.style.width = `${width}px`;
      popover.style.left = `${Math.max(10, Math.min(rect.left, innerWidth - width - 10))}px`;
      const height = popover.offsetHeight;
      const roomBelow = innerHeight - rect.bottom - 10;
      const roomAbove = rect.top - 10;
      const showAbove = roomBelow < Math.min(height, 250) && roomAbove > roomBelow;
      popover.classList.toggle("is-above", showAbove);
      popover.style.top = `${showAbove ? Math.max(10, rect.top - height - 6) : rect.bottom + 6}px`;
    };

    const closePopover = (returnFocus = false) => {
      if (popover.hidden) return;
      clearTimeout(closeTimer);
      trigger.setAttribute("aria-expanded", "false");
      popover.classList.remove("is-visible");
      closeTimer = setTimeout(() => { popover.hidden = true; }, reducedMotion ? 0 : 150);
      if (returnFocus) trigger.focus({ preventScroll: true });
    };

    const openPopover = (focusIndex = null) => {
      clearTimeout(closeTimer);
      syncFromNative();
      popover.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      positionPopover();
      requestAnimationFrame(() => popover.classList.add("is-visible"));
      const selectedIndex = optionButtons.findIndex(button => button.dataset.value === select.value);
      const index = focusIndex ?? (selectedIndex >= 0 ? selectedIndex : 0);
      optionButtons[Math.max(0, Math.min(index, optionButtons.length - 1))]?.focus({ preventScroll: true });
    };

    const choose = button => {
      if (!button?.dataset.value) return;
      select.value = button.dataset.value;
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
      syncFromNative();
      closePopover(true);
    };

    trigger.addEventListener("click", () => {
      if (popover.hidden) openPopover();
      else closePopover(false);
    });
    trigger.addEventListener("focus", syncFromNative);
    trigger.addEventListener("keydown", event => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        openPopover(0);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        openPopover(optionButtons.length - 1);
      } else if (event.key === "Escape") {
        event.preventDefault();
        closePopover(false);
      }
    });

    optionButtons.forEach(button => button.addEventListener("click", () => choose(button)));
    list.addEventListener("keydown", event => {
      const index = optionButtons.indexOf(document.activeElement);
      let next = index;
      if (event.key === "ArrowDown") next = (Math.max(index, -1) + 1) % optionButtons.length;
      else if (event.key === "ArrowUp") next = (index <= 0 ? optionButtons.length : index) - 1;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = optionButtons.length - 1;
      else if (event.key === "Escape") {
        event.preventDefault();
        closePopover(true);
        return;
      } else if (event.key === "Tab") {
        closePopover(false);
        return;
      } else {
        return;
      }
      event.preventDefault();
      optionButtons[next]?.focus({ preventScroll: true });
    });

    select.addEventListener("input", syncFromNative);
    select.addEventListener("change", syncFromNative);
    select.addEventListener("focus", () => trigger.focus({ preventScroll: true }));

    document.addEventListener("pointerdown", event => {
      if (popover.hidden || trigger.contains(event.target) || popover.contains(event.target)) return;
      closePopover(false);
    }, true);

    const formHost = dialog.querySelector(".reservation-dialog__form-host");
    formHost?.addEventListener("scroll", positionPopover, { passive: true });
    addEventListener("resize", positionPopover, { passive: true });
    dialog.addEventListener("close", () => closePopover(false));

    new MutationObserver(() => {
      if (dialog.open || dialog.hasAttribute("open")) syncFromNative();
      else closePopover(false);
    }).observe(dialog, { attributes: true, attributeFilter: ["open", "class"] });

    syncFromNative();
    return true;
  }

  function waitForGuestSelect(attempt = 0) {
    if (setupGuestSelect()) return;
    if (attempt < 160) setTimeout(() => waitForGuestSelect(attempt + 1), 50);
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
    waitForGuestSelect();
  } catch (error) {
    console.error("KESAR enhancement error", error);
  } finally {
    releaseLoader();
  }
})();
