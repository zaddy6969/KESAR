(() => {
  "use strict";

  const KEY = "kesarReservationReturnSuccessV1";
  const $ = (selector, root = document) => root.querySelector(selector);

  function detailsFromForm() {
    const form = $("#reservationForm");
    if (!form) return null;
    const name = $("#name", form)?.value.trim();
    const phone = $("#phone", form)?.value.trim();
    const dateField = $("#date", form);
    const timeField = $("#time", form);
    const guests = $("#guests", form)?.value.trim();
    const experience = $('input[name="diningExperience"]:checked', form)?.value;
    if (!name || !phone || !dateField?.value || !timeField?.value || !guests || !experience) return null;

    const [year, month, day] = dateField.value.split("-").map(Number);
    const date = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata"
    }).format(new Date(Date.UTC(year, month - 1, day, 12)));

    return {
      name,
      date,
      time: timeField.selectedOptions?.[0]?.textContent?.trim() || timeField.value,
      guests,
      experience
    };
  }

  function ensureOverlay() {
    let overlay = $("#reservationGreeting");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "reservationGreeting";
    overlay.className = "reservation-greeting";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="reservation-greeting__panel" role="document">
        <div class="reservation-greeting__icon" aria-hidden="true">
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="19"></circle><path d="m15 24 6 6 13-14"></path></svg>
        </div>
        <span class="reservation-greeting__eyebrow">Reservation request</span>
        <h2 id="reservationGreetingTitle">Thank you.</h2>
        <p class="reservation-greeting__message" id="reservationGreetingMessage"></p>
        <div class="reservation-greeting__summary">
          <div><small>Date</small><strong id="reservationGreetingDate"></strong></div>
          <div><small>Time</small><strong id="reservationGreetingTime"></strong></div>
          <div><small>Guests</small><strong id="reservationGreetingGuests"></strong></div>
        </div>
        <p class="reservation-greeting__note">Your table is confirmed only after Hotel KESAR replies with availability.</p>
        <button class="reservation-greeting__close" type="button">Continue</button>
      </div>`;
    document.body.append(overlay);

    const close = () => {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("reservation-greeting-open");
    };
    $(".reservation-greeting__close", overlay)?.addEventListener("click", close);
    overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) close();
    });
    return overlay;
  }

  function show(details, type) {
    if (!details) return;
    const overlay = ensureOverlay();
    $("#reservationGreetingTitle", overlay).textContent = `Thank you, ${details.name}.`;
    $("#reservationGreetingMessage", overlay).textContent = type === "whatsapp"
      ? "Your reservation request is ready in WhatsApp. Send the message and Hotel KESAR will confirm availability shortly."
      : "Your reservation email is ready. Send it and Hotel KESAR will confirm availability shortly.";
    $("#reservationGreetingDate", overlay).textContent = details.date;
    $("#reservationGreetingTime", overlay).textContent = details.time;
    $("#reservationGreetingGuests", overlay).textContent = details.guests;
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("reservation-greeting-open");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.classList.add("is-open");
      $(".reservation-greeting__close", overlay)?.focus({ preventScroll: true });
    }));
  }

  function save(details, type) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ details, type, created: Date.now() }));
    } catch {}
  }

  function consume() {
    let pending = null;
    try {
      pending = JSON.parse(sessionStorage.getItem(KEY) || "null");
    } catch {}
    if (!pending || Date.now() - pending.created > 10 * 60 * 1000) return;
    try { sessionStorage.removeItem(KEY); } catch {}
    show(pending.details, pending.type);
  }

  document.addEventListener("click", event => {
    const action = event.target instanceof Element
      ? event.target.closest("[data-reservation-action]")
      : null;
    if (!action) return;
    const details = detailsFromForm();
    if (!details) return;
    const type = action.getAttribute("data-reservation-action") || "whatsapp";
    save(details, type);
    setTimeout(() => {
      if (document.visibilityState === "visible") consume();
    }, 700);
  }, true);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") setTimeout(consume, 120);
  });
  window.addEventListener("pageshow", () => setTimeout(consume, 120));
  window.addEventListener("focus", () => setTimeout(consume, 120));
})();
