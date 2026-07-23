(() => {
  "use strict";

  const SITE_URL="https://kesar-beige.vercel.app/";
  const HERO_IMAGE=`${SITE_URL}assets/images/heropage-mandi-4k.webp`;
  const PHONE="8951919010";
  const SECOND_PHONE="9823209987";
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
    if(!structured){structured=document.createElement("script");structured.type="application/ld+json";structured.id="kesarRestaurantSchema";document.head.append(structured);}
    structured.textContent=JSON.stringify({
      "@context":"https://schema.org","@type":"Restaurant",name:"Hotel KESAR",alternateName:"KESAR Mandi House Dining",url:SITE_URL,image:HERO_IMAGE,
      telephone:`+91${PHONE}`,email:EMAIL,servesCuisine:["Mandi","Arabian","Biryani","Indian","Grill"],priceRange:"₹₹",areaServed:"Bengaluru",
      openingHoursSpecification:[{"@type":"OpeningHoursSpecification",dayOfWeek:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],opens:"10:00",closes:"23:00"}],
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
        if(entries.some(entry=>entry.isIntersecting)){show();observer.disconnect();}
      },{threshold:.14,rootMargin:"0px 0px -8% 0px"});
      observer.observe(section);
    }else show();
  }

  function buildBulkOrders(){
    const orderOnline=document.querySelector("#order-online");
    if(!orderOnline)return null;
    loadStylesheet("/bulk-orders-reference.css?v=bulk-direct-reference-1","bulk-orders");
    const enquiry=encodeURIComponent("Hello Hotel Kesar, I would like to enquire about a bulk order. Please share the direct-order menu, current offers and delivery charges for my location.");
    let section=document.querySelector("#bulk-orders");
    if(!section){section=document.createElement("section");section.id="bulk-orders";section.className="bulk-orders-section";section.setAttribute("aria-labelledby","bulkOrdersTitle");}
    section.innerHTML=`<div class="bulk-orders-section__layout">
      <div class="bulk-orders-section__content">
        <header class="bulk-orders-section__brand" data-bulk-reveal>
          <div class="bulk-orders-section__crest" aria-hidden="true"><strong>K</strong><span>Hotel Kesar</span></div>
          <div class="bulk-orders-section__brand-copy"><strong>HOTEL KESAR</strong><span>Family Fine Dining Restaurant</span></div>
        </header>
        <div class="bulk-orders-section__body">
          <span class="bulk-orders-section__eyebrow" data-bulk-reveal><i aria-hidden="true"></i>Celebrations &amp; Catering</span>
          <h2 class="bulk-orders-section__title" id="bulkOrdersTitle" data-bulk-reveal>Bulk Orders</h2>
          <p class="bulk-orders-section__subtitle" data-bulk-reveal>For birthdays, kitty parties and group gatherings.</p>
          <div class="bulk-orders-section__ornament" aria-hidden="true"><span></span></div>
          <p class="bulk-orders-section__intro" data-bulk-reveal>From intimate get-togethers to grand celebrations, we serve mouthwatering dishes with generous portions, exclusive discounts and on-time delivery you can trust.</p>
          <div class="bulk-orders-section__features" data-bulk-reveal>
            <article class="bulk-orders-section__feature"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 25h20M8 25V14h16v11M11 14V9h10v5M13 9V6h6v3"/><path d="M12 19h8M12 22h8"/></svg><strong>Birthday Parties</strong></article>
            <article class="bulk-orders-section__feature"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="11" cy="10" r="4"/><circle cx="22" cy="11" r="3.5"/><path d="M4 26v-5c0-4 3-7 7-7s7 3 7 7v5M18 17c1-.8 2.2-1.2 3.5-1.2 3.6 0 6.5 2.8 6.5 6.4V26"/></svg><strong>Kitty Parties</strong></article>
            <article class="bulk-orders-section__feature"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 24h22M8 24v-8h16v8M11 16a5 5 0 0 1 10 0"/><path d="M16 8V5M9 12l-2-2M23 12l2-2"/></svg><strong>Bulk Orders</strong></article>
            <article class="bulk-orders-section__feature"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="6" y="6" width="20" height="20" rx="5"/><path d="m11 21 10-10M11 12h.01M21 20h.01"/></svg><strong>Discounted Direct Rates</strong></article>
            <article class="bulk-orders-section__feature"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 9h17v15H4zM21 14h4l3 4v6h-7z"/><circle cx="9" cy="25" r="2.5"/><circle cx="24" cy="25" r="2.5"/></svg><strong>Free Delivery Within 1 KM</strong></article>
            <article class="bulk-orders-section__feature"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 28s9-8 9-16a9 9 0 1 0-18 0c0 8 9 16 9 16Z"/><circle cx="16" cy="12" r="3"/></svg><strong>Charges Beyond 1 KM</strong></article>
          </div>
          <p class="bulk-orders-section__direct" data-bulk-reveal><span aria-hidden="true">✦</span><span><strong>Order directly from KESAR for better value.</strong> Marketplace prices on Swiggy or Zomato may be higher.</span></p>
          <div class="bulk-orders-section__availability" data-bulk-reveal>
            <span>Available on</span>
            <a class="bulk-orders-section__platform bulk-orders-section__platform--swiggy" href="${SWIGGY}" target="_blank" rel="noopener noreferrer" aria-label="View KESAR on Swiggy"><b aria-hidden="true"><span>S</span></b><strong>Swiggy</strong></a>
            <a class="bulk-orders-section__platform bulk-orders-section__platform--zomato" href="${ZOMATO}" target="_blank" rel="noopener noreferrer" aria-label="View KESAR on Zomato"><b aria-hidden="true"><span>Z</span></b><strong>Zomato</strong></a>
          </div>
          <div class="bulk-orders-section__contacts" data-bulk-reveal>
            <div class="bulk-orders-section__contact"><span class="bulk-orders-section__contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7.1 3.5 10 8l-2 2.1c1.2 2.4 3.3 4.5 5.8 5.7l2-2 4.6 2.9-.8 3.2c-.2.8-.9 1.3-1.7 1.3C10 21.2 2.8 14 2.8 6.1c0-.8.5-1.5 1.3-1.7z"/></svg></span><div><a href="tel:+918951919010">89519 19010</a><small>Verified Contact</small></div></div>
            <div class="bulk-orders-section__contact"><span class="bulk-orders-section__contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7.1 3.5 10 8l-2 2.1c1.2 2.4 3.3 4.5 5.8 5.7l2-2 4.6 2.9-.8 3.2c-.2.8-.9 1.3-1.7 1.3C10 21.2 2.8 14 2.8 6.1c0-.8.5-1.5 1.3-1.7z"/></svg></span><div><a href="tel:+919823209987">98232 09987</a><small>Verified Contact</small></div></div>
          </div>
          <div class="bulk-orders-section__delivery" data-bulk-reveal aria-label="Bulk order delivery terms"><span><b>Within 1 KM:</b> Free delivery on eligible bulk orders.</span><span><b>Beyond 1 KM:</b> Delivery charges apply based on distance.</span></div>
          <div class="bulk-orders-section__actions" data-bulk-reveal>
            <a class="bulk-orders-section__primary" href="https://wa.me/${WHATSAPP}?text=${enquiry}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3.5 20l1-4.4a8.4 8.4 0 1 1 16-3.9Z"/><path d="M8.1 7.6c.4-.4.8-.3 1.1.2l.9 2c.2.4.1.7-.2 1l-.6.7c.9 1.8 2.2 3 4 3.8l.6-.8c.3-.4.6-.5 1-.3l1.9.9c.5.2.6.6.3 1-.7 1-1.7 1.5-2.9 1.4-3.7-.4-7.5-4-8-7.8-.2-1.2.4-2.2 1.9-2.1Z"/></svg>Enquire on WhatsApp</a>
            <a class="bulk-orders-call-button" href="tel:+918951919010" aria-label="Call KESAR for bulk orders on 89519 19010"><span aria-hidden="true">☎</span><span>Call Us</span></a>
          </div>
          <p class="bulk-orders-section__note">Advance notice is recommended for large orders.</p>
        </div>
      </div>
      <figure class="bulk-orders-section__media" data-bulk-reveal>
        <img src="/assets/images/bulk-order.png" loading="lazy" decoding="async" alt="KESAR grilled chicken prepared for bulk orders and celebrations">
        <figcaption class="bulk-orders-section__offer" aria-label="Monsoon offer: 12 percent off orders above 8999 rupees"><small>Monsoon</small><strong>Offer</strong><span>12% OFF</span><b>On orders above ₹8,999*</b></figcaption>
        <p class="bulk-orders-section__terms">*Terms &amp; conditions apply.</p>
      </figure>
    </div>`;
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
          <div class="why-kesar-page__actions" data-why-reveal><a class="why-kesar-page__primary" href="#reservation">Reserve a table →</a><a class="why-kesar-page__secondary" href="#order-online">Order online ↗</a></div>
        </div>
        <figure class="why-kesar-page__media" data-why-reveal><img src="/assets/images/storypage-mandi2.png" width="1122" height="1402" loading="lazy" decoding="async" alt="A generous KESAR mandi feast prepared for sharing"><figcaption class="why-kesar-page__hours"><span>Open daily</span><strong>10:00 AM–11:00 PM</strong></figcaption></figure>
      </div>`;
    }
    if(section.previousElementSibling!==anchor)anchor.insertAdjacentElement("afterend",section);
    observeEntrance(section,"is-visible");
  }

  function optimizeImages(){
    const hero=document.querySelector("#heroMedia img");
    if(hero){hero.fetchPriority="high";hero.decoding="async";hero.removeAttribute("loading");}
    document.querySelectorAll("main img").forEach(img=>{if(img===hero)return;img.loading="lazy";img.decoding="async";img.fetchPriority="low";});
  }

  function trimMobileDom(){
    if(!isMobile)return;
    document.querySelector("#story .story-editorial__media--saffron")?.remove();
    /* Keep the combo summary nodes in the DOM. Mobile CSS hides the visual card,
       while the shared selection controller still updates its state safely. */
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
      const observer=new IntersectionObserver(entries=>{bar.classList.toggle("is-hidden",entries.some(entry=>entry.isIntersecting));},{threshold:.12});
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