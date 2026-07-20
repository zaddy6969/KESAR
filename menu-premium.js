(() => {
  "use strict";

  const combos = [
    {
      key: "2",
      name: "Mandi Combo",
      party: "2 People",
      selectorLabel: "2 People",
      price: "₹499",
      priceValue: "499",
      badge: "Perfect for Two",
      image: "/assets/images/menupage-al faham.png",
      alt: "Al Faham chicken prepared as a Kesar mandi feast for two people",
      guests: "2 guests",
      items: ["Half Al Faham Chicken", "Unlimited Mandi Rice", "2 Boiled Eggs", "2 Soft Drinks"]
    },
    {
      key: "5",
      name: "Mandi Combo",
      party: "4 to 5 People",
      selectorLabel: "4–5 People",
      price: "₹1,199",
      priceValue: "1,199",
      badge: "Most Popular",
      image: "/assets/images/menupage-chicken mandi.png",
      alt: "Chicken mandi prepared as a generous Kesar feast for four to five people",
      guests: "5 guests",
      items: ["Half Al Faham Chicken", "Half Tandoori Chicken", "8 Pc Chicken Kabab", "Unlimited Mandi Rice", "5 Soft Drinks"]
    },
    {
      key: "6",
      name: "Family Mandi Feast",
      party: "6 People",
      selectorLabel: "6 People",
      price: "₹1,499",
      priceValue: "1,499",
      badge: "Family Favourite",
      image: "/assets/images/menupage-chicken kebab.png",
      alt: "Chicken kabab and mandi prepared as a Kesar family feast for six people",
      guests: "6 guests",
      items: ["Full Al Faham Chicken", "12 Pc Chicken Kabab", "Unlimited Mandi Rice", "6 Boiled Eggs", "6 Soft Drinks"]
    },
    {
      key: "8",
      name: "Mandi Combo",
      party: "8 People",
      selectorLabel: "8 People",
      price: "₹1,999",
      priceValue: "1,999",
      badge: "Made for Gatherings",
      image: "/assets/images/menupage-tandoori chicken.png",
      alt: "Tandoori chicken prepared as a Kesar mandi feast for eight people",
      guests: "7+ guests",
      items: ["Half Tandoori Chicken", "Half Al Faham Chicken", "8 Pc Chicken Kabab", "8 Boiled Eggs", "Unlimited Mandi Rice", "8 Soft Drinks"]
    },
    {
      key: "10",
      name: "Royal Mandi Platter",
      party: "10 People",
      selectorLabel: "10 People",
      price: "₹2,499",
      priceValue: "2,499",
      badge: "The Complete Feast",
      image: "/assets/images/menupage-biryani.png",
      alt: "A royal Kesar mandi platter prepared for ten people",
      guests: "7+ guests",
      items: ["Full Al Faham Chicken", "Full Tandoori Chicken", "16 Pc Chicken Kabab", "10 Boiled Eggs", "Unlimited Mandi Rice", "10 Soft Drinks"]
    }
  ];

  const comboByKey = new Map(combos.map(combo => [combo.key, combo]));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const feature = document.querySelector("[data-menu-feature]");
  const partyTabs = [...document.querySelectorAll("[data-menu-party]")];
  const comboRows = document.getElementById("menuComboRows");
  const announcement = document.getElementById("menuComboAnnouncement");
  const reservation = document.getElementById("reservation");
  const reservationForm = document.getElementById("reservationForm");
  const reservationGuests = document.getElementById("guests");
  const reservationNotes = document.getElementById("message");
  const toast = document.getElementById("toast");
  const mobileReserve = document.getElementById("menuMobileReserve");
  let selectedKey = "5";
  let toastTimer = 0;

  function showMenuToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4200);
  }

  function markMissingImage(image) {
    const frame = image?.closest("figure");
    if (!frame) return;
    frame.classList.add("is-missing");
    image.hidden = true;
  }

  function watchImage(image) {
    if (!image) return;
    if (image.complete && image.naturalWidth === 0) {
      markMissingImage(image);
      return;
    }
    image.addEventListener("error", () => markMissingImage(image), { once: true });
  }

  function switchImage(image, combo, animate = true) {
    if (!image || image.getAttribute("src") === combo.image) {
      if (image) image.alt = combo.alt;
      return;
    }

    const applyImage = () => {
      const frame = image.closest("figure");
      frame?.classList.remove("is-missing");
      image.hidden = false;
      image.src = combo.image;
      image.alt = combo.alt;
      image.classList.remove("is-switching");
    };

    if (!animate || reduceMotion) {
      applyImage();
      return;
    }

    image.classList.add("is-switching");
    const preload = new Image();
    preload.onload = applyImage;
    preload.onerror = () => image.classList.remove("is-switching");
    preload.src = combo.image;
  }

  function renderComboRows() {
    if (!comboRows) return;

    comboRows.innerHTML = combos.map((combo, index) => {
      const isOpen = combo.key === selectedKey;
      const headingId = `menuComboHeading${combo.key}`;
      const panelId = `menuComboPanel${combo.key}`;
      const items = combo.items.map(item => `<li>${item}</li>`).join("");

      return `
        <article class="menu-combo-row reveal${isOpen ? " is-open" : ""}" data-menu-row="${combo.key}">
          <button
            id="${headingId}"
            class="menu-combo-row__button"
            type="button"
            aria-expanded="${isOpen}"
            aria-controls="${panelId}"
            data-menu-row-toggle="${combo.key}"
          >
            <span class="menu-combo-row__number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
            <span class="menu-combo-row__heading">
              <small>${combo.badge}</small>
              <strong>${combo.name}</strong>
              <span>${combo.party}</span>
            </span>
            <span class="menu-combo-row__price" aria-label="Price ${combo.priceValue} rupees"><small>₹</small><strong>${combo.priceValue}</strong></span>
            <span class="menu-combo-row__toggle" aria-hidden="true"></span>
          </button>
          <div
            id="${panelId}"
            class="menu-combo-row__panel"
            role="region"
            aria-labelledby="${headingId}"
            aria-hidden="${!isOpen}"
            ${isOpen ? "" : "inert"}
          >
            <div class="menu-combo-row__panel-inner">
              <div class="menu-combo-row__panel-content">
                <ul>${items}</ul>
                <button class="menu-reserve-button" type="button" data-menu-reserve="${combo.key}" ${isOpen ? "" : "tabindex=\"-1\""}>
                  Reserve This Feast <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        </article>`;
    }).join("");

    document.dispatchEvent(new CustomEvent("kesar:observe-reveals", {
      detail: { nodes: comboRows.querySelectorAll(".reveal") }
    }));
  }

  function setOpenRow(key) {
    if (!comboRows) return;
    comboRows.querySelectorAll("[data-menu-row]").forEach(row => {
      const open = row.dataset.menuRow === key;
      const button = row.querySelector("[data-menu-row-toggle]");
      const panel = row.querySelector(".menu-combo-row__panel");
      const reserveButton = row.querySelector("[data-menu-reserve]");
      row.classList.toggle("is-open", open);
      button?.setAttribute("aria-expanded", String(open));
      panel?.setAttribute("aria-hidden", String(!open));
      if (panel) panel.inert = !open;
      if (reserveButton) reserveButton.tabIndex = open ? 0 : -1;
    });
  }

  function updateFeature(combo, animate) {
    if (!feature) return;
    feature.setAttribute("aria-labelledby", `menuParty${combo.key}`);
    feature.querySelector("[data-menu-feature-badge]").textContent = combo.badge;
    feature.querySelector("[data-menu-feature-name]").textContent = combo.name;
    feature.querySelector("[data-menu-feature-party]").textContent = combo.party;
    feature.querySelector("[data-menu-feature-price]").textContent = combo.priceValue;
    feature.querySelector(".menu-combo-feature__price")?.setAttribute("aria-label", `Price ${combo.priceValue} rupees`);
    const list = feature.querySelector("[data-menu-feature-items]");
    if (list) list.innerHTML = combo.items.map(item => `<li>${item}</li>`).join("");
    const reserveButton = feature.querySelector("[data-menu-reserve]");
    if (reserveButton) reserveButton.dataset.menuReserve = combo.key;
    switchImage(feature.querySelector("[data-menu-feature-image]"), combo, animate);

    if (animate && !reduceMotion) {
      feature.classList.add("is-changing");
      window.setTimeout(() => feature.classList.remove("is-changing"), 240);
    }
  }

  function updateComparison(combo, animate) {
    document.querySelector("[data-menu-comparison-badge]").textContent = combo.badge;
    document.querySelector("[data-menu-comparison-name]").textContent = combo.name;
    document.querySelector("[data-menu-comparison-party]").textContent = combo.party;
    document.querySelector("[data-menu-comparison-price]").textContent = combo.priceValue;
    switchImage(document.querySelector("[data-menu-comparison-image]"), combo, animate);
  }

  function updateMobileReserve(combo) {
    const name = mobileReserve?.querySelector("[data-menu-mobile-name]");
    const price = mobileReserve?.querySelector("[data-menu-mobile-price]");
    if (name) name.textContent = `${combo.name} · ${combo.selectorLabel}`;
    if (price) price.textContent = combo.price;
  }

  function selectCombo(key, { announce = true, animate = true, openRow = true } = {}) {
    const combo = comboByKey.get(String(key));
    if (!combo) return;
    selectedKey = combo.key;

    partyTabs.forEach(tab => {
      const selected = tab.dataset.menuParty === combo.key;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    updateFeature(combo, animate);
    updateComparison(combo, animate);
    updateMobileReserve(combo);
    if (openRow) setOpenRow(combo.key);
    if (announce && announcement) {
      announcement.textContent = `${combo.name} for ${combo.party}, ${combo.price}. ${combo.items.join(", ")}.`;
    }
  }

  function reserveCombo(key) {
    const combo = comboByKey.get(String(key)) || comboByKey.get(selectedKey);
    if (!combo) return;
    selectCombo(combo.key, { announce: false, animate: false });

    if (reservationGuests) {
      reservationGuests.value = combo.guests;
      reservationGuests.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const note = `Interested in the ${combo.name} for ${combo.party} — ${combo.price}.`;
    if (reservationNotes) {
      const current = reservationNotes.value.trim();
      if (!current) reservationNotes.value = note;
      else if (!current.includes(note)) reservationNotes.value = `${current}\n${note}`;
    }

    showMenuToast(`${combo.name} for ${combo.party} selected. Complete your reservation below.`);
    reservation?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });

    window.setTimeout(() => {
      const incomplete = reservationForm
        ? [...reservationForm.querySelectorAll("[required]")].find(field => !String(field.value || "").trim())
        : null;
      incomplete?.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 650);
  }

  renderComboRows();
  selectCombo(selectedKey, { announce: false, animate: false });

  partyTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectCombo(tab.dataset.menuParty));
    tab.addEventListener("keydown", event => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % partyTabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + partyTabs.length) % partyTabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = partyTabs.length - 1;
      else return;
      event.preventDefault();
      partyTabs[nextIndex].focus();
      selectCombo(partyTabs[nextIndex].dataset.menuParty);
    });
  });

  comboRows?.addEventListener("click", event => {
    const toggle = event.target.closest("[data-menu-row-toggle]");
    if (toggle) {
      const key = toggle.dataset.menuRowToggle;
      selectCombo(key);
      setOpenRow(key);
      return;
    }

    const reserveButton = event.target.closest("[data-menu-reserve]");
    if (reserveButton) reserveCombo(reserveButton.dataset.menuReserve);
  });

  feature?.addEventListener("click", event => {
    const button = event.target.closest("[data-menu-reserve]");
    if (button) reserveCombo(button.dataset.menuReserve);
  });

  mobileReserve?.querySelector("[data-menu-mobile-reserve]")?.addEventListener("click", () => reserveCombo(selectedKey));

  const dishTabs = [...document.querySelectorAll("[data-menu-dish-tab]")];
  const dishPanels = [...document.querySelectorAll("[data-menu-dish-panel]")];
  const dishTrack = document.getElementById("menuDishTrack");
  const dishPrev = document.getElementById("menuDishPrev");
  const dishNext = document.getElementById("menuDishNext");

  function updateCarouselControls() {
    if (!dishTrack || !dishPrev || !dishNext) return;
    const maxScroll = Math.max(dishTrack.scrollWidth - dishTrack.clientWidth, 0);
    dishPrev.disabled = dishTrack.scrollLeft <= 4;
    dishNext.disabled = dishTrack.scrollLeft >= maxScroll - 4;
  }

  function setDishCollection(collection, focus = false) {
    dishTabs.forEach(tab => {
      const selected = tab.dataset.menuDishTab === collection;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    dishPanels.forEach(panel => {
      panel.hidden = panel.dataset.menuDishPanel !== collection;
    });
    if (collection === "nonveg") window.requestAnimationFrame(updateCarouselControls);
  }

  dishTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setDishCollection(tab.dataset.menuDishTab));
    tab.addEventListener("keydown", event => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % dishTabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + dishTabs.length) % dishTabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = dishTabs.length - 1;
      else return;
      event.preventDefault();
      setDishCollection(dishTabs[nextIndex].dataset.menuDishTab, true);
    });
  });

  function scrollDishes(direction) {
    if (!dishTrack) return;
    dishTrack.scrollBy({ left: direction * dishTrack.clientWidth * 0.82, behavior: reduceMotion ? "auto" : "smooth" });
  }

  dishPrev?.addEventListener("click", () => scrollDishes(-1));
  dishNext?.addEventListener("click", () => scrollDishes(1));
  dishTrack?.addEventListener("scroll", updateCarouselControls, { passive: true });
  dishTrack?.addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    scrollDishes(event.key === "ArrowLeft" ? -1 : 1);
  });
  window.addEventListener("resize", updateCarouselControls, { passive: true });
  window.requestAnimationFrame(updateCarouselControls);

  const dishDialog = document.getElementById("menuDishDialog");
  const dialogImage = dishDialog?.querySelector("[data-menu-dialog-image]");
  let dialogTrigger = null;
  let restoreDialogFocus = true;

  function closeDishDialog(restoreFocus = true) {
    if (!dishDialog?.open) return;
    restoreDialogFocus = restoreFocus;
    dishDialog.close();
  }

  document.querySelectorAll("[data-menu-dish-details]").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-menu-dish]");
      const cardImage = card?.querySelector("img");
      const category = card?.querySelector(".menu-dish-card__body > span")?.textContent?.trim() || "Signature dish";
      const title = card?.querySelector("h3")?.textContent?.trim() || "Kesar signature dish";
      const description = card?.querySelector(".menu-dish-card__body > p")?.textContent?.trim() || "";
      const pairing = card?.dataset.menuPairing || "";
      if (!dishDialog || !cardImage) return;

      dishDialog.querySelector("[data-menu-dialog-category]").textContent = category;
      dishDialog.querySelector("[data-menu-dialog-title]").textContent = title;
      dishDialog.querySelector("[data-menu-dialog-description]").textContent = description;
      dishDialog.querySelector("[data-menu-dialog-pairing]").textContent = pairing;
      if (dialogImage) {
        dialogImage.hidden = false;
        dialogImage.closest("figure")?.classList.remove("is-missing");
        dialogImage.src = cardImage.currentSrc || cardImage.src;
        dialogImage.alt = cardImage.alt;
      }
      dialogTrigger = button;
      restoreDialogFocus = true;
      document.body.classList.add("menu-modal-open");
      dishDialog.showModal();
      dishDialog.querySelector("[data-menu-dialog-close]")?.focus();
    });
  });

  dishDialog?.querySelector("[data-menu-dialog-close]")?.addEventListener("click", () => closeDishDialog());
  dishDialog?.querySelector("[data-menu-dialog-reserve]")?.addEventListener("click", () => closeDishDialog(false));
  dishDialog?.addEventListener("click", event => {
    if (event.target === dishDialog) closeDishDialog();
  });
  dishDialog?.addEventListener("close", () => {
    document.body.classList.remove("menu-modal-open");
    if (restoreDialogFocus) dialogTrigger?.focus({ preventScroll: true });
  });

  document.querySelectorAll("[data-menu-chapter] img, [data-menu-dialog-image]").forEach(watchImage);

  const menuStart = document.getElementById("menu");
  const menuEnd = document.getElementById("menu-reservation");
  let mobileBarFrame = 0;

  function updateMobileBar() {
    mobileBarFrame = 0;
    if (!mobileReserve || !menuStart || !menuEnd) return;
    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    const startRect = menuStart.getBoundingClientRect();
    const endRect = menuEnd.getBoundingClientRect();
    const withinMenu = startRect.top <= window.innerHeight * 0.55 && endRect.bottom > 90;
    mobileReserve.hidden = !(isMobile && withinMenu);
  }

  function scheduleMobileBar() {
    if (!mobileBarFrame) mobileBarFrame = window.requestAnimationFrame(updateMobileBar);
  }

  updateMobileBar();
  window.addEventListener("scroll", scheduleMobileBar, { passive: true });
  window.addEventListener("resize", scheduleMobileBar, { passive: true });
})();
