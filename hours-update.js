(() => {
  "use strict";

  const OPEN_MINUTES = 12 * 60 + 30;
  const CLOSE_MINUTES = 23 * 60;
  const HOURS_LABEL = "12:30 PM–11:00 PM";
  const WHY_KESAR_IMAGE = "/assets/images/why-kesar.png";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const setText = (element, value) => {
    if (element && element.textContent !== value) element.textContent = value;
  };

  function indiaTime() {
    return Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date()).map(part => [part.type, part.value]));
  }

  function syncLiveHours() {
    const parts = indiaTime();
    const hour = Number(parts.hour);
    const minute = Number(parts.minute);
    const current = hour * 60 + minute;
    const isOpen = current >= OPEN_MINUTES && current < CLOSE_MINUTES;

    const status = isOpen
      ? "Open now · closes at 11:00 PM"
      : current < OPEN_MINUTES
        ? "Closed now · opens today at 12:30 PM"
        : "Closed now · opens tomorrow at 12:30 PM";

    setText($("#statusText"), status);
    setText($("#liveTime"), `${hour % 12 || 12}:${parts.minute} ${hour >= 12 ? "PM" : "AM"} · Bengaluru time`);
    $("#heroStatus")?.classList.toggle("open", isOpen);
    setText($("#todayHours"), `Today · ${HOURS_LABEL} · Bengaluru time`);
    setText($("#compactHours"), `Today · ${HOURS_LABEL} · Bengaluru time`);
    setText($("#footerToday"), HOURS_LABEL);
  }

  function syncStaticHours() {
    const reservationCopy = $("#reservation .reservation-head > p");
    if (reservationCopy && reservationCopy.textContent.includes("We are open daily from")) {
      const updated = reservationCopy.innerHTML.replace(
        /We are open daily from\s+[^.]+\./,
        `We are open daily from ${HOURS_LABEL}.`
      );
      if (reservationCopy.innerHTML !== updated) reservationCopy.innerHTML = updated;
    }

    setText($(".reservation-contact-bar strong"), `Daily · ${HOURS_LABEL}`);
    setText($(".footer-luxury-hours:not(.footer-luxury-today) strong"), HOURS_LABEL);
    setText($("#why-kesar-page .why-kesar-page__hours strong"), HOURS_LABEL);

    const oldFooterParagraphs = $$("footer:not(.footer-luxury-ready) .footer-grid > div:nth-child(2) p");
    if (oldFooterParagraphs[2]) setText(oldFooterParagraphs[2], `Daily · ${HOURS_LABEL}`);
    if (oldFooterParagraphs[3]) oldFooterParagraphs[3].hidden = true;
    if (oldFooterParagraphs[4]) oldFooterParagraphs[4].hidden = true;
  }

  function ensureWhyKesarStyle() {
    if (document.getElementById("kesarWhyKesarImageFade")) return;
    const style = document.createElement("style");
    style.id = "kesarWhyKesarImageFade";
    style.textContent = `
      #why-kesar-page .why-kesar-page__media::after {
        background:
          linear-gradient(90deg,
            rgba(246,241,233,.98) 0%,
            rgba(246,241,233,.84) 14%,
            rgba(246,241,233,.52) 29%,
            rgba(246,241,233,.18) 45%,
            rgba(246,241,233,0) 62%),
          linear-gradient(0deg,
            rgba(16,12,8,.62) 0%,
            rgba(16,12,8,.22) 25%,
            rgba(16,12,8,0) 48%) !important;
      }
      #why-kesar-page .why-kesar-page__media img {
        object-position:center center !important;
      }
      @media (max-width:767px) {
        #why-kesar-page .why-kesar-page__media::after {
          background:
            linear-gradient(90deg,
              rgba(246,241,233,.78) 0%,
              rgba(246,241,233,.34) 18%,
              rgba(246,241,233,0) 42%),
            linear-gradient(0deg,
              rgba(16,12,8,.66) 0%,
              rgba(16,12,8,.22) 28%,
              rgba(16,12,8,0) 52%) !important;
        }
      }
    `;
    document.head.append(style);
  }

  function syncWhyKesar() {
    ensureWhyKesarStyle();
    const image = $("#why-kesar-page .why-kesar-page__media img");
    if (!image) return;

    if (image.getAttribute("src") !== WHY_KESAR_IMAGE) {
      image.src = WHY_KESAR_IMAGE;
      image.removeAttribute("width");
      image.removeAttribute("height");
    }
    if (image.alt !== "Hotel KESAR family dining experience") {
      image.alt = "Hotel KESAR family dining experience";
    }
  }

  function populateReservationTimes() {
    const date = $("#date");
    const select = $("#time");
    if (!date || !select || !date.value) return;

    const options = [...select.options].filter(option => option.value);
    const alreadyCorrect = options.length === 21
      && options[0]?.value === "12:30"
      && options.at(-1)?.value === "22:30";
    if (alreadyCorrect) return;

    select.innerHTML = '<option value="">Choose a time</option>';
    for (let total = OPEN_MINUTES; total <= CLOSE_MINUTES - 30; total += 30) {
      const hour = Math.floor(total / 60);
      const minute = total % 60;
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const option = document.createElement("option");
      option.value = value;
      option.textContent = `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
      select.append(option);
    }
    select.disabled = false;
  }

  function ensureCateringNavigation() {
    const cateringLink = `
      <a
        class="nav-catering"
        href="https://house-of-saara.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit House of Saara catering services, opens in a new tab"
      >
        Catering Services
        <span aria-hidden="true">↗</span>
      </a>`;

    const desktopReserve = $(".nav-right .nav-reserve");
    if (desktopReserve && !$(".nav-right .nav-catering")) {
      desktopReserve.insertAdjacentHTML("beforebegin", cateringLink);
    }

    const mobileNav = $("#mobileMenu nav");
    const mobileReserve = mobileNav?.querySelector('a[href="#reservation"]');
    if (mobileReserve && !mobileNav.querySelector(".nav-catering")) {
      mobileReserve.insertAdjacentHTML("beforebegin", cateringLink);
      const mobileCatering = mobileNav.querySelector(".nav-catering");
      mobileCatering?.addEventListener("click", () => {
        const menu = $("#mobileMenu");
        const toggle = $("#menuToggle");
        menu?.classList.remove("open");
        menu?.setAttribute("aria-hidden", "true");
        toggle?.setAttribute("aria-expanded", "false");
        if (toggle) toggle.textContent = "Menu";
        document.body.classList.remove("menu-open");
      });
    }
  }

  function refresh() {
    ensureCateringNavigation();
    syncLiveHours();
    syncStaticHours();
    syncWhyKesar();
    populateReservationTimes();
  }

  document.addEventListener("change", event => {
    if (event.target?.id === "date") setTimeout(populateReservationTimes, 30);
  }, true);

  let refreshQueued = false;
  const observer = new MutationObserver(() => {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => {
      refreshQueued = false;
      refresh();
    });
  });

  const start = () => {
    refresh();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    setInterval(refresh, 30000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();