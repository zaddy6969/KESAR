    const header = document.getElementById("siteHeader");
    const menuButton = document.getElementById("menuButton");
    const mobilePanel = document.getElementById("mobilePanel");

    function updateHeader() {
      header.classList.toggle("scrolled", window.scrollY > 40);
    }
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    function setMenu(open) {
      mobilePanel.classList.toggle("open", open);
      mobilePanel.setAttribute("aria-hidden", String(!open));
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.textContent = open ? "Close" : "Menu";
      document.body.classList.toggle("menu-open", open);
    }

    menuButton.addEventListener("click", () => {
      setMenu(!mobilePanel.classList.contains("open"));
    });

    mobilePanel.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => setMenu(false));
    });

    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );

    document.querySelectorAll(".reveal, .story-reveal").forEach(item => revealObserver.observe(item));

    const statusWrap = document.getElementById("liveStatusWrap");
    const statusText = document.getElementById("liveStatus");
    const timeText = document.getElementById("liveTime");

    function updateRestaurantStatus() {
      const now = new Date();
      const parts = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).formatToParts(now);

      const getPart = type => parts.find(part => part.type === type)?.value;
      const day = getPart("weekday");
      const hour = Number(getPart("hour")) % 24;
      const minute = Number(getPart("minute"));
      const current = hour * 60 + minute;
      const openingMinutes = weekday => weekday === "Fri" ? 17 * 60 : 13 * 60;
      const openAt = openingMinutes(day);
      const closeAt = 23 * 60;
      const isOpen = current >= openAt && current < closeAt;
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const nextDay = weekdays[(weekdays.indexOf(day) + 1) % weekdays.length];
      const formatOpening = minutes => minutes === 17 * 60 ? "5:00 PM" : "1:00 PM";

      statusWrap.classList.toggle("open", isOpen);
      statusWrap.classList.toggle("closed", !isOpen);

      if (isOpen) {
        statusText.textContent = "Live now · open until 11:00 PM";
      } else if (current < openAt) {
        statusText.textContent = `Closed now · opens ${formatOpening(openAt)}`;
      } else {
        statusText.textContent = `Closed now · opens tomorrow ${formatOpening(openingMinutes(nextDay))}`;
      }

      timeText.textContent = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }).format(now) + " IST";
    }

    updateRestaurantStatus();
    setInterval(updateRestaurantStatus, 30000);

    const dateInput = document.getElementById("date");
    dateInput.min = new Date().toISOString().split("T")[0];

    const reservationForm = document.getElementById("reservationForm");
    const toast = document.getElementById("toast");
    let toastTimer;

    function showToast(message) {
      window.clearTimeout(toastTimer);
      toast.textContent = message;
      toast.classList.add("show");
      toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4200);
    }

    reservationForm.addEventListener("submit", event => {
      event.preventDefault();
      showToast("Your reservation request has been received. The Kesar team will contact you shortly.");
      reservationForm.reset();
      dateInput.min = new Date().toISOString().split("T")[0];
    });

    const menuComboCards = [...document.querySelectorAll("[data-menu-combo-card]")];
    const menuPartyButtons = [...document.querySelectorAll("[data-menu-combo-target]")];
    const menuSelectionStatus = document.getElementById("menuSelectionStatus");
    const reservationGuests = document.getElementById("guests");
    const reservationNotes = document.getElementById("message");
    const reduceMenuMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setSelectedMenuCombo(card, shouldScroll = false) {
      if (!card) return;

      menuComboCards.forEach(candidate => {
        const selected = candidate === card;
        candidate.open = selected;
        candidate.classList.toggle("is-selected", selected);
      });

      menuPartyButtons.forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.menuComboTarget === card.id));
      });

      menuSelectionStatus.textContent = `${card.dataset.menuComboName} for ${card.dataset.menuComboParty} · ${card.dataset.menuComboPrice} · unlimited mandi rice included.`;

      if (shouldScroll) {
        card.scrollIntoView({
          behavior: reduceMenuMotion ? "auto" : "smooth",
          block: "center"
        });
      }
    }

    menuPartyButtons.forEach(button => {
      button.addEventListener("click", () => {
        setSelectedMenuCombo(document.getElementById(button.dataset.menuComboTarget), true);
      });
    });

    menuComboCards.forEach(card => {
      card.addEventListener("toggle", () => {
        if (card.open) {
          setSelectedMenuCombo(card);
        } else if (!menuComboCards.some(candidate => candidate.open)) {
          card.classList.remove("is-selected");
          menuPartyButtons.forEach(button => button.setAttribute("aria-pressed", "false"));
          menuSelectionStatus.textContent = "Choose a party size to find your Kesar feast.";
        }
      });
    });

    document.querySelectorAll("[data-menu-plan]").forEach(button => {
      button.addEventListener("click", () => {
        const card = button.closest("[data-menu-combo-card]");
        const feast = `${card.dataset.menuComboName} for ${card.dataset.menuComboParty}`;

        reservationGuests.value = button.dataset.guests;
        reservationGuests.dispatchEvent(new Event("change", { bubbles: true }));

        if (!reservationNotes.value.trim()) {
          reservationNotes.value = `Interested in the ${feast} (${card.dataset.menuComboPrice}).`;
        }

        showToast(`${feast} selected. Complete your reservation details below.`);
        document.getElementById("reservation").scrollIntoView({
          behavior: reduceMenuMotion ? "auto" : "smooth",
          block: "start"
        });

        window.setTimeout(() => {
          document.getElementById("name").focus({ preventScroll: true });
        }, reduceMenuMotion ? 0 : 650);
      });
    });

    document.getElementById("year").textContent = new Date().getFullYear();
