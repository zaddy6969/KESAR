(() => {
  "use strict";

  const SITE_URL="https://kesar-beige.vercel.app/";
  const HERO_IMAGE=`${SITE_URL}assets/images/heropage-mandi-4k.webp`;
  const PHONE="8951919010";
  const WHATSAPP="918951919010";
  const EMAIL="hotelkesar41@gmail.com";
  const isMobile=matchMedia("(max-width: 767px)").matches;

  function setMeta(selector,attributes){
    let node=document.head.querySelector(selector);
    if(!node){node=document.createElement("meta");document.head.append(node);}
    Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,value));
    return node;
  }

  function setupSeo(){
    document.title="KESAR | Premium Mandi Restaurant in Bengaluru";
    setMeta('meta[name="description"]',{name:"description",content:"Hotel KESAR serves slow-roasted mandi, charcoal grills, biryani and generous family feasts in Bengaluru. Reserve a table or order online through Swiggy and Zomato."});
    setMeta('meta[name="robots"]',{name:"robots",content:"index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"});
    setMeta('meta[name="format-detection"]',{name:"format-detection",content:"telephone=yes"});
    setMeta('meta[property="og:type"]',{property:"og:type",content:"restaurant"});
    setMeta('meta[property="og:title"]',{property:"og:title",content:"KESAR — Mandi House Dining"});
    setMeta('meta[property="og:description"]',{property:"og:description",content:"Premium mandi, grills, biryani and generous family dining in Bengaluru."});
    setMeta('meta[property="og:url"]',{property:"og:url",content:SITE_URL});
    setMeta('meta[property="og:image"]',{property:"og:image",content:HERO_IMAGE});
    setMeta('meta[property="og:locale"]',{property:"og:locale",content:"en_IN"});
    setMeta('meta[name="twitter:card"]',{name:"twitter:card",content:"summary_large_image"});
    setMeta('meta[name="twitter:title"]',{name:"twitter:title",content:"KESAR — Mandi House Dining"});
    setMeta('meta[name="twitter:description"]',{name:"twitter:description",content:"Premium mandi and family dining in Bengaluru."});
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
      sameAs:[
        "https://www.swiggy.com/city/bangalore/hotel-kesar-fine-dine-basaveshwaranagar-rest1288354",
        "https://www.zomato.com/bangalore/hotel-kesar-family-dine-veg-and-non-veg-peenya-bangalore"
      ]
    });
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
  optimizeImages();
  trimMobileDom();
  setupMobileActions();
})();
