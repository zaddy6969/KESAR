(() => {
  "use strict";

  const MODAL_ID = "reservationModal";
  const TRIGGER_SELECTOR = [
    'a[href="#reservation"]',
    '[data-open-reservation]',
    '[data-reserve-combo]',
    '[data-row-reserve]',
    '[data-reservation-trigger]',
    '[data-reservation]',
    '#mobileReserveButton',
    '#dialogReserve',
    '.nav-reserve',
    '.kesar-mobile-actions__reserve'
  ].join(",");

  const FEAST_TRIGGER_SELECTOR = '[data-reserve-combo],[data-row-reserve],#mobileReserveButton';
  const WHATSAPP = "918951919010";
  const EMAIL = "hotelkesar41@gmail.com";
  const GUESTS_BY_COMBO = {
    "2": "2 guests",
    "5": "5 guests",
    "6": "6 guests",
    "8": "7+ guests",
    "10": "7+ guests"
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  let modal = null;
  let panel = null;
  let form = null;
  let returnFocus = null;
  let lockedScrollY = 0;
  let mounted = false;
  let selectedFeast = null;

  function bengaluruDateString(date = new Date()) {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).formatToParts(date).map(part => [part.type, part.value])
    );
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function readableDate(value) {
    if (!value) return "";
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(new Date(Date.UTC(year, month - 1, day, 12)));
  }

  function setFieldError(field, message) {
    if (!field) return;
    field.setAttribute("aria-invalid", String(Boolean(message)));
    const error = field.closest(".field")?.querySelector(".error");
    if (error) error.textContent = message;
  }

  function experienceInputs() {
    return $$('input[name="diningExperience"]', form);
  }

  function selectedExperience() {
    return $('input[name="diningExperience"]:checked', form)?.value || "";
  }

  function setExperienceError(message = "") {
    const group = $(".reservation-experience", form);
    const error = $("#diningExperienceError", form);
    group?.setAttribute("aria-invalid", String(Boolean(message)));
    if (error) error.textContent = message;
  }

  function validateExperience() {
    if (selectedExperience()) {
      setExperienceError("");
      return true;
    }
    setExperienceError("Choose Mandi House or Dining.");
    experienceInputs()[0]?.focus({ preventScroll: true });
    $(".reservation-experience", form)?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    return false;
  }

  function validateForm() {
    if (!form) return false;

    const checks = [
      [$("#name", form), "Please enter your name."],
      [$("#phone", form), "Please enter your phone number."],
      [$("#date", form), "Please choose a reservation date."],
      [$("#time", form), "Please choose a reservation time."],
      [$("#guests", form), "Please choose the number of guests."]
    ];

    let firstInvalid = null;

    checks.forEach(([field, requiredMessage]) => {
      if (!field) return;
      const value = field.value.trim();
      let message = value ? "" : requiredMessage;

      if (!message && field.id === "phone") {
        const digits = value.replace(/\D/g, "").slice(-10);
        if (!/^[6-9]\d{9}$/.test(digits)) {
          message = "Enter a valid 10-digit Indian mobile number.";
        }
      }

      if (!message && field.id === "date" && value < bengaluruDateString()) {
        message = "Choose today or a future date in Bengaluru.";
      }

      setFieldError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });

    const experienceValid = Boolean(selectedExperience());
    if (!experienceValid) setExperienceError("Choose Mandi House or Dining.");
    else setExperienceError("");

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    if (!experienceValid) return validateExperience();
    return true;
  }

  function reservationDetails() {
    const time = $("#time", form);
    return {
      name: $("#name", form)?.value.trim() || "Guest",
      phone: $("#phone", form)?.value.trim() || "",
      date: readableDate($("#date", form)?.value || ""),
      time: time?.selectedOptions?.[0]?.textContent?.trim() || time?.value || "",
      diningExperience: selectedExperience(),
      guests: $("#guests", form)?.value || "",
      occasion: $("#occasion", form)?.value.trim() || "",
      notes: $("#message", form)?.value.trim() || "",
      feast: selectedFeast
    };
  }

  function reservationMessage() {
    const data = reservationDetails();
    const lines = [
      "Hello KESAR, I would like to request a table reservation.",
      "",
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Date: ${data.date}`,
      `Time: ${data.time}`,
      `Dining Experience: ${data.diningExperience}`,
      `Guests: ${data.guests}`
    ];

    if (data.occasion) lines.push(`Occasion: ${data.occasion}`);
    if (data.feast) {
      lines.push(
        `Selected Feast: ${data.feast.name} for ${data.feast.party} — ${data.feast.price}`
      );
    }
    if (data.notes) lines.push(`Notes: ${data.notes}`);

    lines.push("", "Please check availability and confirm this reservation.");
    return lines.join("\n");
  }

  function openExternal(url) {
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (!popup) window.location.href = url;
  }

  function sendReservation(type) {
    if (!validateForm()) return;

    const data = reservationDetails();
    const message = reservationMessage();

    if (type === "whatsapp") {
      openExternal(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`);
      window.dataLayer?.push({
        event: "reservation_modal_whatsapp",
        guests: data.guests,
        dining_experience: data.diningExperience,
        selected_feast: data.feast?.name || ""
      });
    } else {
      openExternal(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}` +
        `&su=${encodeURIComponent("KESAR Table Reservation Request")}` +
        `&body=${encodeURIComponent(message)}`
      );
      window.dataLayer?.push({
        event: "reservation_modal_email",
        guests: data.guests,
        dining_experience: data.diningExperience,
        selected_feast: data.feast?.name || ""
      });
    }

    setTimeout(closeModal, 120);
  }

  function comboKeyFromTrigger(trigger) {
    if (trigger?.dataset?.rowReserve) return trigger.dataset.rowReserve;
    if (trigger?.dataset?.combo) return trigger.dataset.combo;
    return $('[data-party][aria-selected="true"]')?.dataset.party || "";
  }

  function comboDetails(key) {
    const escaped = window.CSS?.escape ? CSS.escape(key) : key.replace(/"/g, '\\"');
    const row = key ? $(`.combo-row[data-combo="${escaped}"]`) : null;

    if (row) {
      const smalls = $$("small", row);
      return {
        name: $("strong", row)?.textContent.trim() || "Mandi Combo",
        party: smalls.at(-1)?.textContent.trim() || "",
        price: $(".row-price", row)?.textContent.trim() || "",
        guests: GUESTS_BY_COMBO[key] || ""
      };
    }

    return {
      name: $("#featuredName")?.textContent.trim() || "Mandi Combo",
      party: $("#featuredParty")?.textContent.trim() || "",
      price: $("#featuredPrice")?.textContent.trim() || "",
      guests: GUESTS_BY_COMBO[key] || ""
    };
  }

  function updateFeastStrip() {
    const strip = $("#reservationSelectedFeast", modal);
    if (!strip) return;

    if (!selectedFeast) {
      strip.hidden = true;
      strip.setAttribute("aria-hidden", "true");
      return;
    }

    $(".reservation-selected-feast__title", strip).textContent = selectedFeast.name;
    $(".reservation-selected-feast__meta", strip).textContent =
      `${selectedFeast.party} · ${selectedFeast.price}`;
    strip.hidden = false;
    strip.setAttribute("aria-hidden", "false");
  }

  function chooseExperience(value) {
    experienceInputs().forEach(input => {
      input.checked = input.value === value;
    });
    setExperienceError("");
  }

  function resetReservationContext() {
    selectedFeast = null;
    updateFeastStrip();
    experienceInputs().forEach(input => {
      input.checked = false;
    });
    setExperienceError("");
  }

  function prefillFeast(trigger) {
    if (!trigger?.matches?.(FEAST_TRIGGER_SELECTOR)) {
      resetReservationContext();
      return;
    }

    const key = comboKeyFromTrigger(trigger);
    selectedFeast = comboDetails(key);

    const guests = $("#guests", form);
    if (guests && selectedFeast.guests) guests.value = selectedFeast.guests;

    chooseExperience("Mandi House");
    updateFeastStrip();
  }

  function transformExistingForm() {
    if (!form) return;

    const occasion = $("#occasion", form);
    if (occasion) {
      const previousValue = occasion.value;
      const options = [
        ["", "Select an occasion"],
        ["Birthday", "Birthday"],
        ["Anniversary", "Anniversary"],
        ["Kitty Party", "Kitty Party"],
        ["Family Gathering", "Family Gathering"],
        ["Business Dinner", "Business Dinner"],
        ["Private Event", "Private Event"],
        ["Other", "Other"]
      ];

      occasion.innerHTML = "";
      options.forEach(([value, label]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        occasion.append(option);
      });

      occasion.required = false;
      occasion.removeAttribute("required");
      occasion.value = previousValue && previousValue !== "Dining" &&
        options.some(([value]) => value === previousValue)
        ? previousValue
        : "";
    }

    let experience = $(".reservation-experience", form);
    if (!experience) {
      experience = document.createElement("fieldset");
      experience.className = "reservation-experience field--full";
      experience.setAttribute("aria-describedby", "diningExperienceError");
      experience.innerHTML = `
        <legend>Choose Dining Experience</legend>
        <div class="reservation-experience__options">
          <label class="reservation-experience__option">
            <input
              id="diningExperienceMandi"
              type="radio"
              name="diningExperience"
              value="Mandi House"
              required
            >
            <span class="reservation-experience__content">
              <strong>Mandi House</strong>
              <small>Traditional mandi and shared feasts</small>
            </span>
          </label>
          <label class="reservation-experience__option">
            <input
              id="diningExperienceDining"
              type="radio"
              name="diningExperience"
              value="Dining"
              required
            >
            <span class="reservation-experience__content">
              <strong>Dining</strong>
              <small>Regular restaurant table reservation</small>
            </span>
          </label>
        </div>
        <span class="error" id="diningExperienceError" aria-live="polite"></span>`;

      const guestsField = $("#guests", form)?.closest(".field");
      if (guestsField) guestsField.before(experience);
      else form.prepend(experience);
    }

    experienceInputs().forEach(input => {
      if (input.dataset.kesarExperienceBound === "true") return;
      input.dataset.kesarExperienceBound = "true";
      input.addEventListener("change", () => setExperienceError(""));
    });

    const notesField = $("#message", form)?.closest(".field");
    notesField?.classList.add("full");
    notesField?.classList.remove("half");

    let feastStrip = $("#reservationSelectedFeast", form);
    if (!feastStrip) {
      feastStrip = document.createElement("div");
      feastStrip.id = "reservationSelectedFeast";
      feastStrip.className = "reservation-selected-feast field--full";
      feastStrip.hidden = true;
      feastStrip.setAttribute("aria-hidden", "true");
      feastStrip.innerHTML = `
        <span class="reservation-selected-feast__label">Selected feast</span>
        <div>
          <strong class="reservation-selected-feast__title"></strong>
          <small class="reservation-selected-feast__meta"></small>
        </div>
        <span class="reservation-selected-feast__check" aria-hidden="true">✓</span>`;

      const submit = $(".submit-row", form);
      if (submit) submit.before(feastStrip);
      else form.append(feastStrip);
    }

    const whatsappAction = $('[data-reservation-action="whatsapp"]', form);
    const emailAction = $('[data-reservation-action="email"]', form);
    if (whatsappAction) whatsappAction.textContent = "WhatsApp Reservation";
    if (emailAction) emailAction.textContent = "Email Reservation";

    const helper = $(".submit-row > p", form);
    if (helper) {
      helper.textContent =
        "Complete the required details. Hotel KESAR will confirm availability after receiving your request.";
    }
  }

  function closeMenusAndDialogs() {
    const mobileMenu = $("#mobileMenu");
    const menuToggle = $("#menuToggle");

    if (mobileMenu?.classList.contains("open")) {
      mobileMenu.classList.remove("open");
      mobileMenu.setAttribute("aria-hidden", "true");
      menuToggle?.setAttribute("aria-expanded", "false");
      if (menuToggle) menuToggle.textContent = "Menu";
      document.body.classList.remove("menu-open");
    }

    const dishDialog = $("#dishDialog");
    if (dishDialog?.open) {
      dishDialog.close();
      document.body.classList.remove("dialog-open");
    }
  }

  function lockPage() {
    lockedScrollY = window.scrollY;
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.classList.add("reservation-modal-open");
  }

  function unlockPage() {
    document.body.classList.remove("reservation-modal-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, lockedScrollY);
  }

  function openModal(trigger = null) {
    if (!modal || !form) return;

    closeMenusAndDialogs();
    returnFocus = trigger instanceof HTMLElement ? trigger : document.activeElement;
    prefillFeast(trigger);
    lockPage();

    modal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      modal.classList.add("is-open");
      setTimeout(() => $("#name", form)?.focus({ preventScroll: true }), 90);
    });

    window.dataLayer?.push({
      event: "reservation_modal_open",
      source: trigger?.id || trigger?.className || "unknown",
      selected_feast: selectedFeast?.name || ""
    });
  }

  function closeModal() {
    if (!modal?.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    unlockPage();

    setTimeout(() => {
      if (returnFocus instanceof HTMLElement && document.contains(returnFocus)) {
        returnFocus.focus({ preventScroll: true });
      }
    }, 80);
  }

  function focusable() {
    if (!panel) return [];
    return $$(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
      'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      panel
    ).filter(element => !element.hidden && element.getClientRects().length);
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || !modal?.classList.contains("is-open")) return;

    const items = focusable();
    if (!items.length) return;

    const first = items[0];
    const last = items.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function markTriggers(root = document) {
    $$(TRIGGER_SELECTOR, root).forEach(trigger => {
      trigger.setAttribute("data-open-reservation", "");
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-controls", MODAL_ID);
    });
  }

  function handleDocumentClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const action = target.closest("[data-reservation-action]");
    if (action && modal?.contains(action)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      sendReservation(action.dataset.reservationAction);
      return;
    }

    const close = target.closest("[data-close-reservation]");
    if (close && modal?.contains(close)) {
      event.preventDefault();
      closeModal();
      return;
    }

    const trigger = target.closest(TRIGGER_SELECTOR);
    if (!trigger || modal?.contains(trigger)) return;
    if (event.type === "click" && event.button !== 0) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    openModal(trigger);
  }

  function createModal() {
    const source = $("#reservation");
    form = $("#reservationForm");

    if (!source || !form || $("#" + MODAL_ID)) return false;

    transformExistingForm();

    modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "reservation-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="reservation-modal__backdrop" data-close-reservation></div>
      <section
        class="reservation-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservationModalTitle"
        aria-describedby="reservationModalDescription"
      >
        <button
          class="reservation-modal__close"
          type="button"
          data-close-reservation
          aria-label="Close table reservation"
        >×</button>

        <div class="reservation-modal__intro">
          <div>
            <span class="reservation-modal__brand">Hotel KESAR</span>
            <span class="reservation-modal__eyebrow">Table reservations</span>
            <h2 class="reservation-modal__title" id="reservationModalTitle">
              Reserve<br>your table.
            </h2>
            <p class="reservation-modal__copy" id="reservationModalDescription">
              Choose your date, time and preferred dining experience.
              Our team will confirm availability through WhatsApp or email.
            </p>
          </div>
          <div class="reservation-modal__hours">
            <span>Daily service</span>
            <strong>12:30 PM–11:00 PM · Bengaluru</strong>
          </div>
        </div>

        <div class="reservation-modal__form-shell">
          <div class="reservation-modal__form-host"></div>
          <p class="reservation-modal__confirmation">
            A reservation request is not an automatic confirmation. Your table is confirmed
            only after Hotel KESAR replies with availability.
          </p>
        </div>
      </section>`;

    document.body.append(modal);
    panel = $(".reservation-modal__panel", modal);
    $(".reservation-modal__form-host", modal).append(form);

    source.classList.add("reservation-modal-source");
    source.hidden = true;
    source.setAttribute("aria-hidden", "true");

    form.classList.add("visible");
    form.querySelectorAll(".reveal").forEach(element => element.classList.add("visible"));
    markTriggers();

    document.addEventListener("click", handleDocumentClick, true);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        event.preventDefault();
        closeModal();
        return;
      }
      trapFocus(event);
    });

    const observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches(TRIGGER_SELECTOR)) markTriggers(node.parentElement || document);
          else markTriggers(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    if (location.hash === "#reservation") {
      history.replaceState(null, "", location.pathname + location.search);
      setTimeout(() => openModal(null), 120);
    }

    mounted = true;
    return true;
  }

  function initialize(attempt = 0) {
    if (mounted) return;

    const ready =
      $("#reservationForm") &&
      $("#comboAccordion .combo-row") &&
      $("#reservationForm .reservation-submit-actions");

    if (!ready && attempt < 140) {
      setTimeout(() => initialize(attempt + 1), 50);
      return;
    }

    createModal();
  }

  initialize();
})();