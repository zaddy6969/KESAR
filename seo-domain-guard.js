(() => {
  "use strict";

  const SITE_URL = "https://hotelkesar.com/";
  const HERO_IMAGE = `${SITE_URL}assets/images/heropage-mandi-4k.webp`;
  const TITLE = "Hotel KESAR | Mandi, Family Dining & Bulk Orders in Bengaluru";
  const DESCRIPTION = "Hotel KESAR serves slow-roasted mandi, charcoal grills, biryani, family feasts and bulk orders in Bengaluru.";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Hotel KESAR",
    alternateName: "KESAR Mandi House Dining",
    url: SITE_URL,
    image: HERO_IMAGE,
    telephone: "+918951919010",
    email: "hotelkesar41@gmail.com",
    servesCuisine: ["Mandi", "Arabian", "Biryani", "Indian", "Grill"],
    priceRange: "₹₹",
    areaServed: "Bengaluru",
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "10:00",
      closes: "23:00"
    }],
    sameAs: [
      "https://www.swiggy.com/city/bangalore/hotel-kesar-fine-dine-basaveshwaranagar-rest1288354",
      "https://www.zomato.com/bangalore/hotel-kesar-family-dine-veg-and-non-veg-peenya-bangalore"
    ]
  };

  function setMeta(selector, attribute, value) {
    const node = document.head.querySelector(selector);
    if (node && node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }

  function applyStaticSeo() {
    if (document.title !== TITLE) document.title = TITLE;

    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical && canonical.href !== SITE_URL) canonical.href = SITE_URL;

    setMeta('meta[name="description"]', "content", DESCRIPTION);
    setMeta('meta[property="og:url"]', "content", SITE_URL);
    setMeta('meta[property="og:image"]', "content", HERO_IMAGE);
    setMeta('meta[name="twitter:image"]', "content", HERO_IMAGE);

    const structured = document.getElementById("kesarRestaurantSchema");
    const expected = JSON.stringify(schema);
    if (structured && structured.textContent.trim() !== expected) structured.textContent = expected;
  }

  applyStaticSeo();
  document.addEventListener("DOMContentLoaded", applyStaticSeo, { once: true });
  window.addEventListener("pageshow", applyStaticSeo, { passive: true });

  const observer = new MutationObserver(applyStaticSeo);
  observer.observe(document.head, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["content", "href"]
  });
})();
