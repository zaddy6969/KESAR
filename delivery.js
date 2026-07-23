(() => {
  "use strict";

  const platforms = {
    swiggy: "https://www.swiggy.com/city/bangalore/hotel-kesar-fine-dine-basaveshwaranagar-rest1288354",
    zomato: "https://www.zomato.com/bangalore/hotel-kesar-family-dine-veg-and-non-veg-peenya-bangalore"
  };
  const hotel = {
    phone: "8951919010",
    whatsapp: "918951919010",
    email: "hotelkesar41@gmail.com",
    hours: "10:00 AM–11:00 PM"
  };
  const RESERVATION_STATE = { FORM: "form", SUBMITTING: "submitting", SUCCESS: "success" };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  let reservationState = RESERVATION_STATE.FORM;
  let shouldResetReservationOnClose = false;
  let lastSuccessData = null;

  function loadStylesheet(href, key, media) {
    if (document.querySelector(`link[data-kesar-${key}]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    if (media) link.media = media;
    link.dataset[`kesar${key[0].toUpperCase()}${key.slice(1)}`] = "true";
    document.head.append(link);
  }

  loadStylesheet("/mobile.css", "mobile", "(max-width: 767px)");
  loadStylesheet("/compact.css", "compact");
  loadStylesheet("/reservation-success.css?v=in-dialog-1", "reservationSuccess");

  document.querySelectorAll("[data-delivery-platform]").forEach(link => {
    const platform = link.dataset.deliveryPlatform;
    const url = platforms[platform];
    if (!url) {
      link.hidden = true;
      link.removeAttribute("href");
      return;
    }
    link.href = url;
    link.addEventListener("click", () => window.dataLayer?.push({ event: "delivery_platform_click", platform }));
  });

  function readableDate(value) {
    if (!value) return "";
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata"
    }).format(new Date(Date.UTC(year, month - 1, day, 12)));
  }

  function selectedExperience(form) {
    return form.querySelector('input[name="diningExperience"]:checked')?.value || "";
  }

  function validateReservation(form) {
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
        if (!/^[6-9]\d{9}$/.test(digits)) message = "Enter a valid 10-digit Indian mobile number.";
      }
      field.setAttribute("aria-invalid", String(Boolean(message)));
      const error = field.closest(".field")?.querySelector(".error");
      if (error) error.textContent = message;
      if (message && !firstInvalid) firstInvalid = field;
    });

    const experience = selectedExperience(form);
    const experienceGroup = $(".reservation-experience", form);
    const experienceError = $("#diningExperienceError", form);
    if (!experience) {
      experienceGroup?.setAttribute("aria-invalid", "true");
      if (experienceError) experienceError.textContent = "Choose Mandi House or Dining.";
      firstInvalid ||= form.querySelector('input[name="diningExperience"]');
    } else {
      experienceGroup?.setAttribute("aria-invalid", "false");
      if (experienceError) experienceError.textContent = "";
    }

    if (!firstInvalid) return true;
    firstInvalid.focus({ preventScroll: true });
    (firstInvalid.closest(".field") || firstInvalid.closest(".reservation-experience"))?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    return false;
  }

  function reservationData(form) {
    const time = $("#time", form);
    const feast = $("#reservationSelectedFeast", form);
    const feastHidden = !feast || feast.hidden || feast.getAttribute("aria-hidden") === "true";
    return {
      name: $("#name", form)?.value.trim() || "Guest",
      phone: $("#phone", form)?.value.trim() || "",
      date: readableDate($("#date", form)?.value || ""),
      time: time?.selectedOptions?.[0]?.textContent?.trim() || time?.value || "",
      diningExperience: selectedExperience(form),
      guests: $("#guests", form)?.value || "",
      occasion: $("#occasion", form)?.value.trim() || "",
      notes: $("#message", form)?.value.trim() || "",
      selectedFeast: feastHidden ? null : {
        name: $(".reservation-selected-feast__title", feast)?.textContent.trim() || "",
        meta: $(".reservation-selected-feast__meta", feast)?.textContent.trim() || ""
      }
    };
  }

  function successMarkup() {
    const success = document.createElement("section");
    success.id = "reservationSuccess";
    success.className = "reservation-success";
    success.hidden = true;
    success.setAttribute("aria-live", "polite");
    success.setAttribute("aria-labelledby", "reservationSuccessTitle");
    success.innerHTML = `
      <div class="reservation-success__inner">
        <div class="reservation-success__icon" aria-hidden="true">
          <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28"></circle><path d="M20 33l8 8 17-19"></path></svg>
        </div>
        <span class="reservation-success__eyebrow">Reservation Request</span>
        <h2 id="reservationSuccessTitle">Thank you.</h2>
        <p id="reservationSuccessMessage" class="reservation-success__message"></p>
        <div id="reservationSuccessSummary" class="reservation-success__summary"></div>
        <p class="reservation-success__notice">Your table is confirmed only after the KESAR team replies.</p>
        <div class="reservation-success__actions">
          <button type="button" data-reservation-done>Done</button>
          <button type="button" data-reservation-again>Make Another Reservation</button>
        </div>
      </div>`;
    return success;
  }

  function ensureSuccessView(dialog) {
    let success = $("#reservationSuccess", dialog);
    if (success) return success;
    const host = $(".reservation-dialog__form-host", dialog);
    if (!host) return null;
    success = successMarkup();
    host.append(success);
    $("[data-reservation-done]", success)?.addEventListener("click", () => {
      shouldResetReservationOnClose = true;
      window.closeReservationDialog?.();
    });
    $("[data-reservation-again]", success)?.addEventListener("click", () => {
      shouldResetReservationOnClose = true;
      window.closeReservationDialog?.();
      setTimeout(() => window.openReservationDialog?.(null), 260);
    });
    return success;
  }

  function appendSummaryLine(container, primary, secondary = "") {
    if (!primary) return;
    const row = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = primary;
    row.append(strong);
    if (secondary) {
      const span = document.createElement("span");
      span.textContent = secondary;
      row.append(span);
    }
    container.append(row);
  }

  function showReservationSuccess(method, data) {
    const dialog = $("#reservationDialog");
    const form = $("#reservationForm", dialog || document);
    const success = dialog ? ensureSuccessView(dialog) : null;
    if (!dialog || !form || !success) return;

    lastSuccessData = data;
    reservationState = RESERVATION_STATE.SUCCESS;
    form.hidden = true;
    success.hidden = false;
    success.dataset.method = method;

    $("#reservationSuccessMessage", success).textContent = method === "email"
      ? "Your reservation request is ready in your email app. Please send the email, and our team will confirm availability shortly."
      : "Your reservation request is ready in WhatsApp. Please tap Send, and our team will confirm availability shortly.";

    const summary = $("#reservationSuccessSummary", success);
    summary.replaceChildren();
    appendSummaryLine(summary, data.name);
    appendSummaryLine(summary, [data.date, data.time].filter(Boolean).join(" · "));
    appendSummaryLine(summary, [data.diningExperience, data.guests].filter(Boolean).join(" · "));
    if (data.selectedFeast?.name) appendSummaryLine(summary, data.selectedFeast.name, data.selectedFeast.meta);

    success.classList.remove("is-visible");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        success.classList.add("is-visible");
        $("[data-reservation-done]", success)?.focus({ preventScroll: true });
      });
    });
  }

  function resetReservationExperience() {
    const dialog = $("#reservationDialog");
    const form = $("#reservationForm", dialog || document);
    const success = $("#reservationSuccess", dialog || document);
    form?.reset();
    if (form) {
      $$("[aria-invalid]", form).forEach(field => field.setAttribute("aria-invalid", "false"));
      $$(".error", form).forEach(error => { error.textContent = ""; });
      const time = $("#time", form);
      if (time) {
        time.innerHTML = '<option value="">Choose date first</option>';
        time.disabled = true;
      }
      const feast = $("#reservationSelectedFeast", form);
      if (feast) {
        feast.hidden = true;
        feast.setAttribute("aria-hidden", "true");
        const title = $(".reservation-selected-feast__title", feast);
        const meta = $(".reservation-selected-feast__meta", feast);
        if (title) title.textContent = "";
        if (meta) meta.textContent = "";
      }
      form.hidden = false;
    }
    if (success) {
      success.classList.remove("is-visible");
      success.hidden = true;
    }
    reservationState = RESERVATION_STATE.FORM;
    lastSuccessData = null;
    shouldResetReservationOnClose = false;
  }

  function setActionLoading(action, method) {
    const dialog = $("#reservationDialog");
    const buttons = $$('[data-reservation-action]', dialog || document);
    buttons.forEach(button => { button.disabled = true; });
    const strong = $("strong", action);
    if (strong) strong.textContent = method === "email" ? "Opening Email…" : "Opening WhatsApp…";
    return () => {
      buttons.forEach(button => { button.disabled = false; });
      $$('[data-reservation-action="whatsapp"] strong', dialog || document).forEach(el => { el.textContent = "Confirm on WhatsApp"; });
      $$('[data-reservation-action="email"] strong', dialog || document).forEach(el => { el.textContent = "Email Reservation"; });
    };
  }

  window.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : null;
    const action = target?.closest("[data-reservation-action]");
    const dialog = $("#reservationDialog");
    if (!action || !dialog?.contains(action)) return;

    if (reservationState !== RESERVATION_STATE.FORM) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    const form = $("#reservationForm", dialog);
    if (!form || !validateReservation(form)) return;

    const method = action.dataset.reservationAction === "email" ? "email" : "whatsapp";
    const data = reservationData(form);
    reservationState = RESERVATION_STATE.SUBMITTING;
    const restoreButtons = setActionLoading(action, method);

    setTimeout(() => {
      showReservationSuccess(method, data);
      restoreButtons();
    }, 0);
  }, true);

  new MutationObserver(() => {
    const dialog = $("#reservationDialog");
    if (!dialog || dialog.dataset.kesarSuccessBound === "true") return;
    dialog.dataset.kesarSuccessBound = "true";
    ensureSuccessView(dialog);
    dialog.addEventListener("close", () => {
      if (reservationState === RESERVATION_STATE.SUCCESS || shouldResetReservationOnClose) {
        resetReservationExperience();
      }
      window.dispatchEvent(new Event("resize"));
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  function footerIcon(type) {
    const icons = {
      phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.8 9 3.2l2.1 5-1.8 1.5c1 2.1 2.7 3.8 4.8 4.8l1.5-1.8 5 2.1-.6 2.4c-.3 1.3-1.5 2.2-2.8 2.1C9.7 18.7 5.3 14.3 4.7 6.6c-.1-1.3.8-2.5 1.9-2.8Z"/></svg>',
      whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.7a8 8 0 0 1-11.9 7L4 19.8l1.1-4a8 8 0 1 1 14.9-4.1Z"/><path d="M9.1 8.3c.3-.6.5-.6.9-.6h.4c.2 0 .4.1.5.5l.8 1.8c.1.3.1.5-.1.8l-.6.7c-.2.2-.2.4 0 .7.7 1.2 1.8 2.2 3 2.8.3.2.6.1.8-.1l.8-.9c.2-.3.5-.3.8-.2l1.8.9c.3.2.4.4.4.7 0 .6-.3 1.3-.8 1.7-.5.4-1.2.7-2 .7-1.1 0-2.4-.4-3.9-1.3-2.2-1.4-3.7-3.4-4.2-4.6-.5-1.1-.5-2.1-.2-2.9.2-.4.4-.6.6-.7Z"/></svg>',
      email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m4 7 8 6 8-6"/></svg>',
      clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>'
    };
    return icons[type] || "";
  }

  function applyCompactLayout() {
    const reservation = $("#reservation");
    const heading = reservation?.querySelector(".reservation-head");
    if (heading) {
      const kicker = heading.querySelector(".kicker");
      const title = heading.querySelector(".display");
      const copy = heading.querySelector(":scope > p");
      if (kicker) kicker.textContent = "Reserve a table";
      if (title) title.textContent = "Book your table at Kesar.";
      if (copy) copy.innerHTML = `Enter your reservation details, then send them directly to Hotel Kesar through <a href="https://wa.me/${hotel.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a> or email <a href="mailto:${hotel.email}">${hotel.email}</a>. We are open daily from ${hotel.hours}.`;
    }

    const form = reservation?.querySelector("#reservationForm");
    if (form && !reservation.querySelector(".reservation-contact-bar")) {
      const contact = document.createElement("div");
      contact.className = "reservation-contact-bar reveal visible";
      contact.innerHTML = `<div><span>Hotel Kesar reservations</span><strong>Daily · ${hotel.hours}</strong></div><div class="reservation-contact-actions"><a href="https://wa.me/${hotel.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp ${hotel.phone}</a><a href="mailto:${hotel.email}">Email us</a></div>`;
      form.before(contact);
    }

    const submit = form?.querySelector(".submit-row");
    if (submit) submit.innerHTML = `<p>Complete all required details, then send the full reservation request through WhatsApp or email.</p><div class="reservation-submit-actions"><a class="primary-button inline-button" href="#" data-reservation-action="whatsapp">WhatsApp to reserve →</a><a class="reservation-email-link" href="#" data-reservation-action="email">Email reservation ↗</a></div>`;

    const footer = document.querySelector("footer");
    if (footer && !footer.classList.contains("footer-luxury-ready")) {
      footer.className = "footer-luxury-ready";
      footer.innerHTML = `<div class="shell footer-luxury-main">
        <a class="footer-luxury-brand" href="#home" aria-label="KESAR home">KESAR</a>
        <a class="footer-luxury-item" href="tel:+918951919010"><span class="footer-luxury-icon">${footerIcon("phone")}</span><span class="footer-luxury-value">${hotel.phone}</span></a>
        <a class="footer-luxury-item" href="https://wa.me/${hotel.whatsapp}" target="_blank" rel="noopener noreferrer"><span class="footer-luxury-icon">${footerIcon("whatsapp")}</span><span class="footer-luxury-value">WhatsApp Reservations</span></a>
        <a class="footer-luxury-item footer-luxury-email" href="mailto:${hotel.email}"><span class="footer-luxury-icon">${footerIcon("email")}</span><span class="footer-luxury-value">${hotel.email}</span></a>
        <div class="footer-luxury-item footer-luxury-hours"><span class="footer-luxury-icon">${footerIcon("clock")}</span><span class="footer-luxury-copy"><small>DAILY</small><strong>${hotel.hours}</strong></span></div>
        <div class="footer-luxury-item footer-luxury-hours footer-luxury-today"><span class="footer-luxury-copy"><small>TODAY</small><strong id="footerToday">${hotel.hours}</strong></span></div>
      </div><div class="shell footer-luxury-bottom"><span>© ${new Date().getFullYear()} HOTEL KESAR</span><span>BENGALURU · MANDI HOUSE DINING</span></div>`;
    }
  }

  function indiaTime() {
    return Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date()).map(part => [part.type, part.value]));
  }

  function syncHours() {
    const parts = indiaTime();
    const current = Number(parts.hour) * 60 + Number(parts.minute);
    const open = current >= 600 && current < 1380;
    const status = $("#statusText");
    const live = $("#liveTime");
    const heroStatus = $("#heroStatus");
    if (status) status.textContent = open ? "Open now · closes at 11:00 PM" : current < 600 ? "Closed now · opens today at 10:00 AM" : "Closed now · opens tomorrow at 10:00 AM";
    if (live) live.textContent = `${Number(parts.hour) % 12 || 12}:${parts.minute} ${Number(parts.hour) >= 12 ? "PM" : "AM"} · Bengaluru time`;
    heroStatus?.classList.toggle("open", open);
    if ($("#todayHours")) $("#todayHours").textContent = `Today · ${hotel.hours} · Bengaluru time`;
    if ($("#compactHours")) $("#compactHours").textContent = `Today · ${hotel.hours} · Bengaluru time`;
    if ($("#footerToday")) $("#footerToday").textContent = hotel.hours;
  }

  function populateHotelTimes() {
    const date = $("#date");
    const select = $("#time");
    if (!date || !select) return;
    select.innerHTML = '<option value="">Choose a time</option>';
    if (!date.value) {
      select.disabled = true;
      return;
    }
    for (let total = 600; total <= 1350; total += 30) {
      const hour = Math.floor(total / 60);
      const minute = total % 60;
      const option = document.createElement("option");
      option.value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      option.textContent = `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
      select.append(option);
    }
    select.disabled = false;
  }

  function initialize(attempt = 0) {
    const ready = $("#comboAccordion .combo-row") && $("#date");
    if (!ready && attempt < 80) {
      setTimeout(() => initialize(attempt + 1), 50);
      return;
    }
    applyCompactLayout();
    syncHours();
    const date = $("#date");
    if (date && !date.dataset.kesarHoursBound) {
      date.dataset.kesarHoursBound = "true";
      date.addEventListener("change", () => setTimeout(populateHotelTimes, 0));
    }
    setInterval(syncHours, 10000);
  }

  initialize();
})();