(() => {
  "use strict";

  const CORE_SRC = "/reservation-modal-core.js?v=20260724-email-confirmation";
  const RESERVATION_EMAIL = "hotelkesar41@gmail.com";
  const originalOpen = window.open.bind(window);
  let patched = false;
  let toastTimer = 0;

  function installStyles() {
    if (document.getElementById("kesarReservationSendFixStyles")) return;
    const style = document.createElement("style");
    style.id = "kesarReservationSendFixStyles";
    style.textContent = `
      .kesar-reservation-notice{
        position:fixed;z-index:30000;left:50%;bottom:max(24px,env(safe-area-inset-bottom));
        width:min(520px,calc(100vw - 28px));display:grid;grid-template-columns:42px minmax(0,1fr) 32px;
        align-items:center;gap:12px;padding:14px 14px 14px 16px;border:1px solid rgba(182,117,50,.66);
        border-radius:14px;background:rgba(23,19,15,.97);color:#f8efe2;
        box-shadow:0 22px 64px rgba(0,0,0,.32);opacity:0;transform:translate(-50%,18px) scale(.98);
        transition:opacity .24s ease,transform .32s cubic-bezier(.2,.75,.2,1);
        font-family:"DM Sans",Arial,sans-serif
      }
      .kesar-reservation-notice.is-visible{opacity:1;transform:translate(-50%,0) scale(1)}
      .kesar-reservation-notice__icon{width:42px;height:42px;display:grid;place-items:center;border:1px solid rgba(244,211,156,.42);border-radius:50%;color:#f4d39c;font-size:20px}
      .kesar-reservation-notice__copy{min-width:0;display:grid;gap:3px}
      .kesar-reservation-notice__copy strong{font-size:13px;line-height:1.2;letter-spacing:.02em}
      .kesar-reservation-notice__copy span{color:rgba(248,239,226,.75);font-size:10px;line-height:1.4}
      .kesar-reservation-notice__close{width:32px;height:32px;display:grid;place-items:center;border:0;border-radius:50%;background:transparent;color:#f8efe2;font-size:20px;cursor:pointer}
      .kesar-reservation-notice__close:hover,.kesar-reservation-notice__close:focus-visible{outline:0;background:rgba(255,255,255,.09)}
      @media(max-width:520px){.kesar-reservation-notice{grid-template-columns:36px minmax(0,1fr) 28px;padding:12px}.kesar-reservation-notice__icon{width:36px;height:36px}.kesar-reservation-notice__copy strong{font-size:12px}}
      @media(prefers-reduced-motion:reduce){.kesar-reservation-notice{transition:none!important}}
    `;
    document.head.append(style);
  }

  function hideNotice(notice) {
    if (!notice) return;
    clearTimeout(toastTimer);
    notice.classList.remove("is-visible");
    setTimeout(() => notice.remove(), 260);
  }

  function showNotice(type) {
    installStyles();
    document.querySelector(".kesar-reservation-notice")?.remove();

    const isEmail = type === "email";
    const notice = document.createElement("div");
    notice.className = "kesar-reservation-notice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    notice.innerHTML = `
      <span class="kesar-reservation-notice__icon" aria-hidden="true">${isEmail ? "✉" : "✓"}</span>
      <span class="kesar-reservation-notice__copy">
        <strong>${isEmail ? "Email draft opened" : "WhatsApp reservation opened"}</strong>
        <span>${isEmail ? "Review the reservation details and tap Send in Gmail." : "Review the reservation details and tap Send in WhatsApp."}</span>
      </span>
      <button class="kesar-reservation-notice__close" type="button" aria-label="Dismiss message">×</button>`;

    document.body.append(notice);
    notice.querySelector("button")?.addEventListener("click", () => hideNotice(notice));
    requestAnimationFrame(() => notice.classList.add("is-visible"));
    toastTimer = setTimeout(() => hideNotice(notice), 6500);
  }

  function rememberNotice(type) {
    try {
      sessionStorage.setItem("kesarReservationNotice", JSON.stringify({ type, createdAt: Date.now() }));
    } catch (_) {}
  }

  function showRememberedNotice() {
    let stored = null;
    try {
      stored = JSON.parse(sessionStorage.getItem("kesarReservationNotice") || "null");
      sessionStorage.removeItem("kesarReservationNotice");
    } catch (_) {}
    if (stored && Date.now() - stored.createdAt < 120000) showNotice(stored.type);
  }

  function finishReservation(type) {
    rememberNotice(type);
    setTimeout(() => {
      window.closeReservationDialog?.();
      showNotice(type);
    }, 120);
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

  function installSendPatch() {
    if (patched) return;
    patched = true;

    window.open = function patchedWindowOpen(url, target, features) {
      const address = String(url || "");

      if (address.startsWith(`mailto:${RESERVATION_EMAIL}`)) {
        const gmailUrl = gmailComposeUrl(address);
        const popup = originalOpen(gmailUrl, "_blank", "noopener,noreferrer");
        if (!popup) window.location.href = address;
        finishReservation("email");
        return popup || { closed: false };
      }

      if (/^https:\/\/wa\.me\/918951919010(?:\?|$)/i.test(address)) {
        const popup = originalOpen(address, target || "_blank", features || "noopener,noreferrer");
        finishReservation("whatsapp");
        return popup;
      }

      return originalOpen(url, target, features);
    };

    addEventListener("pageshow", showRememberedNotice, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) showRememberedNotice();
    });
  }

  const core = document.createElement("script");
  core.src = CORE_SRC;
  core.async = false;
  core.onload = installSendPatch;
  core.onerror = () => console.error("KESAR reservation system could not load.");
  document.body.append(core);
})();
