(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const OPEN_MINUTES = 12 * 60 + 30;
  const CLOSE_MINUTES = 23 * 60;
  const HOURS_LABEL = "12:30 PM–11:00 PM";

  const combos = {
    "2": {
      name: "Mandi Combo",
      party: "2 People",
      label: "2 People",
      price: "₹499",
      badge: "Perfect for Two",
      image: "/assets/images/mandicombo-2ppl.png",
      alt: "Mandi feast for two",
      guests: "2 guests",
      items: [
        "Half Al Faham Chicken",
        "Unlimited mandi rice on selected dine-in combinations",
        "2 Boiled Eggs",
        "2 Soft Drinks"
      ]
    },
    "5": {
      name: "Mandi Combo",
      party: "4 to 5 People",
      label: "4–5 People",
      price: "₹1,199",
      badge: "Most Popular",
      image: "/assets/images/mandicombo-5-6ppl.png",
      alt: "Mandi feast for four to five people",
      guests: "5 guests",
      items: [
        "Half Al Faham Chicken",
        "Half Tandoori Chicken",
        "8 Pc Chicken Kabab",
        "Unlimited mandi rice on selected dine-in combinations",
        "5 Soft Drinks"
      ]
    },
    "6": {
      name: "Family Mandi Feast",
      party: "6 People",
      label: "6 People",
      price: "₹1,499",
      badge: "Family Favourite",
      image: "/assets/images/familymandifest-6ppl.png",
      alt: "Family mandi feast for six people",
      guests: "6 guests",
      items: [
        "Full Al Faham Chicken",
        "12 Pc Chicken Kabab",
        "Unlimited mandi rice on selected dine-in combinations",
        "6 Soft Drinks"
      ]
    },
    "8": {
      name: "Mandi Combo",
      party: "8 People",
      label: "8 People",
      price: "₹1,999",
      badge: "Made for Gatherings",
      image: "/assets/images/mandicombo-8ppl.png",
      alt: "Mandi feast for eight people",
      guests: "7+ guests",
      items: [
        "Half Tandoori Chicken",
        "Half Al Faham Chicken",
        "8 Pc Chicken Kabab",
        "Unlimited mandi rice on selected dine-in combinations",
        "8 Soft Drinks"
      ]
    },
    "10": {
      name: "Royal Mandi Platter",
      party: "10 People",
      label: "10 People",
      price: "₹2,499",
      badge: "The Complete Feast",
      image: "/assets/images/royalmandiplatter-10ppl.png",
      alt: "Royal mandi platter for ten people",
      guests: "7+ guests",
      items: [
        "Full Al Faham Chicken",
        "Full Tandoori Chicken",
        "16 Pc Chicken Kabab",
        "Unlimited mandi rice on selected dine-in combinations",
        "10 Soft Drinks"
      ]
    }
  };

  let selectedCombo = "5";
  let lastDishTrigger = null;

  const clock = total => {
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const bengaluruParts = (date = new Date()) => Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date).map(part => [part.type, part.value])
  );

  function bengaluruDateString(date = new Date()) {
    const parts = bengaluruParts(date);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function updateStatus() {
    const parts = bengaluruParts();
    const current = Number(parts.hour) * 60 + Number(parts.minute);
    const isOpen = current >= OPEN_MINUTES && current < CLOSE_MINUTES;
    const status = isOpen
      ? "Open now · closes at 11:00 PM"
      : current < OPEN_MINUTES
        ? "Closed now · opens today at 12:30 PM"
        : "Closed now · opens tomorrow at 12:30 PM";

    if ($("#statusText")) $("#statusText").textContent = status;
    if ($("#liveTime")) {
      const hour = Number(parts.hour);
      $("#liveTime").textContent = `${hour % 12 || 12}:${parts.minute} ${hour >= 12 ? "PM" : "AM"} · Bengaluru time`;
    }
    $("#heroStatus")?.classList.toggle("open", isOpen);
    if ($("#todayHours")) $("#todayHours").textContent = `Today · ${HOURS_LABEL} · Bengaluru time`;
    if ($("#compactHours")) $("#compactHours").textContent = `Today · ${HOURS_LABEL} · Bengaluru time`;
    if ($("#footerToday")) $("#footerToday").textContent = HOURS_LABEL;
  }

  function selectCombo(key, announce = true) {
    const combo = combos[key];
    if (!combo) return;
    selectedCombo = key;

    $$("[data-party]").forEach(tab => {
      const active = tab.dataset.party === key;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    const values = {
      featuredBadge: combo.badge,
      featuredName: combo.name,
      featuredParty: combo.party,
      featuredPrice: combo.price,
      summaryBadge: combo.badge,
      summaryName: combo.name,
      summaryParty: combo.party,
      summaryPrice: combo.price,
      mobileComboName: `${combo.name} · ${combo.label}`,
      mobileComboPrice: combo.price
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });

    [$("#featuredImage"), $("#summaryImage")].filter(Boolean).forEach(image => {
      image.src = combo.image;
      image.alt = combo.alt;
    });

    const items = $("#featuredItems");
    if (items) items.replaceChildren(...combo.items.map(item => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      return listItem;
    }));

    $$(".combo-row").forEach(row => {
      const active = row.dataset.combo === key;
      row.classList.toggle("open", active);
      $("button", row)?.setAttribute("aria-expanded", String(active));
    });

    if (announce) {
      $("#featuredCombo")?.setAttribute("aria-label", `${combo.name}, ${combo.party}, ${combo.price}`);
    }
  }

  function reserveSelected(key = selectedCombo) {
    const combo = combos[key];
    if (!combo) return;
    selectCombo(key, false);

    const guests = $("#guests");
    const notes = $("#message");
    if (guests) guests.value = combo.guests;
    if (notes) {
      const note = `Interested in the ${combo.name} for ${combo.party} — ${combo.price}.`;
      if (!notes.value.includes(note)) notes.value = `${notes.value.trim()}${notes.value.trim() ? "\n" : ""}${note}`;
    }

    const reservation = $("#reservation");
    if (!reservation?.hidden) {
      reservation.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      setTimeout(() => $("#name")?.focus({ preventScroll: true }), reducedMotion ? 0 : 500);
    }
  }

  function setDishTab(name, focus = false) {
    $$("[data-dish-tab]").forEach(tab => {
      const active = tab.dataset.dishTab === name;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    $$("[data-dish-panel]").forEach(panel => {
      panel.hidden = panel.dataset.dishPanel !== name;
    });
    requestAnimationFrame(updateMobileReserve);
  }

  function openDish(card, trigger) {
    const dialog = $("#dishDialog");
    const sourceImage = $("img", card);
    if (!dialog || !sourceImage) return;
    lastDishTrigger = trigger;
    const image = $("#dialogImage");
    if (image) {
      image.src = sourceImage.currentSrc || sourceImage.src;
      image.alt = sourceImage.alt;
    }
    if ($("#dialogCategory")) $("#dialogCategory").textContent = card.dataset.category || "Signature dish";
    if ($("#dialogTitle")) $("#dialogTitle").textContent = card.dataset.title || "KESAR dish";
    if ($("#dialogCopy")) $("#dialogCopy").textContent = card.dataset.copy || "";
    if ($("#dialogPairing")) $("#dialogPairing").textContent = card.dataset.pairing || "";
    document.body.classList.add("dialog-open");
    if (!dialog.open) dialog.showModal();
    $(".dialog-close", dialog)?.focus();
  }

  function closeDish(restoreFocus = true) {
    const dialog = $("#dishDialog");
    if (dialog?.open) dialog.close();
    document.body.classList.remove("dialog-open");
    if (restoreFocus) lastDishTrigger?.focus();
  }

  function populateTimes() {
    const date = $("#date");
    const select = $("#time");
    if (!date || !select) return;
    select.replaceChildren(new Option("Choose a time", ""));
    if (!date.value) {
      select.disabled = true;
      return;
    }
    for (let total = OPEN_MINUTES; total <= CLOSE_MINUTES - 30; total += 30) {
      select.add(new Option(clock(total), `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`));
    }
    select.disabled = false;
  }

  function setupDishRail(track, previous, next) {
    if (!track || !previous || !next || track.dataset.railReady === "true") return;
    track.dataset.railReady = "true";
    track.querySelectorAll("img").forEach(image => {
      image.draggable = false;
      image.addEventListener("error", () => {
        image.hidden = true;
        console.warn(`KESAR image failed to load: ${image.getAttribute("src")}`);
      }, { once: true });
    });

    const step = () => {
      const card = $(".dish-card", track);
      const gap = parseFloat(getComputedStyle(track).gap || "18");
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.82;
    };
    const maximum = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const update = () => {
      previous.disabled = track.scrollLeft <= 3;
      next.disabled = track.scrollLeft >= maximum() - 3;
    };

    previous.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: reducedMotion ? "auto" : "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: reducedMotion ? "auto" : "smooth" }));
    track.addEventListener("scroll", update, { passive: true });
    track.addEventListener("wheel", event => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || maximum() <= 1) return;
      const movingForward = event.deltaY > 0;
      const canMove = movingForward ? track.scrollLeft < maximum() - 1 : track.scrollLeft > 1;
      if (!canMove) return;
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    }, { passive: false });
    track.addEventListener("keydown", event => {
      if (event.key === "ArrowRight") track.scrollBy({ left: step(), behavior: reducedMotion ? "auto" : "smooth" });
      else if (event.key === "ArrowLeft") track.scrollBy({ left: -step(), behavior: reducedMotion ? "auto" : "smooth" });
      else if (event.key === "Home") track.scrollTo({ left: 0, behavior: reducedMotion ? "auto" : "smooth" });
      else if (event.key === "End") track.scrollTo({ left: maximum(), behavior: reducedMotion ? "auto" : "smooth" });
      else return;
      event.preventDefault();
    });

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    track.addEventListener("pointerdown", event => {
      if (event.pointerType === "touch" || event.button !== 0 || event.target.closest("button,a,input,select,textarea,label")) return;
      dragging = true;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture?.(event.pointerId);
    });
    track.addEventListener("pointermove", event => {
      if (dragging) track.scrollLeft = startScroll - (event.clientX - startX);
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(name => {
      track.addEventListener(name, () => {
        dragging = false;
        track.classList.remove("is-dragging");
        update();
      });
    });

    if ("ResizeObserver" in window) new ResizeObserver(update).observe(track);
    else addEventListener("resize", update, { passive: true });
    requestAnimationFrame(update);
  }

  function updateMobileReserve() {
    const bar = $("#mobileReserve");
    const start = $("#menu");
    const stop = $("#signature-dishes");
    if (!bar || !start || !stop) return;
    const mobile = matchMedia("(max-width: 700px)").matches;
    const inComboRange = start.getBoundingClientRect().top <= innerHeight * 0.56
      && stop.getBoundingClientRect().top > innerHeight * 0.42;
    const menuOpen = $("#mobileMenu")?.classList.contains("open");
    bar.hidden = !(mobile && inComboRange && !menuOpen);
  }

  function setupMenu() {
    const header = $("#siteHeader");
    const menuToggle = $("#menuToggle");
    const mobileMenu = $("#mobileMenu");
    if (!menuToggle || !mobileMenu) return;

    const setMenu = open => {
      mobileMenu.classList.toggle("open", open);
      mobileMenu.toggleAttribute("inert", !open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.textContent = open ? "Close" : "Menu";
      document.body.classList.toggle("menu-open", open);
      updateMobileReserve();
      if (open) requestAnimationFrame(() => $("a", mobileMenu)?.focus());
    };

    menuToggle.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
    $$("a", mobileMenu).forEach(link => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && mobileMenu.classList.contains("open")) {
        setMenu(false);
        menuToggle.focus();
      }
    });

    addEventListener("scroll", () => {
      header?.classList.toggle("scrolled", scrollY > 35);
      const max = document.documentElement.scrollHeight - innerHeight;
      if ($("#progress")) $("#progress").style.width = `${max ? scrollY / max * 100 : 0}%`;
      updateMobileReserve();
    }, { passive: true });
    addEventListener("resize", updateMobileReserve, { passive: true });
  }

  function setupEntranceMotion() {
    const reveals = $$(".reveal:not(.story-reveal)");
    const bulk = $("#bulk-orders");
    const why = $("#why-kesar-page");

    if (reducedMotion || !("IntersectionObserver" in window)) {
      reveals.forEach(element => element.classList.add("visible"));
      bulk?.classList.add("is-visible");
      why?.classList.add("is-visible");
      return;
    }

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    reveals.forEach(element => revealObserver.observe(element));

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        sectionObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    [bulk, why].filter(Boolean).forEach(section => sectionObserver.observe(section));

    document.body.classList.add("motion-ready");
  }

  setupMenu();
  selectCombo(selectedCombo, false);

  $$("[data-party]").forEach((tab, index, tabs) => {
    tab.addEventListener("click", () => selectCombo(tab.dataset.party));
    tab.addEventListener("keydown", event => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus();
      selectCombo(tabs[next].dataset.party);
    });
  });

  $("#comboAccordion")?.addEventListener("click", event => {
    const reserve = event.target.closest("[data-row-reserve]");
    if (reserve) {
      reserveSelected(reserve.dataset.rowReserve);
      return;
    }
    const row = event.target.closest(".combo-row");
    if (row) selectCombo(row.dataset.combo);
  });
  $("[data-reserve-combo]")?.addEventListener("click", () => reserveSelected());
  $("#mobileReserveButton")?.addEventListener("click", () => reserveSelected());

  $$("[data-dish-tab]").forEach((tab, index, tabs) => {
    tab.addEventListener("click", () => setDishTab(tab.dataset.dishTab));
    tab.addEventListener("keydown", event => {
      let next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
      else return;
      event.preventDefault();
      setDishTab(tabs[next].dataset.dishTab, true);
    });
  });
  $$("[data-details]").forEach(button => {
    button.addEventListener("click", () => openDish(button.closest(".dish-card"), button));
  });
  $(".dialog-close")?.addEventListener("click", () => closeDish());
  $("#dishDialog")?.addEventListener("click", event => {
    if (event.target === $("#dishDialog")) closeDish();
  });
  $("#dishDialog")?.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
  });
  $("#dialogReserve")?.addEventListener("click", () => closeDish(false));

  setupDishRail($("#dishTrack"), $("#dishPrev"), $("#dishNext"));
  setupDishRail($("#vegDishTrack"), $("#vegDishPrev"), $("#vegDishNext"));

  const date = $("#date");
  if (date) {
    date.min = bengaluruDateString();
    date.max = bengaluruDateString(new Date(Date.now() + 90 * 86400000));
    date.addEventListener("change", populateTimes);
  }
  $("#reservationForm")?.addEventListener("submit", event => event.preventDefault());

  document.querySelectorAll("[data-delivery-platform]").forEach(link => {
    link.addEventListener("click", () => {
      window.dataLayer?.push({ event: "delivery_platform_click", platform: link.dataset.deliveryPlatform });
    });
  });

  if ($("#year")) $("#year").textContent = new Date().getFullYear();
  updateStatus();
  setInterval(updateStatus, 30000);
  updateMobileReserve();
  setupEntranceMotion();
})();
