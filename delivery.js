(() => {
  "use strict";

  const KESAR_DELIVERY = Object.freeze({
    // The supplied links appear to point to different Bengaluru locations.
    // Keep both URLs unchanged until branch ownership is confirmed.
    swiggy: Object.freeze({
      label: "Swiggy",
      url: "https://www.swiggy.com/city/bangalore/hotel-kesar-fine-dine-basaveshwaranagar-rest1288354",
      branch: "Basaveshwaranagar"
    }),
    zomato: Object.freeze({
      label: "Zomato",
      url: "https://www.zomato.com/bangalore/hotel-kesar-family-dine-veg-and-non-veg-peenya-bangalore",
      branch: "Peenya"
    })
  });

  const LOADER_TOTAL_MS = 1500;
  const LOADER_EXIT_MS = 850;
  const LOADER_HOLD_MS = Math.max(0, LOADER_TOTAL_MS - LOADER_EXIT_MS);
  const loaderStart = performance.now();

  function shortenLoader() {
    const elapsed = performance.now() - loaderStart;
    window.setTimeout(() => {
      document.body.classList.add("loaded", "loader-release");
      document.body.classList.remove("loader-hold", "is-loading");
      window.setTimeout(() => {
        document.body.classList.add("loader-done");
      }, LOADER_EXIT_MS);
    }, Math.max(0, LOADER_HOLD_MS - elapsed));
  }

  function configureDeliveryLinks() {
    document.querySelectorAll("[data-delivery-platform]").forEach(link => {
      const platform = link.dataset.deliveryPlatform;
      const config = KESAR_DELIVERY[platform];

      if (!config?.url) {
        link.hidden = true;
        link.removeAttribute("href");
        return;
      }

      link.hidden = false;
      link.href = config.url;
      link.dataset.deliveryBranch = config.branch || "";

      link.addEventListener("click", () => {
        window.dataLayer?.push({
          event: "delivery_platform_click",
          platform
        });
      });
    });
  }

  function configureDeliveryImage() {
    const image = document.querySelector("#order-online .delivery-section__media img");
    if (!image) return;

    image.src = "/assets/images/deliverypage.png";
    image.alt = "Kesar mandi platter prepared for delivery";
    image.removeAttribute("srcset");
  }

  shortenLoader();
  configureDeliveryLinks();
  configureDeliveryImage();
})();