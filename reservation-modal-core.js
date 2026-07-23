(() => {
  "use strict";

  const DIALOG_ID = "reservationDialog";
  const WHATSAPP = "918951919010";
  const EMAIL = "hotelkesar41@gmail.com";
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
  const GUESTS_BY_COMBO = {
    "2": "2 guests",
    "5": "5 guests",
    "6": "6 guests",
    "8": "7+ guests",
    "10": "7+ guests"
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  let dialog = null;
  let form = null;
  let lastReservationTrigger = null;
  let selectedFeast = null;
  let mounted = false;

  const icons = {
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="3.5"/><path d="M5.5 20v-2.3c0-3.2 2.8-5.7 6.5-5.7s6.5 2.5 6.5 5.7V20z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.8 10 8.3 8.2 10c1.2 2.7 3.2 4.7 5.8 5.9l1.8-1.8 4.5 3-.7 2.7c-.2.8-1 1.4-1.8 1.3C10 20.5 3.5 14 2.9 6.2c-.1-.8.5-1.6 1.3-1.8z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7 3v5M17 3v5M3.5 9.5h17"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
    guests: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3.5 20v-2.2c0-3.2 2.4-5.6 5.5-5.6s5.5 2.4 5.5 5.6V20M14.3 14.3c.7-.6 1.6-.9 2.7-.9 2.7 0 4.5 2.1 4.5 4.8V20"/></svg>',
    gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M12 9v12M3 13h18M12 9H7.8a2.3 2.3 0 1 1 2-3.5L12 9Zm0 0h4.2a2.3 2.3 0 1 0-2-3.5L12 9Z"/></svg>',
    note: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l11-11-4-4L4 16zM13.8 6.2l4 4M4 4h7"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 20 6v5.3c0 4.9-3.2 8.7-8 10.4-4.8-1.7-8-5.5-8-10.4V6z"/><path d="m8.5 12 2.3 2.3 4.8-5"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 11.7a8.3 8.3 0 0 1-12.3 7.2L3.5 20l1.1-4.2a8.3 8.3 0 1 1 15.6-4.1Z"/><path d="M8.2 7.7c.4-.4.8-.3 1.1.2l.9 2c.2.4.1.7-.2 1l-.6.7c.9 1.8 2.2 3 4 3.8l.6-.8c.3-.4.6-.5 1-.3l1.9.9c.5.2.6.6.3 1-.7 1-1.7 1.5-2.9 1.4-3.7-.4-7.5-4-8-7.8-.2-1.2.4-2.2 1.9-2.1Z"/></svg>',
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>',
    mandi: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 24h22M8 24v-8h16v8M11 16a5 5 0 0 1 10 0M16 8V5M9 12l-2-2M23 12l2-2"/></svg>',
    dining: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 5v10M5 5v6c0 2 1 4 3 4s3-2 3-4V5M8 15v12M23 5c-4 2-5 7-3 12h3v10M23 5v12"/></svg>'
  };

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

  function clearInitialErrors() {
    $$("[aria-invalid]", form).forEach(field => field.setAttribute("aria-invalid", "false"));
    $$(".error", form).forEach(error => { error.textContent = ""; });
    setExperienceError("");
  }

  function validateForm() {
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
    setExperienceError(experienceValid ? "" : "Choose Mandi House or Dining.");

    const invalid = firstInvalid || (!experienceValid ? experienceInputs()[0] : null);
    if (!invalid) return true;

    invalid.focus({ preventScroll: true });
    (invalid.closest(".field") || invalid.closest(".reservation-experience"))?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    return false;
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
      const feastMeta = [data.feast.party, data.feast.price].filter(Boolean).join(" — ");
      lines.push(`Selected Feast: ${data.feast.name}${feastMeta ? ` for ${feastMeta}` : ""}`);
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
    } else {
      openExternal(
        `mailto:${EMAIL}?subject=${encodeURIComponent("KESAR Table Reservation Request")}` +
        `&body=${encodeURIComponent(message)}`
      );
    }

    window.dataLayer?.push({
      event: `reservation_dialog_${type}`,
      guests: data.guests,
      dining_experience: data.diningExperience,
      selected_feast: data.feast?.name || ""
    });
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
      const smalls = $$("button small", row);
      return {
        name: $("button strong", row)?.textContent.trim() || "Mandi Combo",
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

  function dishDetails() {
    const title = $("#dialogTitle")?.textContent.trim();
    if (!title) return null;
    return {
      name: title,
      party: "Signature dish",
      price: "",
      guests: ""
    };
  }

  function updateFeastStrip() {
    const strip = $("#reservationSelectedFeast", form);
    if (!strip) return;
    strip.hidden = !selectedFeast;
    strip.setAttribute("aria-hidden", String(!selectedFeast));
    if (!selectedFeast) return;
    $(".reservation-selected-feast__title", strip).textContent = selectedFeast.name;
    $(".reservation-selected-feast__meta", strip).textContent =
      [selectedFeast.party, selectedFeast.price].filter(Boolean).join(" · ");
  }

  function selectExperience(value = "") {
    experienceInputs().forEach(input => {
      input.checked = input.value === value;
    });
    setExperienceError("");
  }

  function prepareContext(trigger) {
    selectedFeast = null;
    selectExperience("");

    if (trigger?.matches?.(FEAST_TRIGGER_SELECTOR)) {
      selectedFeast = comboDetails(comboKeyFromTrigger(trigger));
      const guests = $("#guests", form);
      if (guests && selectedFeast.guests) guests.value = selectedFeast.guests;
      selectExperience("Mandi House");
    } else if (trigger?.matches?.("#dialogReserve")) {
      selectedFeast = dishDetails();
    }

    updateFeastStrip();
  }

  function wrapControl(field, iconName) {
    const control = field.querySelector("input,select,textarea");
    if (!control || control.closest(".reservation-control")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "reservation-control";
    wrapper.dataset.control = control.tagName.toLowerCase();
    const icon = document.createElement("span");
    icon.className = "reservation-control__icon";
    icon.innerHTML = icons[iconName] || "";
    control.before(wrapper);
    wrapper.append(icon, control);
  }

  function updateNotesCounter() {
    const textarea = $("#message", form);
    const count = $("#reservationNotesCount", form);
    if (textarea && count) count.textContent = `${textarea.value.length} / ${textarea.maxLength}`;
  }

  function transformForm() {
    form.classList.add("reservation-form--dialog");
    form.noValidate = true;

    const name = $("#name", form);
    const phone = $("#phone", form);
    const date = $("#date", form);
    const time = $("#time", form);
    const guests = $("#guests", form);
    const occasion = $("#occasion", form);
    const notes = $("#message", form);

    if (name) name.placeholder = "Your full name";
    if (phone) {
      phone.placeholder = "10-digit mobile number";
      phone.inputMode = "tel";
      phone.autocomplete = "tel";
    }
    if (date) {
      date.min = bengaluruDateString();
      if (!date.max) {
        const max = new Date(Date.now() + 90 * 86400000);
        date.max = bengaluruDateString(max);
      }
    }
    if (time && !date?.value) {
      time.disabled = true;
      time.innerHTML = '<option value="">Choose date first</option>';
    }

    if (occasion) {
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
      const previous = occasion.value;
      occasion.replaceChildren(...options.map(([value, label]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        return option;
      }));
      occasion.required = false;
      occasion.value = previous !== "Dining" && options.some(([value]) => value === previous)
        ? previous
        : "";
    }

    const fields = {
      name: name?.closest(".field"),
      phone: phone?.closest(".field"),
      date: date?.closest(".field"),
      time: time?.closest(".field"),
      guests: guests?.closest(".field"),
      occasion: occasion?.closest(".field"),
      notes: notes?.closest(".field")
    };

    Object.entries(fields).forEach(([key, field]) => {
      if (!field) return;
      field.classList.add("reservation-field", `reservation-field--${key}`);
      field.classList.remove("full");
    });

    wrapControl(fields.name, "user");
    wrapControl(fields.phone, "phone");
    wrapControl(fields.date, "calendar");
    wrapControl(fields.time, "clock");
    wrapControl(fields.guests, "guests");
    wrapControl(fields.occasion, "gift");
    wrapControl(fields.notes, "note");

    if (fields.notes && notes) {
      fields.notes.classList.add("field--full");
      const label = fields.notes.querySelector("label");
      if (label) label.textContent = "Notes (optional)";
      notes.placeholder = "Dietary requirements or special requests";
      notes.maxLength = 250;
      if (!$("#reservationNotesCount", fields.notes)) {
        const counter = document.createElement("span");
        counter.id = "reservationNotesCount";
        counter.className = "reservation-notes-count";
        counter.setAttribute("aria-hidden", "true");
        fields.notes.querySelector(".reservation-control")?.append(counter);
      }
      notes.addEventListener("input", updateNotesCounter);
      updateNotesCounter();
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
            <input id="diningExperienceMandi" type="radio" name="diningExperience" value="Mandi House" required>
            <span class="reservation-experience__card">
              <span class="reservation-experience__icon">${icons.mandi}</span>
              <span class="reservation-experience__text"><strong>Mandi House</strong><small>Traditional mandi and shared feasts</small></span>
              <i aria-hidden="true"></i>
            </span>
          </label>
          <label class="reservation-experience__option">
            <input id="diningExperienceDining" type="radio" name="diningExperience" value="Dining" required>
            <span class="reservation-experience__card">
              <span class="reservation-experience__icon">${icons.dining}</span>
              <span class="reservation-experience__text"><strong>Dining</strong><small>Regular restaurant table reservation</small></span>
              <i aria-hidden="true"></i>
            </span>
          </label>
        </div>
        <span class="error" id="diningExperienceError" aria-live="polite"></span>`;
      fields.guests?.before(experience);
      experience.addEventListener("blur", event => event.stopImmediatePropagation(), true);
    }

    experienceInputs().forEach(input => {
      input.addEventListener("change", () => setExperienceError(""));
    });

    let feastStrip = $("#reservationSelectedFeast", form);
    if (!feastStrip) {
      feastStrip = document.createElement("div");
      feastStrip.id = "reservationSelectedFeast";
      feastStrip.className = "reservation-selected-feast field--full";
      feastStrip.hidden = true;
      feastStrip.setAttribute("aria-hidden", "true");
      feastStrip.innerHTML = `
        <span class="reservation-selected-feast__label">Selected feast</span>
        <span class="reservation-selected-feast__icon" aria-hidden="true">${icons.mandi}</span>
        <span class="reservation-selected-feast__copy">
          <strong class="reservation-selected-feast__title"></strong>
          <small class="reservation-selected-feast__meta"></small>
        </span>
        <span class="reservation-selected-feast__check" aria-hidden="true">✓</span>`;
      fields.notes?.before(feastStrip);
    }

    const submit = $(".submit-row", form);
    if (submit) {
      submit.className = "submit-row field--full";
      submit.innerHTML = `
        <div class="reservation-security">
          <span aria-hidden="true">${icons.shield}</span>
          <p>Your details are secure and used only for your reservation.</p>
        </div>
        <div class="reservation-submit-actions">
          <button type="button" data-reservation-action="whatsapp" class="reservation-action reservation-action--whatsapp">
            <span class="reservation-action__icon" aria-hidden="true">${icons.whatsapp}</span>
            <span><strong>Confirm on WhatsApp</strong><small>Fastest confirmation</small></span>
          </button>
          <button type="button" data-reservation-action="email" class="reservation-action reservation-action--email">
            <span class="reservation-action__icon" aria-hidden="true">${icons.email}</span>
            <span><strong>Email Reservation</strong><small>We'll confirm via email</small></span>
          </button>
        </div>`;
    }

    [name, phone, date, time, guests].filter(Boolean).forEach(field => {
      const clear = () => {
        if (field.getAttribute("aria-invalid") === "true" && field.value.trim()) {
          if (field.id !== "phone" || /^[6-9]\d{9}$/.test(field.value.replace(/\D/g, "").slice(-10))) {
            setFieldError(field, "");
          }
        }
      };
      field.addEventListener("input", clear);
      field.addEventListener("change", clear);
    });

    clearInitialErrors();
  }

  function closeOtherUi() {
    const mobileMenu = $("#mobileMenu");
    const menuToggle = $("#menuToggle");
    if (mobileMenu?.classList.contains("open")) {
      mobileMenu.classList.remove("open");
      mobileMenu.setAttribute("inert", "");
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

  function showDialog() {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
      dialog.classList.add("reservation-dialog--fallback");
    }
  }

  function openReservationDialog(trigger = null) {
    if (!mounted || dialog.open) return;
    lastReservationTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement;
    prepareContext(trigger);
    clearInitialErrors();
    closeOtherUi();
    document.body.classList.add("reservation-dialog-open", "reservation-modal-open");
    $("#mobileReserve")?.setAttribute("hidden", "");
    showDialog();
    requestAnimationFrame(() => {
      dialog.classList.add("is-open");
      setTimeout(() => $("#name", form)?.focus({ preventScroll: true }), 90);
    });
  }

  function closeReservationDialog() {
    if (!dialog?.open && !dialog?.hasAttribute("open")) return;
    dialog.classList.remove("is-open");
    setTimeout(() => {
      if (typeof dialog.close === "function" && dialog.open) dialog.close();
      else {
        dialog.removeAttribute("open");
        dialog.dispatchEvent(new Event("close"));
      }
    }, 180);
  }

  function markTriggers(root = document) {
    $$(TRIGGER_SELECTOR, root).forEach(trigger => {
      trigger.setAttribute("data-open-reservation", "");
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-controls", DIALOG_ID);
    });
  }

  function handleDocumentClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const action = target.closest("[data-reservation-action]");
    if (action && dialog.contains(action)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      sendReservation(action.dataset.reservationAction);
      return;
    }

    const close = target.closest("[data-close-reservation]");
    if (close && dialog.contains(close)) {
      event.preventDefault();
      closeReservationDialog();
      return;
    }

    const trigger = target.closest(TRIGGER_SELECTOR);
    if (!trigger || dialog.contains(trigger) || event.button !== 0) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openReservationDialog(trigger);
  }

  function buildDialog() {
    const source = $("#reservation");
    form = $("#reservationForm");
    if (!source || !form || $("#" + DIALOG_ID)) return false;

    transformForm();

    dialog = document.createElement("dialog");
    dialog.id = DIALOG_ID;
    dialog.className = "reservation-dialog";
    dialog.setAttribute("aria-labelledby", "reservationDialogTitle");
    dialog.innerHTML = `
      <div class="reservation-dialog__panel">
        <aside class="reservation-dialog__intro">
          <div class="reservation-dialog__intro-content">
            <span class="reservation-dialog__brand">Hotel KESAR</span>
            <span class="reservation-dialog__eyebrow">Table Reservations</span>
            <h2 id="reservationDialogTitle"><span>Reserve</span><span>your</span><span class="reservation-dialog__gold">table.</span></h2>
            <p>Choose your date, time and preferred dining experience. Our team will confirm availability through WhatsApp or email.</p>
          </div>
          <span class="reservation-dialog__ornament" aria-hidden="true">✦</span>
        </aside>
        <div class="reservation-dialog__content">
          <button class="reservation-dialog__close" type="button" data-close-reservation aria-label="Close reservation dialog">×</button>
          <div class="reservation-dialog__form-host"></div>
        </div>
      </div>`;

    document.body.append(dialog);
    $(".reservation-dialog__form-host", dialog).append(form);

    source.classList.add("reservation-modal-source");
    source.hidden = true;
    source.setAttribute("aria-hidden", "true");
    form.classList.add("visible");
    form.querySelectorAll(".reveal").forEach(element => element.classList.add("visible"));

    dialog.addEventListener("cancel", event => {
      event.preventDefault();
      closeReservationDialog();
    });

    dialog.addEventListener("click", event => {
      if (event.target === dialog) closeReservationDialog();
    });

    dialog.addEventListener("close", () => {
      dialog.classList.remove("is-open", "reservation-dialog--fallback");
      document.body.classList.remove("reservation-dialog-open", "reservation-modal-open");
      window.dispatchEvent(new Event("resize"));
      if (lastReservationTrigger instanceof HTMLElement && document.contains(lastReservationTrigger)) {
        setTimeout(() => lastReservationTrigger.focus({ preventScroll: true }), 50);
      }
    });

    markTriggers();
    document.addEventListener("click", handleDocumentClick, true);

    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        markTriggers(node.matches(TRIGGER_SELECTOR) ? node.parentElement || document : node);
      }));
    }).observe(document.body, { childList: true, subtree: true });

    mounted = true;
    window.openReservationDialog = openReservationDialog;
    window.closeReservationDialog = closeReservationDialog;

    if (location.hash === "#reservation") {
      history.replaceState(null, "", location.pathname + location.search);
      setTimeout(() => openReservationDialog(null), 80);
    }
    return true;
  }

  function initialize(attempt = 0) {
    if (mounted) return;
    if (buildDialog()) return;
    if (attempt < 100) setTimeout(() => initialize(attempt + 1), 40);
  }

  initialize();
})();
