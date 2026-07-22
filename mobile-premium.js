(() => {
  "use strict";

  const SITE_URL="https://kesar-beige.vercel.app/";
  const HERO_IMAGE=`${SITE_URL}assets/images/heropage-mandi-4k.webp`;
  const PHONE="8951919010";
  const WHATSAPP="918951919010";
  const EMAIL="hotelkesar41@gmail.com";
  const SWIGGY="https://www.swiggy.com/city/bangalore/hotel-kesar-fine-dine-basaveshwaranagar-rest1288354";
  const ZOMATO="https://www.zomato.com/bangalore/hotel-kesar-family-dine-veg-and-non-veg-peenya-bangalore";
  const isMobile=matchMedia("(max-width: 767px)").matches;

  function setMeta(selector,attributes){
    let node=document.head.querySelector(selector);
    if(!node){node=document.createElement("meta");document.head.append(node);}
    Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,value));
    return node;
  }

  function setupSeo(){
    document.title="KESAR | Premium Mandi Restaurant in Bengaluru";
    setMeta('meta[name="description"]',{name:"description",content:"Hotel KESAR serves slow-roasted mandi, charcoal grills, biryani, family feasts and bulk orders for celebrations in Bengaluru."});
    setMeta('meta[name="robots"]',{name:"robots",content:"index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"});
    setMeta('meta[name="format-detection"]',{name:"format-detection",content:"telephone=yes"});
    setMeta('meta[property="og:type"]',{property:"og:type",content:"restaurant"});
    setMeta('meta[property="og:title"]',{property:"og:title",content:"KESAR — Mandi House Dining"});
    setMeta('meta[property="og:description"]',{property:"og:description",content:"Premium mandi, grills, family dining and bulk orders in Bengaluru."});
    setMeta('meta[property="og:url"]',{property:"og:url",content:SITE_URL});
    setMeta('meta[property="og:image"]',{property:"og:image",content:HERO_IMAGE});
    setMeta('meta[property="og:locale"]',{property:"og:locale",content:"en_IN"});
    setMeta('meta[name="twitter:card"]',{name:"twitter:card",content:"summary_large_image"});
    setMeta('meta[name="twitter:title"]',{name:"twitter:title",content:"KESAR — Mandi House Dining"});
    setMeta('meta[name="twitter:description"]',{name:"twitter:description",content:"Premium mandi, family dining and bulk orders in Bengaluru."});
    setMeta('meta[name="twitter:image"]',{name:"twitter:image",content:HERO_IMAGE});

    let canonical=document.head.querySelector('link[rel="canonical"]');
    if(!canonical){canonical=document.createElement("link");canonical.rel="canonical";document.head.append(canonical);}
    canonical.href=SITE_URL;

    let structured=document.getElementById("kesarRestaurantSchema");
    if(!structured){
      structured=document.createElement("script");
      structured.type="application/ld+json";
      structured.id="kesarRestaurantSchema";
      document.head.append(structured);
    }
    structured.textContent=JSON.stringify({
      "@context":"https://schema.org",
      "@type":"Restaurant",
      name:"Hotel KESAR",
      alternateName:"KESAR Mandi House Dining",
      url:SITE_URL,
      image:HERO_IMAGE,
      telephone:`+91${PHONE}`,
      email:EMAIL,
      servesCuisine:["Mandi","Arabian","Biryani","Indian","Grill"],
      priceRange:"₹₹",
      areaServed:"Bengaluru",
      openingHoursSpecification:[{
        "@type":"OpeningHoursSpecification",
        dayOfWeek:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        opens:"10:00",
        closes:"23:00"
      }],
      sameAs:[SWIGGY,ZOMATO]
    });
  }

  function loadStylesheet(href,key){
    if(document.querySelector(`link[data-kesar-${key}]`))return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href=href;
    link.dataset[`kesar${key.split("-").map(part=>part[0].toUpperCase()+part.slice(1)).join("")}`]="true";
    document.head.append(link);
  }

  function observeEntrance(section,visibleClass){
    if(!section||section.dataset.entranceBound==="true")return;
    section.dataset.entranceBound="true";
    const show=()=>section.classList.add(visibleClass);
    if(matchMedia("(prefers-reduced-motion: reduce)").matches){show();return;}
    if("IntersectionObserver" in window){
      const observer=new IntersectionObserver(entries=>{
        if(entries.some(entry=>entry.isIntersecting)){
          show();
          observer.disconnect();
        }
      },{threshold:.14,rootMargin:"0px 0px -8% 0px"});
      observer.observe(section);
    }else show();
  }

  function buildBulkOrders(){
    const orderOnline=document.querySelector("#order-online");
    if(!orderOnline)return null;

    loadStylesheet("/bulk-orders.css?v=bulk-orders-1","bulk-orders");
    let section=document.querySelector("#bulk-orders");
    if(!section){
      const enquiry=encodeURIComponent("Hello Hotel Kesar, I would like to enquire about a bulk food order for a celebration. Please share available packages, delivery options and current offers.");
      section=document.createElement("section");
      section.id="bulk-orders";
      section.className="bulk-orders-section";
      section.setAttribute("aria-labelledby","bulkOrdersTitle");
      section.innerHTML=`<div class="bulk-orders-section__layout">
        <div class="bulk-orders-section__content">
          <span class="bulk-orders-section__eyebrow" data-bulk-reveal>Celebrations &amp; Catering</span>
          <h2 class="bulk-orders-section__title" id="bulkOrdersTitle" data-bulk-reveal>Bulk <em>Orders.</em></h2>
          <p class="bulk-orders-section__intro" data-bulk-reveal>Bring KESAR to birthdays, office gatherings, family celebrations and larger tables with freshly prepared mandi, grills and generous combinations.</p>
          <div class="bulk-orders-section__features" data-bulk-reveal>
            <article class="bulk-orders-section__feature">
              <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 25h22M8 25V14h16v11M11 14V9h10v5M13 9V6h6v3"/><path d="M12 19h8M12 22h8"/></svg>
              <div><small>Made for gatherings</small><strong>Party-size orders</strong></div>
            </article>
            <article class="bulk-orders-section__feature">
              <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 8h17v15H4zM21 13h4l3 4v6h-7z"/><circle cx="9" cy="24" r="2.5"/><circle cx="24" cy="24" r="2.5"/></svg>
              <div><small>Planned with care</small><strong>Delivery support</strong></div>
            </article>
          </div>
          <div class="bulk-orders-section__availability" data-bulk-reveal>
            <span>Also available on</span>
            <a class="bulk-orders-section__platform" href="${SWIGGY}" target="_blank" rel="noopener noreferrer" aria-label="View KESAR on Swiggy">Swiggy ↗</a>
            <a class="bulk-orders-section__platform" href="${ZOMATO}" target="_blank" rel="noopener noreferrer" aria-label="View KESAR on Zomato">Zomato ↗</a>
          </div>
          <div class="bulk-orders-section__contacts" data-bulk-reveal>
            <div class="bulk-orders-section__contact"><span>Call for bulk orders</span><a href="tel:+91${PHONE}">+91 89519 19010</a></div>
            <div class="bulk-orders-section__contact"><span>WhatsApp enquiries</span><a href="https://wa.me/${WHATSAPP}?text=${enquiry}" target="_blank" rel="noopener noreferrer">+91 89519 19010</a></div>
          </div>
          <div class="bulk-orders-section__actions" data-bulk-reveal>
            <a class="bulk-orders-section__primary" href="https://wa.me/${WHATSAPP}?text=${enquiry}" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp →</a>
            <a class="bulk-orders-section__secondary" href="tel:+91${PHONE}">Call KESAR ↗</a>
          </div>
        </div>
        <figure class="bulk-orders-section__media" data-bulk-reveal>
          <img src="/assets/images/bulk-order.png" loading="lazy" decoding="async" alt="KESAR grilled chicken prepared for bulk orders and celebrations">
          <figcaption class="bulk-orders-section__offer" aria-label="Monsoon offer available for bulk orders">
            <small>Seasonal</small><strong>Monsoon Offer</strong><span>Ask our team for current bulk-order rates</span>
          </figcaption>
        </figure>
      </div>`;
    }

    if(section.previousElementSibling!==orderOnline)orderOnline.insertAdjacentElement("afterend",section);
    observeEntrance(section,"is-visible");
    return section;
  }

  function buildWhyKesar(){
    loadStylesheet("/why-kesar.css?v=why-kesar-white-1","why-page");
    const anchor=document.querySelector("#bulk-orders")||document.querySelector("#order-online");
    if(!anchor)return;

    let section=document.querySelector("#why-kesar-page");
    if(!section){
      section=document.createElement("section");
      section.id="why-kesar-page";
      section.className="why-kesar-page";
      section.setAttribute("aria-labelledby","whyKesarTitle");
      section.innerHTML=`<div class="why-kesar-page__shell">
        <div class="why-kesar-page__copy">
          <span class="why-kesar-page__eyebrow" data-why-reveal>Why Kesar</span>
          <h2 class="why-kesar-page__title" id="whyKesarTitle" data-why-reveal>Where every gathering <em>feels generous.</em></h2>
          <p class="why-kesar-page__lead" data-why-reveal>Slow fire, fragrant rice and thoughtful hospitality—made for families, celebrations and tables that stay a little longer.</p>
          <div class="why-kesar-page__reasons" data-why-reveal>
            <article class="why-kesar-page__reason"><span>01</span><h3>Slow-roasted with patience</h3><p>Meats are cooked gently so every serving stays tender, smoky and full of flavour.</p></article>
            <article class="why-kesar-page__reason"><span>02</span><h3>Feasts made for sharing</h3><p>Generous combinations bring families and friends together around one memorable table.</p></article>
            <article class="why-kesar-page__reason"><span>03</span><h3>Fragrant mandi rice</h3><p>Long-grain rice, warm spices and careful balance complete every KESAR platter.</p></article>
            <article class="why-kesar-page__reason"><span>04</span><h3>Hospitality that feels personal</h3><p>From the first welcome to the final serving, the experience is warm and unhurried.</p></article>
          </div>
          <div class="why-kesar-page__actions" data-why-reveal>
            <a class="why-kesar-page__primary" href="#reservation">Reserve a table →</a>
            <a class="why-kesar-page__secondary" href="#order-online">Order online ↗</a>
          </div>
        </div>
        <figure class="why-kesar-page__media" data-why-reveal>
          <img src="/assets/images/storypage-mandi2.png" width="1122" height="1402" loading="lazy" decoding="async" alt="A generous KESAR mandi feast prepared for sharing">
          <figcaption class="why-kesar-page__hours"><span>Open daily</span><strong>10:00 AM–11:00 PM</strong></figcaption>
        </figure>
      </div>`;
    }

    if(section.previousElementSibling!==anchor)anchor.insertAdjacentElement("afterend",section);
    observeEntrance(section,"is-visible");
  }

  function optimizeImages(){
    const hero=document.querySelector("#heroMedia img");
    if(hero){hero.fetchPriority="high";hero.decoding="async";hero.removeAttribute("loading");}
    document.querySelectorAll("main img").forEach(img=>{
      if(img===hero)return;
      img.loading="lazy";
      img.decoding="async";
      img.fetchPriority="low";
    });
  }

  function trimMobileDom(){
    if(!isMobile)return;
    document.querySelector("#story .story-editorial__media--saffron")?.remove();
    document.querySelector("#menu-combos .combo-summary")?.remove();
  }

  function setupMobileActions(){
    if(!isMobile||document.querySelector(".kesar-mobile-actions"))return;
    const bar=document.createElement("nav");
    bar.className="kesar-mobile-actions";
    bar.setAttribute("aria-label","Quick restaurant actions");
    const text=encodeURIComponent("Hello Hotel Kesar, I would like to know about table availability.");
    bar.innerHTML=`<a class="kesar-mobile-actions__whatsapp" href="https://wa.me/${WHATSAPP}?text=${text}" target="_blank" rel="noopener noreferrer" aria-label="Contact Hotel Kesar on WhatsApp">WhatsApp</a><a class="kesar-mobile-actions__reserve" href="#reservation">Reserve</a>`;
    document.body.append(bar);
    document.body.classList.add("has-kesar-mobile-actions");

    const reservationActions=document.querySelector("#reservation .reservation-submit-actions");
    if(reservationActions&&"IntersectionObserver" in window){
      const observer=new IntersectionObserver(entries=>{
        bar.classList.toggle("is-hidden",entries.some(entry=>entry.isIntersecting));
      },{threshold:.12});
      observer.observe(reservationActions);
    }
  }

  setupSeo();
  buildBulkOrders();
  buildWhyKesar();
  optimizeImages();
  trimMobileDom();
  setupMobileActions();
})();
