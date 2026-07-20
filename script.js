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

    document.querySelectorAll(".reveal").forEach(item => revealObserver.observe(item));

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
      const weekend = day === "Sat" || day === "Sun";
      const openAt = 12 * 60;
      const closeAt = weekend ? 23 * 60 + 30 : 23 * 60;
      const isOpen = current >= openAt && current < closeAt;

      statusWrap.classList.toggle("open", isOpen);
      statusWrap.classList.toggle("closed", !isOpen);

      if (isOpen) {
        statusText.textContent = `Live now · open until ${weekend ? "11:30 PM" : "11:00 PM"}`;
      } else if (current < openAt) {
        statusText.textContent = "Closed now · opens 12:00 PM";
      } else {
        statusText.textContent = "Closed now · opens tomorrow 12:00 PM";
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

    reservationForm.addEventListener("submit", event => {
      event.preventDefault();
      toast.classList.add("show");
      reservationForm.reset();
      dateInput.min = new Date().toISOString().split("T")[0];
      setTimeout(() => toast.classList.remove("show"), 4200);
    });

    document.getElementById("year").textContent = new Date().getFullYear();
