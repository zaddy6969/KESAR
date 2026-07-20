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

    document.addEventListener("kesar:observe-reveals", event => {
      const nodes = event.detail?.nodes;
      if (!nodes || typeof nodes[Symbol.iterator] !== "function") return;
      [...nodes].forEach(node => {
        if (node instanceof Element && node.matches(".reveal, .story-reveal")) {
          revealObserver.observe(node);
        }
      });
    });

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

    document.getElementById("year").textContent = new Date().getFullYear();
