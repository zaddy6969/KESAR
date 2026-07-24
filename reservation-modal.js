(() => {
  "use strict";

  const CORE_SRC = "/reservation-modal-core.js?v=20260724-email-confirmation";
  const RESERVATION_EMAIL = "hotelkesar41@gmail.com";
  const STATE_KEY = "kesarReservationState";
  const STATE_TTL = 15 * 60 * 1000;
  const originalOpen = window.open.bind(window);
  let patched = false;
  let successOverlay = null;

  function installStyles() {
    if (document.getElementById("kesarReservationSuccessStyles")) return;
    const style = document.createElement("style");
    style.id = "kesarReservationSuccessStyles";
    style.textContent = `
      body.kesar-reservation-success-open{overflow:hidden}
      .kesar-reservation-success{
        position:fixed;inset:0;z-index:30000;display:grid;place-items:center;
        padding:22px;background:rgba(11,8,6,.56);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)
      }
      .kesar-reservation-success[hidden]{display:none!important}
      .kesar-reservation-success__backdrop{position:absolute;inset:0}
      .kesar-reservation-success__panel{
        position:relative;z-index:1;width:min(1180px,100%);min-height:min(780px,calc(100dvh - 44px));
        display:grid;grid-template-columns:minmax(300px,34%) minmax(0,66%);
        border-radius:30px;overflow:hidden;border:1px solid rgba(182,117,50,.24);
        background:#f7f2e9;box-shadow:0 30px 80px rgba(0,0,0,.28);opacity:0;transform:translateY(22px) scale(.985);
        transition:opacity .34s ease,transform .45s cubic-bezier(.2,.75,.2,1)
      }
      .kesar-reservation-success.is-visible .kesar-reservation-success__panel{opacity:1;transform:none}
      .kesar-reservation-success__intro{
        position:relative;display:flex;align-items:center;padding:54px 46px;
        background:radial-gradient(circle at top,#241710 0%,#120d09 48%,#080605 100%);color:#f6efe4;overflow:hidden
      }
      .kesar-reservation-success__intro::before,
      .kesar-reservation-success__intro::after{
        content:"";position:absolute;border:1px solid rgba(182,117,50,.18);border-radius:50%;pointer-events:none
      }
      .kesar-reservation-success__intro::before{width:320px;height:320px;right:-110px;bottom:-70px}
      .kesar-reservation-success__intro::after{width:180px;height:180px;right:40px;bottom:110px}
      .kesar-reservation-success__intro-copy{position:relative;z-index:1;display:grid;gap:24px;max-width:320px}
      .kesar-reservation-success__brand{
        display:flex;align-items:center;gap:14px;font:700 15px/1.1 "DM Sans",Arial,sans-serif;
        letter-spacing:.22em;text-transform:uppercase;color:#f0dfc2
      }
      .kesar-reservation-success__brand::before{content:"";width:44px;height:1px;background:#b67532}
      .kesar-reservation-success__eyebrow{
        font:700 12px/1.2 "DM Sans",Arial,sans-serif;letter-spacing:.32em;text-transform:uppercase;color:#c59454
      }
      .kesar-reservation-success__intro h2{
        margin:0;font:400 clamp(70px,8vw,110px)/.84 "Cormorant Garamond","Times New Roman",serif;
        letter-spacing:-.05em;color:#f7f0e7
      }
      .kesar-reservation-success__intro h2 span{display:block}
      .kesar-reservation-success__intro h2 span:last-child{color:#d4a05d}
      .kesar-reservation-success__intro p{
        margin:0;color:rgba(246,239,228,.8);font:400 17px/1.65 "DM Sans",Arial,sans-serif
      }
      .kesar-reservation-success__content{
        position:relative;padding:38px clamp(24px,3.2vw,44px);display:flex;flex-direction:column;justify-content:center;background:#f7f2e9;color:#17130f;
        overflow:auto
      }
      .kesar-reservation-success__close{
        position:absolute;top:18px;right:18px;width:56px;height:56px;border-radius:50%;border:1px solid rgba(23,19,15,.12);
        background:rgba(251,247,240,.94);color:#17130f;font-size:34px;line-height:1;cursor:pointer;display:grid;place-items:center
      }
      .kesar-reservation-success__close:hover,.kesar-reservation-success__close:focus-visible{outline:0;border-color:#b67532;box-shadow:0 0 0 3px rgba(182,117,50,.14)}
      .kesar-reservation-success__inner{width:min(560px,100%);margin:0 auto;display:grid;gap:18px}
      .kesar-reservation-success__badge{
        display:inline-flex;align-items:center;gap:10px;padding:0;color:#a36122;
        font:700 12px/1.2 "DM Sans",Arial,sans-serif;letter-spacing:.26em;text-transform:uppercase
      }
      .kesar-reservation-success__badge::before{content:"";width:34px;height:1px;background:#d4b183}
      .kesar-reservation-success__icon{
        width:92px;height:92px;display:grid;place-items:center;border-radius:50%;background:#fbf8f2;border:1px solid rgba(182,117,50,.25);
        box-shadow:0 10px 28px rgba(70,44,19,.08);opacity:0;transform:translateY(12px) scale(.94)
      }
      .kesar-reservation-success.is-visible .kesar-reservation-success__icon{animation:kesarSuccessIcon .5s ease forwards}
      .kesar-reservation-success__icon svg{width:58px;height:58px;overflow:visible}
      .kesar-reservation-success__icon circle,.kesar-reservation-success__icon path{
        fill:none;stroke:#b67532;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round
      }
      .kesar-reservation-success__icon circle{stroke-dasharray:176;stroke-dashoffset:176}
      .kesar-reservation-success__icon path{stroke-dasharray:38;stroke-dashoffset:38}
      .kesar-reservation-success.is-visible .kesar-reservation-success__icon circle{animation:kesarDrawCircle .62s ease forwards}
      .kesar-reservation-success.is-visible .kesar-reservation-success__icon path{animation:kesarDrawCheck .38s .42s ease forwards}
      .kesar-reservation-success__headline,.kesar-reservation-success__message,.kesar-reservation-success__compact,.kesar-reservation-success__summary,.kesar-reservation-success__notice,.kesar-reservation-success__actions{
        opacity:0;transform:translateY(14px)
      }
      .kesar-reservation-success.is-visible .kesar-reservation-success__headline{animation:kesarReveal .42s .16s ease forwards}
      .kesar-reservation-success.is-visible .kesar-reservation-success__message{animation:kesarReveal .42s .24s ease forwards}
      .kesar-reservation-success.is-visible .kesar-reservation-success__compact{animation:kesarReveal .42s .31s ease forwards}
      .kesar-reservation-success.is-visible .kesar-reservation-success__summary{animation:kesarReveal .42s .39s ease forwards}
      .kesar-reservation-success.is-visible .kesar-reservation-success__notice{animation:kesarReveal .42s .47s ease forwards}
      .kesar-reservation-success.is-visible .kesar-reservation-success__actions{animation:kesarReveal .42s .55s ease forwards}
      .kesar-reservation-success__headline h3{
        margin:0;font:400 clamp(56px,6vw,88px)/.88 "Cormorant Garamond","Times New Roman",serif;letter-spacing:-.05em
      }
      .kesar-reservation-success__compact{
        display:grid;gap:8px;padding:18px 20px;border-radius:18px;border:1px solid rgba(23,19,15,.1);background:#fbf8f2
      }
      .kesar-reservation-success__guest{font:700 26px/1.1 "DM Sans",Arial,sans-serif;color:#17130f}
      .kesar-reservation-success__meta{display:grid;gap:4px;color:#6c6257;font:500 14px/1.5 "DM Sans",Arial,sans-serif}
      .kesar-reservation-success__summary{
        display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px
      }
      .kesar-reservation-success__item{
        min-height:84px;padding:14px 15px;border-radius:16px;border:1px solid rgba(23,19,15,.09);background:#fffaf3;display:grid;gap:7px
      }
      .kesar-reservation-success__item strong{
        color:#9b5d21;font:700 11px/1.2 "DM Sans",Arial,sans-serif;letter-spacing:.22em;text-transform:uppercase
      }
      .kesar-reservation-success__item span{color:#18130f;font:600 15px/1.5 "DM Sans",Arial,sans-serif;word-break:break-word}
      .kesar-reservation-success__item--notes{grid-column:1/-1;min-height:0}
      .kesar-reservation-success__notice{
        display:grid;gap:10px;padding-top:18px;border-top:1px solid rgba(182,117,50,.22);color:#75685a;font:500 13px/1.6 "DM Sans",Arial,sans-serif
      }
      .kesar-reservation-success__notice strong{color:#17130f}
      .kesar-reservation-success__actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:2px}
      .kesar-reservation-success__actions button{
        min-height:52px;padding:0 18px;border-radius:14px;cursor:pointer;font:700 12px/1 "DM Sans",Arial,sans-serif;
        letter-spacing:.22em;text-transform:uppercase;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease
      }
      .kesar-reservation-success__actions button:hover,.kesar-reservation-success__actions button:focus-visible{outline:0;transform:translateY(-1px)}
      .kesar-reservation-success__actions .is-primary{border:1px solid #17130f;background:#17130f;color:#fbf8f2;box-shadow:0 10px 24px rgba(23,19,15,.14)}
      .kesar-reservation-success__actions .is-secondary{border:1px solid rgba(182,117,50,.42);background:#fbf8f2;color:#8f511c}
      @keyframes kesarDrawCircle{to{stroke-dashoffset:0}}
      @keyframes kesarDrawCheck{to{stroke-dashoffset:0}}
      @keyframes kesarSuccessIcon{to{opacity:1;transform:none}}
      @keyframes kesarReveal{to{opacity:1;transform:none}}
      @media(max-width:900px){
        .kesar-reservation-success__panel{grid-template-columns:1fr;min-height:min(860px,calc(100dvh - 36px))}
        .kesar-reservation-success__intro{padding:34px 26px}
        .kesar-reservation-success__intro-copy{max-width:none;gap:18px}
        .kesar-reservation-success__intro h2{font-size:72px}
        .kesar-reservation-success__content{padding:28px 20px 24px}
        .kesar-reservation-success__close{width:48px;height:48px;top:12px;right:12px;font-size:30px}
        .kesar-reservation-success__inner{width:100%;padding-top:20px}
      }
      @media(max-width:640px){
        .kesar-reservation-success{padding:10px}
        .kesar-reservation-success__panel{border-radius:22px;min-height:calc(100dvh - 20px)}
        .kesar-reservation-success__intro{padding:26px 20px}
        .kesar-reservation-success__brand{font-size:13px}
        .kesar-reservation-success__eyebrow{font-size:10px}
        .kesar-reservation-success__intro h2{font-size:64px}
        .kesar-reservation-success__intro p{font-size:15px}
        .kesar-reservation-success__content{padding:22px 16px calc(18px + env(safe-area-inset-bottom))}
        .kesar-reservation-success__icon{width:78px;height:78px}
        .kesar-reservation-success__headline h3{font-size:64px}
        .kesar-reservation-success__guest{font-size:22px}
        .kesar-reservation-success__summary{grid-template-columns:1fr}
        .kesar-reservation-success__actions{grid-template-columns:1fr}
      }
      @media(prefers-reduced-motion:reduce){
        .kesar-reservation-success__panel,.kesar-reservation-success__icon,.kesar-reservation-success__headline,.kesar-reservation-success__message,.kesar-reservation-success__compact,.kesar-reservation-success__summary,.kesar-reservation-success__notice,.kesar-reservation-success__actions,.kesar-reservation-success__icon circle,.kesar-reservation-success__icon path{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}
      }
    `;
    document.head.append(style);
  }

  function clearRememberedState() {
    try { sessionStorage.removeItem(STATE_KEY); } catch (_) {}
  }

  function rememberState(state) {
    try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function readRememberedState() {
    try {
      const raw = sessionStorage.getItem(STATE_KEY);
      if (!raw) return null;
      const state = JSON.parse(raw);
      if (!state || !state.createdAt || Date.now() - state.createdAt > STATE_TTL) {
        clearRememberedState();
        return null;
      }
      return state;
    } catch (_) {
      clearRememberedState();
      return null;
    }
  }

  function createSummaryItem(label, value, classes = "") {
    if (!value) return null;
    const item = document.createElement("article");
    item.className = `kesar-reservation-success__item ${classes}`.trim();
    const title = document.createElement("strong");
    title.textContent = label;
    const copy = document.createElement("span");
    copy.textContent = value;
    item.append(title, copy);
    return item;
  }

  function buildSuccessOverlay() {
    if (successOverlay) return successOverlay;
    installStyles();
    successOverlay = document.createElement("section");
    successOverlay.className = "kesar-reservation-success";
    successOverlay.hidden = true;
    successOverlay.setAttribute("aria-hidden", "true");
    successOverlay.innerHTML = `
      <div class="kesar-reservation-success__backdrop" data-success-close></div>
      <div class="kesar-reservation-success__panel" role="dialog" aria-modal="true" aria-labelledby="kesarReservationSuccessTitle">
        <aside class="kesar-reservation-success__intro">
          <div class="kesar-reservation-success__intro-copy">
            <span class="kesar-reservation-success__brand">Hotel KESAR</span>
            <span class="kesar-reservation-success__eyebrow">Reservation Request</span>
            <h2><span>Thank</span><span>you.</span></h2>
            <p>Your reservation request is in process. The KESAR team will review your details and confirm availability with you shortly.</p>
          </div>
        </aside>
        <div class="kesar-reservation-success__content">
          <button class="kesar-reservation-success__close" type="button" aria-label="Close thank you panel" data-success-close>×</button>
          <div class="kesar-reservation-success__inner">
            <span class="kesar-reservation-success__badge">Reservation in process</span>
            <div class="kesar-reservation-success__icon" aria-hidden="true">
              <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28"></circle><path d="M20 33l8 8 17-19"></path></svg>
            </div>
            <div class="kesar-reservation-success__headline">
              <h3 id="kesarReservationSuccessTitle">Thank you.</h3>
            </div>
            <p class="kesar-reservation-success__message"></p>
            <div class="kesar-reservation-success__compact">
              <strong class="kesar-reservation-success__guest"></strong>
              <div class="kesar-reservation-success__meta"></div>
            </div>
            <div class="kesar-reservation-success__summary"></div>
            <div class="kesar-reservation-success__notice">
              <strong>Your table is confirmed only after the KESAR team replies.</strong>
              <span>If WhatsApp or your email app is still open, please press Send there so our team receives your request.</span>
            </div>
            <div class="kesar-reservation-success__actions">
              <button type="button" class="is-primary" data-success-done>Done</button>
              <button type="button" class="is-secondary" data-success-again>Make Another Reservation</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.append(successOverlay);

    successOverlay.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest("[data-success-close]")) {
        hideSuccessOverlay(true);
      } else if (target.closest("[data-success-done]")) {
        hideSuccessOverlay(true);
      } else if (target.closest("[data-success-again]")) {
        hideSuccessOverlay(true);
        setTimeout(() => window.openReservationDialog?.(null), 180);
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && successOverlay && !successOverlay.hidden) {
        event.preventDefault();
        hideSuccessOverlay(true);
      }
    });

    return successOverlay;
  }

  function hideSuccessOverlay(clearState = false) {
    if (!successOverlay || successOverlay.hidden) {
      if (clearState) clearRememberedState();
      return;
    }
    successOverlay.classList.remove("is-visible");
    document.body.classList.remove("kesar-reservation-success-open");
    setTimeout(() => {
      if (!successOverlay) return;
      successOverlay.hidden = true;
      successOverlay.setAttribute("aria-hidden", "true");
    }, 220);
    if (clearState) clearRememberedState();
  }

  function renderCompactMeta(container, values) {
    container.replaceChildren(...values.filter(Boolean).map(text => {
      const row = document.createElement("span");
      row.textContent = text;
      return row;
    }));
  }

  function getSuccessMessage(type, details) {
    const name = details.name || "Guest";
    const methodText = type === "email" ? "Your reservation details have been prepared in your email app." : "Your reservation details have been prepared in WhatsApp.";
    return `${methodText} Thank you, ${name}. Your reservation request is in process, and the KESAR team will confirm availability with you shortly.`;
  }

  function showSuccessOverlay(state) {
    if (!state) return;
    const overlay = buildSuccessOverlay();
    const details = state.details || {};
    const message = overlay.querySelector(".kesar-reservation-success__message");
    const guest = overlay.querySelector(".kesar-reservation-success__guest");
    const meta = overlay.querySelector(".kesar-reservation-success__meta");
    const summary = overlay.querySelector(".kesar-reservation-success__summary");

    message.textContent = getSuccessMessage(state.type, details);
    guest.textContent = details.name || "Guest";

    const compactRows = [
      [details.date, details.time].filter(Boolean).join(" · "),
      [details.diningExperience, details.guests].filter(Boolean).join(" · "),
      details.feast || ""
    ];
    renderCompactMeta(meta, compactRows);

    const summaryItems = [
      createSummaryItem("Phone", details.phone),
      createSummaryItem("Date", details.date),
      createSummaryItem("Time", details.time),
      createSummaryItem("Dining", details.diningExperience),
      createSummaryItem("Guests", details.guests),
      createSummaryItem("Selected Feast", details.feast),
      createSummaryItem("Occasion", details.occasion),
      createSummaryItem("Notes", details.notes, "kesar-reservation-success__item--notes")
    ].filter(Boolean);
    summary.replaceChildren(...summaryItems);

    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.remove("is-visible");
    document.body.classList.add("kesar-reservation-success-open");
    requestAnimationFrame(() => {
      overlay.classList.add("is-visible");
      overlay.querySelector("[data-success-done]")?.focus({ preventScroll: true });
    });
  }

  function parseReservationMessage(text) {
    const details = {
      name: "",
      phone: "",
      date: "",
      time: "",
      diningExperience: "",
      guests: "",
      occasion: "",
      notes: "",
      feast: ""
    };
    String(text || "").split(/\r?\n/).forEach(line => {
      const value = line.trim();
      if (!value) return;
      let match = value.match(/^Name:\s*(.+)$/i);
      if (match) details.name = match[1].trim();
      match = value.match(/^Phone:\s*(.+)$/i);
      if (match) details.phone = match[1].trim();
      match = value.match(/^Date:\s*(.+)$/i);
      if (match) details.date = match[1].trim();
      match = value.match(/^Time:\s*(.+)$/i);
      if (match) details.time = match[1].trim();
      match = value.match(/^Dining Experience:\s*(.+)$/i);
      if (match) details.diningExperience = match[1].trim();
      match = value.match(/^Guests:\s*(.+)$/i);
      if (match) details.guests = match[1].trim();
      match = value.match(/^Occasion:\s*(.+)$/i);
      if (match) details.occasion = match[1].trim();
      match = value.match(/^Notes:\s*(.+)$/i);
      if (match) details.notes = match[1].trim();
      match = value.match(/^Selected Feast:\s*(.+)$/i);
      if (match) details.feast = match[1].trim();
    });
    return details;
  }

  function extractReservationDetails(address) {
    const value = String(address || "");
    try {
      if (value.startsWith(`mailto:${RESERVATION_EMAIL}`)) {
        const query = value.split("?")[1] || "";
        const params = new URLSearchParams(query);
        return parseReservationMessage(params.get("body") || "");
      }
      if (/^https:\/\/wa\.me\/918951919010(?:\?|$)/i.test(value)) {
        const url = new URL(value);
        return parseReservationMessage(url.searchParams.get("text") || "");
      }
    } catch (_) {}
    return parseReservationMessage("");
  }

  function finishReservation(type, address) {
    const state = {
      type,
      details: extractReservationDetails(address),
      createdAt: Date.now()
    };
    rememberState(state);
    setTimeout(() => {
      window.closeReservationDialog?.();
      showSuccessOverlay(state);
    }, 140);
  }

  function gmailComposeUrl(mailtoUrl) {
    const query = mailtoUrl.split("?")[1] || "";
    const params = new URLSearchParams(query);
    const subject = params.get("subject") || "KESAR Table Reservation Request";
    const body = params.get("body") || "";
    const compose = new URL("https://mail.google.com/mail/");
    compose.searchParams.set("view", "cm");
    compose.searchParams.set("fs", "1");
    compose.searchParams.set("to", RESERVATION_EMAIL);
    compose.searchParams.set("su", subject);
    compose.searchParams.set("body", body);
    return compose.toString();
  }

  function showRememberedState() {
    if (document.hidden) return;
    if (successOverlay && !successOverlay.hidden) return;
    const state = readRememberedState();
    if (state) showSuccessOverlay(state);
  }

  function installSendPatch() {
    if (patched) return;
    patched = true;

    window.open = function patchedWindowOpen(url, target, features) {
      const address = String(url || "");

      if (address.startsWith(`mailto:${RESERVATION_EMAIL}`)) {
        const gmailUrl = gmailComposeUrl(address);
        const popup = originalOpen(gmailUrl, "_blank", "noopener,noreferrer");
        if (!popup) window.location.href = address;
        finishReservation("email", address);
        return popup || { closed: false };
      }

      if (/^https:\/\/wa\.me\/918951919010(?:\?|$)/i.test(address)) {
        const popup = originalOpen(address, target || "_blank", features || "noopener,noreferrer");
        finishReservation("whatsapp", address);
        return popup;
      }

      return originalOpen(url, target, features);
    };

    addEventListener("pageshow", showRememberedState, { passive: true });
    document.addEventListener("visibilitychange", showRememberedState);
    showRememberedState();
  }

  const core = document.createElement("script");
  core.src = CORE_SRC;
  core.async = false;
  core.onload = installSendPatch;
  core.onerror = () => console.error("KESAR reservation system could not load.");
  document.body.append(core);
})();
