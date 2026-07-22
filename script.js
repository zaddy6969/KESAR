(() => {
  "use strict";
  const BASE_SCRIPT = "/base.js";
  const $ = (query, root = document) => root.querySelector(query);
  const $$ = (query, root = document) => [...root.querySelectorAll(query)];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smallScreen = matchMedia("(max-width: 767px)").matches;
  const saveData = Boolean(navigator.connection?.saveData);
  const loaderStarted = performance.now();
  document.body.classList.add("loader-hold");

  function releaseLoader(){
    const wait=Math.max(0,650-(performance.now()-loaderStarted));
    setTimeout(()=>{
      document.body.classList.add("loaded","loader-release");
      document.body.classList.remove("loader-hold","is-loading");
      setTimeout(()=>document.body.classList.add("loader-done"),850);
    },wait);
  }

  function loadPremiumEnhancements(){
    const start=()=>{
      if(smallScreen&&!document.querySelector('link[data-kesar-mobile-premium]')){
        const link=document.createElement("link");
        link.rel="stylesheet";
        link.href="/mobile-premium.css?v=mobile-premium-1";
        link.media="(max-width: 767px)";
        link.dataset.kesarMobilePremium="true";
        document.head.append(link);
      }
      if(!document.querySelector('script[data-kesar-premium-enhancements]')){
        const enhancement=document.createElement("script");
        enhancement.src="/mobile-premium.js?v=bulk-reference-1";
        enhancement.async=true;
        enhancement.dataset.kesarPremiumEnhancements="true";
        document.body.append(enhancement);
      }
      if(!document.querySelector('script[data-kesar-hours-update]')){
        const hoursUpdate=document.createElement("script");
        hoursUpdate.src="/hours-update.js?v=why-kesar-image-fade-1";
        hoursUpdate.async=true;
        hoursUpdate.dataset.kesarHoursUpdate="true";
        document.body.append(hoursUpdate);
      }
    };
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
    else start();
  }

  function loadStoryStyles(){
    if(document.querySelector('link[data-kesar-story-editorial]'))return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="/story-editorial.css?v=rounded-frame-1";
    link.dataset.kesarStoryEditorial="true";
    document.head.append(link);
  }

  function setupStoryMotion(section){
    const animated=[
      $(".story-editorial__symbol",section),
      ...$$(".story-editorial__title span",section),
      $(".story-editorial__description",section),
      $(".story-editorial__media--main",section),
      $(".story-editorial__media--saffron",section)
    ].filter(Boolean);

    section.classList.add("story-motion-ready");

    const play=()=>{
      if(section.dataset.motionPlayed==="true")return;
      section.dataset.motionPlayed="true";
      section.classList.add("story-motion-active");
      animated.forEach((element,index)=>{
        setTimeout(()=>element.classList.add("visible"),index*85);
      });
    };

    if(reducedMotion){
      animated.forEach(element=>element.classList.add("visible"));
      section.classList.add("story-motion-active");
      return;
    }

    if("IntersectionObserver" in window){
      const observer=new IntersectionObserver(entries=>{
        if(entries.some(entry=>entry.isIntersecting)){
          observer.disconnect();
          requestAnimationFrame(play);
        }
      },{threshold:.18,rootMargin:"0px 0px -8% 0px"});
      observer.observe(section);
      return;
    }

    setTimeout(play,350);
  }

  function buildStory(){
    const current=document.querySelector("#story");
    if(!current||current.classList.contains("story-editorial"))return;
    const section=document.createElement("section");
    section.id="story";
    section.className="story-editorial";
    section.setAttribute("aria-labelledby","storyEditorialTitle");
    section.innerHTML=`<div class="story-editorial__layout"><div class="story-editorial__copy"><div class="story-editorial__symbol reveal story-reveal" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 5c2 8 7 13 15 15-8 2-13 7-15 15-2-8-7-13-15-15 8-2 13-7 15-15Z"/><path d="M8 41h32"/></svg></div><h2 id="storyEditorialTitle" class="story-editorial__title"><span class="reveal story-reveal">Where fire</span><span class="reveal story-reveal">becomes <em>flavour.</em></span></h2><div class="story-editorial__description reveal story-reveal"><p>Slow-roasted mandi, fragrant spices and generous Arabian hospitality in every serving.</p></div></div><div class="story-editorial__gallery" aria-label="KESAR mandi and Arabian spices"><figure class="story-editorial__media story-editorial__media--main reveal story-reveal"><img src="/assets/images/storypage-mandi2.png" width="1122" height="1402" loading="lazy" decoding="async" alt="KESAR slow-roasted mandi served over fragrant rice"></figure><figure class="story-editorial__media story-editorial__media--saffron reveal story-reveal"><img src="/assets/images/storypage-spices2.png" width="1122" height="1402" loading="lazy" decoding="async" alt="Saffron and Arabian spices used in KESAR dishes"></figure></div></div>`;
    current.replaceWith(section);
    document.querySelector("#story-craft")?.remove();
    setupStoryMotion(section);
  }

  function loadHeroVideo(){
    if(reducedMotion||smallScreen||saveData)return;
    const media=$("#heroMedia");
    const poster=media?.querySelector(".hero-fallback, img");
    if(!media||!poster||media.querySelector(".hero-video"))return;
    poster.classList.add("hero-fallback");
    const video=document.createElement("video");
    video.className="hero-video";
    video.muted=true;
    video.loop=true;
    video.autoplay=true;
    video.playsInline=true;
    video.preload="metadata";
    video.poster=poster.currentSrc||poster.src;
    video.src="/assets/videos/heropage-mandi.mp4";
    video.setAttribute("aria-hidden","true");
    video.addEventListener("canplay",()=>video.classList.add("is-ready"),{once:true});
    video.addEventListener("error",()=>video.remove(),{once:true});
    poster.after(video);
    if(!media.querySelector(".hero-glow")){
      const glow=document.createElement("div");
      glow.className="hero-glow";
      video.after(glow);
    }
    video.play().catch(()=>{});
  }

  const dishes=[
    ["Chicken Mandi","Mandi · Signature","Fragrant mandi rice served with tender, slow-roasted chicken.","Best enjoyed with house sauces and fresh salad.","/assets/images/menupage-chicken%20mandi.png"],
    ["Al Faham Chicken","Charcoal · Grill","Charcoal-grilled chicken marinated with aromatic Arabian-inspired spices.","Pair with mandi rice and cooling raita.","/assets/images/menupage-al%20faham.png"],
    ["Biryani","Rice · Classic","Aromatic long-grain basmati layered with spice and tender meat.","Complete the plate with raita and salad.","/assets/images/menupage-biryani.png"],
    ["Chicken Kebab","Grill · Sharing","Juicy chicken kebabs with warm spice and charred edges.","Serve with garlic dip and fresh salad.","/assets/images/menupage-chicken%20kebab.png"],
    ["Grill Chicken","Grill · House Favourite","Fire-grilled chicken finished with citrus and fragrant spice.","Best paired with mandi rice and house sauce.","/assets/images/menupage-grill%20chicken.png"],
    ["Kathi Rolls","Rolls · Street Classic","Soft flatbread wrapped around smoky chicken, vegetables and house sauce.","Perfect with a chilled drink.","/assets/images/menupage-kathi%20rolles.png"],
    ["Shawarma","Wrap · Classic","Tender spiced chicken, fresh vegetables and creamy sauce in a warm wrap.","Enjoy with fries and garlic sauce.","/assets/images/menupage-shawarma.png"],
    ["Tandoori Chicken","Tandoor · Classic","Deeply marinated chicken roasted in the tandoor until smoky and tender.","Best with mint chutney and onion salad.","/assets/images/menupage-tandoori%20chicken.png"]
  ];

  function openDish(card,trigger){
    const dialog=$("#dishDialog");
    if(!dialog)return;
    $("#dialogImage").src=$("img",card).src;
    $("#dialogImage").alt=$("img",card).alt;
    $("#dialogCategory").textContent=card.dataset.category;
    $("#dialogTitle").textContent=card.dataset.title;
    $("#dialogCopy").textContent=card.dataset.copy;
    $("#dialogPairing").textContent=card.dataset.pairing;
    document.body.classList.add("dialog-open");
    dialog.showModal();
    $(".dialog-close",dialog)?.focus();
    dialog.addEventListener("close",()=>trigger.focus(),{once:true});
  }

  function setupDishRail(){
    const track=$("#dishTrack");
    if(!track)return;
    track.innerHTML=dishes.map(d=>`<article class="dish-card reveal visible" data-title="${d[0]}" data-category="${d[1]}" data-copy="${d[2]}" data-pairing="${d[3]}"><img src="${d[4]}" alt="${d[0]}" loading="lazy" decoding="async"><div><span>${d[1]}</span><h3>${d[0]}</h3><p>${d[2]}</p><button type="button" data-optimized-detail>View details ↗</button></div></article>`).join("");
    track.querySelectorAll("[data-optimized-detail]").forEach(button=>button.addEventListener("click",()=>openDish(button.closest(".dish-card"),button)));
    const step=()=>{
      const card=$(".dish-card",track);
      const gap=parseFloat(getComputedStyle(track).gap||18);
      return card?card.getBoundingClientRect().width+gap:track.clientWidth*.82;
    };
    const max=()=>track.scrollWidth-track.clientWidth;
    const controls=()=>{
      const prev=$("#dishPrev"),next=$("#dishNext");
      if(prev)prev.disabled=track.scrollLeft<=3;
      if(next)next.disabled=track.scrollLeft>=max()-3;
    };
    const bind=(selector,direction)=>{
      const old=$(selector);
      if(!old)return;
      const button=old.cloneNode(true);
      old.replaceWith(button);
      button.addEventListener("click",()=>track.scrollBy({left:direction*step(),behavior:reducedMotion?"auto":"smooth"}));
    };
    bind("#dishPrev",-1);
    bind("#dishNext",1);
    track.addEventListener("scroll",controls,{passive:true});
    track.addEventListener("wheel",event=>{
      if(Math.abs(event.deltaY)<=Math.abs(event.deltaX))return;
      event.preventDefault();
      track.scrollLeft+=event.deltaY;
    },{passive:false});
    let dragging=false,startX=0,startScroll=0;
    track.addEventListener("pointerdown",event=>{
      if(event.target.closest("button,a"))return;
      dragging=true;
      startX=event.clientX;
      startScroll=track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture(event.pointerId);
    });
    track.addEventListener("pointermove",event=>{
      if(dragging)track.scrollLeft=startScroll-(event.clientX-startX);
    });
    ["pointerup","pointercancel"].forEach(name=>track.addEventListener(name,()=>{
      dragging=false;
      track.classList.remove("is-dragging");
      controls();
    }));
    addEventListener("resize",controls,{passive:true});
    requestAnimationFrame(controls);
  }

  function finish(){
    setupDishRail();
    const startVideo=()=>loadHeroVideo();
    if("requestIdleCallback"in window)requestIdleCallback(startVideo,{timeout:1200});
    else setTimeout(startVideo,250);
  }

  loadPremiumEnhancements();
  loadStoryStyles();
  buildStory();
  releaseLoader();
  const base=document.createElement("script");
  base.src=BASE_SCRIPT;
  base.async=false;
  base.onload=finish;
  base.onerror=finish;
  document.head.append(base);
})();