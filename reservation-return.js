(() => {
  "use strict";

  const STORAGE_KEY = "kesarReservationReturnSuccessV2";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function validForm(form) {
    const required = ["name", "phone", "date", "time", "guests"];
    let firstInvalid = null;

    required.forEach(id => {
      const field = $("#" + id, form);
      if (!field) return;
      let message = field.value.trim() ? "" : "This field is required.";
      if (!message && id === "phone") {
        const digits = field.value.replace(/\D/g, "").slice(-10);
        if (!/^[6-9]\d{9}$/.test(digits)) message = "Enter a valid 10-digit Indian mobile number.";
      }
      field.setAttribute("aria-invalid", String(Boolean(message)));
      const error = field.closest(".field")?.querySelector(".error");
      if (error) error.textContent = message;
      if (message && !firstInvalid) firstInvalid = field;
    });

    const experience = $('input[name="diningExperience"]:checked', form);
    const experienceError = $("#diningExperienceError", form);
    if (!experience) {
      if (experienceError) experienceError.textContent = "Choose Mandi House or Dining.";
      firstInvalid ||= $('input[name="diningExperience"]', form);
    } else if (experienceError) {
      experienceError.textContent = "";
    }

    if (!firstInvalid) return true;
    firstInvalid.focus({ preventScroll: true });
    firstInvalid.closest(".field, .reservation-experience")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }

  function reservationData(form) {
    const time = $("#time", form);
    const feast = $("#reservationSelectedFeast", form);
    const feastVisible = feast && !feast.hidden && feast.getAttribute("aria-hidden") !== "true";
    return {
      name: $("#name", form)?.value.trim() || "Guest",
      phone: $("#phone", form)?.value.trim() || "",
      date: $("#date", form)?.value || "",
      dateLabel: $("#date", form)?.value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date($("#date", form).value + "T12:00:00+05:30")) : "",
      time: time?.selectedOptions?.[0]?.textContent?.trim() || time?.value || "",
      diningExperience: $('input[name="diningExperience"]:checked', form)?.value || "",
      guests: $("#guests", form)?.value || "",
      occasion: $("#occasion", form)?.value.trim() || "",
      notes: $("#message", form)?.value.trim() || "",
      selectedFeast: feastVisible ? {
        name: $(".reservation-selected-feast__title", feast)?.textContent.trim() || "",
        meta: $(".reservation-selected-feast__meta", feast)?.textContent.trim() || ""
      } : null
    };
  }

  function message(data) {
    const lines = [
      "Hello KESAR, I would like to request a table reservation.", "",
      `Name: ${data.name}`, `Phone: ${data.phone}`, `Date: ${data.dateLabel}`,
      `Time: ${data.time}`, `Dining Experience: ${data.diningExperience}`, `Guests: ${data.guests}`
    ];
    if (data.occasion) lines.push(`Occasion: ${data.occasion}`);
    if (data.selectedFeast?.name) lines.push(`Selected Feast: ${data.selectedFeast.name}${data.selectedFeast.meta ? ` — ${data.selectedFeast.meta}` : ""}`);
    if (data.notes) lines.push(`Notes: ${data.notes}`);
    lines.push("", "Please check availability and confirm this reservation.");
    return lines.join("\n");
  }

  function savePending(method, data) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ method, data, created: Date.now() })); } catch {}
  }

  function closeReservationNow() {
    const dialog = $("#reservationDialog");
    if (!dialog) return;
    dialog.classList.remove("is-open");
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
    document.body.classList.remove("reservation-dialog-open", "reservation-modal-open");
    window.dispatchEvent(new Event("resize"));
  }

  function openExternal(url) {
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (!popup) window.location.href = url;
  }

  function overlayMarkup() {
    const overlay = document.createElement("div");
    overlay.id = "reservationReturnSuccess";
    overlay.className = "reservation-return-success";
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "reservationReturnTitle");
    overlay.innerHTML = `
      <div class="reservation-return-success__card">
        <div class="reservation-return-success__icon" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28"></circle><path d="M20 33l8 8 17-19"></path></svg></div>
        <span>Reservation Request</span>
        <h2 id="reservationReturnTitle">Thank you.</h2>
        <p data-return-message></p>
        <div class="reservation-return-success__summary" data-return-summary></div>
        <p class="reservation-return-success__notice">Your table is confirmed only after the KESAR team replies.</p>
        <div class="reservation-return-success__actions"><button type="button" data-return-done>Done</button><button type="button" data-return-again>Make Another Reservation</button></div>
      </div>`;
    document.body.append(overlay);
    $("[data-return-done]", overlay)?.addEventListener("click", () => hideOverlay(true));
    $("[data-return-again]", overlay)?.addEventListener("click", () => {
      hideOverlay(true);
      setTimeout(() => window.openReservationDialog?.(null), 80);
    });
    return overlay;
  }

  function hideOverlay(resetForm) {
    const overlay = $("#reservationReturnSuccess");
    overlay?.classList.remove("is-visible");
    if (overlay) overlay.hidden = true;
    document.body.classList.remove("reservation-return-success-open");
    if (resetForm) {
      const form = $("#reservationForm");
      form?.reset();
      if (form) {
        $$("[aria-invalid]", form).forEach(el => el.setAttribute("aria-invalid", "false"));
        $$(".error", form).forEach(el => { el.textContent = ""; });
      }
    }
  }

  function showOverlay(pending) {
    const overlay = $("#reservationReturnSuccess") || overlayMarkup();
    const { method, data } = pending;
    $("[data-return-message]", overlay).textContent = method === "email"
      ? "Your reservation request is ready in your email app. Please send the email, and our team will confirm availability shortly."
      : "Your reservation request is ready in WhatsApp. Please tap Send, and our team will confirm availability shortly.";
    const summary = $("[data-return-summary]", overlay);
    summary.replaceChildren();
    const add = (text) => { if (!text) return; const p = document.createElement("p"); p.textContent = text; summary.append(p); };
    add(data.name);
    add([data.dateLabel, data.time].filter(Boolean).join(" · "));
    add([data.diningExperience, data.guests].filter(Boolean).join(" · "));
    if (data.selectedFeast?.name) add([data.selectedFeast.name, data.selectedFeast.meta].filter(Boolean).join(" · "));
    overlay.hidden = false;
    document.body.classList.add("reservation-return-success-open");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.classList.add("is-visible");
      $("[data-return-done]", overlay)?.focus({ preventScroll: true });
    }));
  }

  function consumePending() {
    let pending = null;
    try {
      pending = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      if (pending) sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    if (!pending || Date.now() - pending.created > 15 * 60 * 1000) return;
    closeReservationNow();
    showOverlay(pending);
  }

  document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : null;
    const action = target?.closest("[data-reservation-action]");
    const dialog = $("#reservationDialog");
    if (!action || !dialog?.contains(action)) return;

    const form = $("#reservationForm", dialog);
    if (!form || !validForm(form)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const method = action.dataset.reservationAction === "email" ? "email" : "whatsapp";
    const data = reservationData(form);
    const text = message(data);
    const url = method === "email"
      ? `mailto:hotelkesar41@gmail.com?subject=${encodeURIComponent("KESAR Table Reservation Request")}&body=${encodeURIComponent(text)}`
      : `https://wa.me/918951919010?text=${encodeURIComponent(text)}`;

    savePending(method, data);
    closeReservationNow();
    openExternal(url);

    setTimeout(() => {
      if (document.visibilityState === "visible") consumePending();
    }, 700);
  }, true);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") setTimeout(consumePending, 120);
  });
  window.addEventListener("pageshow", () => setTimeout(consumePending, 120));
})();
