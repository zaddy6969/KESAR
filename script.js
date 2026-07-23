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
        link.href="/mobile-premium.css?v=mobile-interactions-1";
        link.media="(max-width: 767px)";
        link.dataset.kesarMobilePremium="true";
        document.head.append(link);
      }
      if(!document.querySelector('script[data-kesar-premium-enhancements]')){
        const enhancement=document.createElement("script");
        enhancement.src="/mobile-premium.js?v=mobile-interactions-1";
        enhancement.async=true;
        enhancement.dataset.kesarPremiumEnhancements="true";
        document.body.append(enhancement);
      }
      if(!document.querySelector('script[data-kesar-hours-update]')){
        const hoursUpdate=document.createElement("script");
        hoursUpdate.src="/hours-update.js?v=mobile-interactions-1";
        hoursUpdate.async=true;
        hoursUpdate.dataset.kesarHoursUpdate="true";
        document.body.append(hoursUpdate);
      }
      if(!document.querySelector('script[data-kesar-bulk-curve-fix]')){
        const bulkCurveFix=document.createElement("script");
        bulkCurveFix.src="/bulk-orders-curve-fix.js?v=mobile-interactions-1";
        bulkCurveFix.async=true;
        bulkCurveFix.dataset.kesarBulkCurveFix="true";
        document.body.append(bulkCurveFix);
      }
      if(!document.querySelector('link[data-kesar-reservation-modal]')){
        const reservationModalStyle=document.createElement("link");
        reservationModalStyle.rel="stylesheet";
        reservationModalStyle.href="/reservation-modal.css?v=reservation-modal-3";
        reservationModalStyle.dataset.kesarReservationModal="true";
        document.head.append(reservationModalStyle);
      }
      if(!document.querySelector('script[data-kesar-reservation-modal]')){
        const reservationModal=document.createElement("script");
        reservationModal.src="/reservation-modal.js?v=reservation-modal-3";
        reservationModal.async=true;
        reservationModal.dataset.kesarReservationModal="true";
        document.body.append(reservationModal);
      }
      if(!document.querySelector('link[data-kesar-mobile-interactions]')){
        const mobileInteractionStyle=document.createElement("link");
        mobileInteractionStyle.rel="stylesheet";
        mobileInteractionStyle.href="/mobile-interactions.css?v=mobile-interactions-1";
        mobileInteractionStyle.media="(max-width: 1000px)";
        mobileInteractionStyle.dataset.kesarMobileInteractions="true";
        document.head.append(mobileInteractionStyle);
      }
      if(!document.querySelector('script[data-kesar-mobile-interactions]')){
        const mobileInteractions=document.createElement("script");
        mobileInteractions.src="/mobile-interactions.js?v=mobile-interactions-1";
        mobileInteractions.async=true;
        mobileInteractions.dataset.kesarMobileInteractions="true";
        document.body.append(mobileInteractions);
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
    {title:"Chicken Mandi",category:"Mandi · Signature",description:"Fragrant mandi rice served with tender, slow-roasted chicken.",pairing:"Best enjoyed with house sauces and fresh salad.",image:"/assets/images/menupage-chicken%20mandi.png",alt:"Chicken Mandi"},
    {title:"Al Faham Chicken",category:"Charcoal · Grill",description:"Charcoal-grilled chicken marinated with aromatic Arabian-inspired spices.",pairing:"Pair with mandi rice and cooling raita.",image:"/assets/images/menupage-al%20faham.png",alt:"Al Faham Chicken"},
    {title:"Biryani",category:"Rice · Classic",description:"Aromatic long-grain basmati layered with spice and tender meat.",pairing:"Complete the plate with raita and salad.",image:"/assets/images/menupage-biryani.png",alt:"Biryani"},
    {title:"Chicken Kebab",category:"Grill · Sharing",description:"Juicy chicken kebabs with warm spice and charred edges.",pairing:"Serve with garlic dip and fresh salad.",image:"/assets/images/menupage-chicken%20kebab.png",alt:"Chicken Kebab"},
    {title:"Grill Chicken",category:"Grill · House Favourite",description:"Fire-grilled chicken finished with citrus and fragrant spice.",pairing:"Best paired with mandi rice and house sauce.",image:"/assets/images/menupage-grill%20chicken.png",alt:"Grill Chicken"},
    {title:"Kathi Rolls",category:"Rolls · Street Classic",description:"Soft flatbread wrapped around smoky chicken, vegetables and house sauce.",pairing:"Perfect with a chilled drink.",image:"/assets/images/menupage-kathi%20rolles.png",alt:"Kathi Rolls"},
    {title:"Shawarma",category:"Wrap · Classic",description:"Tender spiced chicken, fresh vegetables and creamy sauce in a warm wrap.",pairing:"Enjoy with fries and garlic sauce.",image:"/assets/images/menupage-shawarma.png",alt:"Shawarma"},
    {title:"Tandoori Chicken",category:"Tandoor · Classic",description:"Deeply marinated chicken roasted in the tandoor until smoky and tender.",pairing:"Best with mint chutney and onion salad.",image:"/assets/images/menupage-tandoori%20chicken.png",alt:"Tandoori Chicken"}
  ];

  const vegetarianDishes=[
    {title:"Paneer Tikka",category:"Tandoor · Signature",image:"/assets/images/01-Paneer-Tikka.png",width:1024,height:1365,alt:"Paneer tikka grilled with peppers and onions, served with mint chutney",description:"Charcoal-grilled paneer marinated with warm spices, peppers and onions.",pairing:"Best enjoyed with mint chutney, onion salad and fresh lemon."},
    {title:"Hara Bhara Kabab",category:"Vegetarian · Classic",image:"/assets/images/02-Hara-Bhara-Kabab.png",width:1024,height:1365,alt:"Hara bhara kabab served with mint chutney and onion salad",description:"Golden vegetable and spinach kababs with herbs, peas and aromatic spices.",pairing:"Serve with mint chutney, onion salad and a squeeze of lemon."},
    {title:"Veg Seekh Kabab",category:"Tandoor · Grill",image:"/assets/images/03-Veg-Seekh-Kabab.png",width:1024,height:1365,alt:"Vegetarian seekh kababs grilled on skewers and served with mint chutney",description:"Smoky vegetable seekh kababs grilled with fragrant spices and fresh herbs.",pairing:"Pairs well with mint chutney, sliced onions and fresh salad."},
    {title:"Gobi 65",category:"Vegetarian · Spiced",image:"/assets/images/04-Gobi-65.png",width:1024,height:1365,alt:"Crispy Gobi 65 with green chillies and mint chutney",description:"Crispy cauliflower tossed with curry leaves, green chillies and bold spices.",pairing:"Enjoy with mint chutney or a cooling yoghurt dip."},
    {title:"Malai Broccoli",category:"Tandoor · Creamy",image:"/assets/images/05-Malai-Broccoli.png",width:1024,height:1365,alt:"Creamy malai broccoli grilled in the tandoor and served with dip",description:"Tender broccoli florets in a creamy aromatic marinade, finished in the tandoor.",pairing:"Best paired with herb dip, onion salad and fresh lemon."},
    {title:"Mushroom Tikka",category:"Tandoor · Vegetarian",image:"/assets/images/06-Mushroom-Tikka.png",width:1024,height:1365,alt:"Tandoori mushroom tikka served with mint chutney and onions",description:"Juicy mushrooms marinated in warm tandoori spices and grilled over high heat.",pairing:"Serve with mint chutney, onion rings and lemon."},
    {title:"Tandoori Pineapple",category:"Tandoor · Sweet & Smoky",image:"/assets/images/07-Tandoori-Pineapple.png",width:1024,height:1365,alt:"Tandoori pineapple slices grilled with spices and served with chutney",description:"Caramelised pineapple grilled with gentle spice for a sweet and smoky finish.",pairing:"Enjoy with fresh mint chutney or as a light sharing starter."},
    {title:"Stuffed Tandoori Aloo",category:"Tandoor · House Special",image:"/assets/images/08-Stuffed-Tandoori-Aloo.png",width:1024,height:1365,alt:"Stuffed tandoori potatoes grilled with spices and served with mint chutney",description:"Roasted potatoes filled with a seasoned vegetable mixture and finished in the tandoor.",pairing:"Best served with mint chutney, onion salad and lemon."}
  ];

  function buildVegetarianPanel(){
    const nonvegTab=$("[data-dish-tab='nonveg']");
    const vegTab=$("[data-dish-tab='veg']");
    const nonvegPanel=$("#nonvegPanel");
    const vegPanel=$("#vegPanel");
    if(!nonvegTab||!vegTab||!nonvegPanel||!vegPanel)return;

    nonvegTab.id="nonvegTab";
    nonvegTab.setAttribute("aria-controls","nonvegPanel");
    vegTab.id="vegTab";
    vegTab.setAttribute("aria-controls","vegPanel");

    nonvegPanel.setAttribute("role","tabpanel");
    nonvegPanel.setAttribute("aria-labelledby","nonvegTab");
    vegPanel.className="dish-panel";
    vegPanel.setAttribute("role","tabpanel");
    vegPanel.setAttribute("aria-labelledby","vegTab");
    vegPanel.innerHTML=`<div class="dish-controls"><p>Vegetarian favourites</p><div><button id="vegDishPrev" type="button" aria-label="Previous vegetarian dishes">←</button><button id="vegDishNext" type="button" aria-label="Next vegetarian dishes">→</button></div></div><div class="dish-track" id="vegDishTrack" tabindex="0" aria-label="Vegetarian signature dishes"></div>`;
  }

  function dishCardMarkup(dish){
    const dimensions=dish.width&&dish.height?` width="${dish.width}" height="${dish.height}"`:"";
    return `<article class="dish-card reveal visible" data-title="${dish.title}" data-category="${dish.category}" data-copy="${dish.description}" data-pairing="${dish.pairing}"><img src="${dish.image}"${dimensions} loading="lazy" decoding="async" alt="${dish.alt}"><div><span>${dish.category}</span><h3>${dish.title}</h3><p>${dish.description}</p><button type="button" data-optimized-detail>View details ↗</button></div></article>`;
  }

  function renderDishTrack(track,dishData){
    if(!track)return;
    track.innerHTML=dishData.map(dishCardMarkup).join("");
    track.querySelectorAll("img").forEach(image=>{
      image.addEventListener("error",()=>{
        console.warn(`KESAR dish image failed to load: ${image.getAttribute("src")}`);
        image.hidden=true;
      },{once:true});
    });
  }

  function openDish(card,trigger){
    const dialog=$("#dishDialog");
    const image=$("img",card);
    if(!dialog||!image)return;
    const dialogImage=$("#dialogImage");
    if(dialogImage){dialogImage.src=image.currentSrc||image.src;dialogImage.alt=image.alt;}
    if($("#dialogCategory"))$("#dialogCategory").textContent=card.dataset.category||"Signature dish";
    if($("#dialogTitle"))$("#dialogTitle").textContent=card.dataset.title||"KESAR dish";
    if($("#dialogCopy"))$("#dialogCopy").textContent=card.dataset.copy||"";
    if($("#dialogPairing"))$("#dialogPairing").textContent=card.dataset.pairing||"";
    document.body.classList.add("dialog-open");
    if(!dialog.open)dialog.showModal();
    $(".dialog-close",dialog)?.focus();
    dialog.addEventListener("close",()=>trigger?.focus(),{once:true});
  }

  function setupDishRail({track,previousButton,nextButton}){
    if(!track||!previousButton||!nextButton||track.dataset.dishRailReady==="true")return;
    track.dataset.dishRailReady="true";

    const previous=previousButton.cloneNode(true);
    const next=nextButton.cloneNode(true);
    previousButton.replaceWith(previous);
    nextButton.replaceWith(next);

    const step=()=>{
      const card=$(".dish-card",track);
      const gap=parseFloat(getComputedStyle(track).gap||18);
      return card?card.getBoundingClientRect().width+gap:track.clientWidth*.82;
    };
    const max=()=>Math.max(0,track.scrollWidth-track.clientWidth);
    const updateControls=()=>{
      previous.disabled=track.scrollLeft<=3;
      next.disabled=track.scrollLeft>=max()-3;
    };
    const refreshControls=()=>requestAnimationFrame(()=>requestAnimationFrame(updateControls));

    previous.addEventListener("click",()=>track.scrollBy({left:-step(),behavior:reducedMotion?"auto":"smooth"}));
    next.addEventListener("click",()=>track.scrollBy({left:step(),behavior:reducedMotion?"auto":"smooth"}));
    track.addEventListener("scroll",updateControls,{passive:true});
    track.addEventListener("wheel",event=>{
      if(Math.abs(event.deltaY)<=Math.abs(event.deltaX)||max()<=0)return;
      event.preventDefault();
      track.scrollLeft+=event.deltaY;
    },{passive:false});
    track.addEventListener("keydown",event=>{
      if(event.target.closest("button, a, input, select, textarea, label"))return;
      if(event.key==="ArrowRight")track.scrollBy({left:step(),behavior:reducedMotion?"auto":"smooth"});
      else if(event.key==="ArrowLeft")track.scrollBy({left:-step(),behavior:reducedMotion?"auto":"smooth"});
      else if(event.key==="Home")track.scrollTo({left:0,behavior:reducedMotion?"auto":"smooth"});
      else if(event.key==="End")track.scrollTo({left:max(),behavior:reducedMotion?"auto":"smooth"});
      else return;
      event.preventDefault();
    });
    track.addEventListener("click",event=>{
      const trigger=event.target.closest("[data-optimized-detail]");
      if(trigger)openDish(trigger.closest(".dish-card"),trigger);
    });

    let dragging=false,startX=0,startScroll=0;
    track.addEventListener("pointerdown",event=>{
      if(event.target.closest("button, a, input, select, textarea, label"))return;
      dragging=true;
      startX=event.clientX;
      startScroll=track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture?.(event.pointerId);
    });
    track.addEventListener("pointermove",event=>{
      if(dragging)track.scrollLeft=startScroll-(event.clientX-startX);
    });
    ["pointerup","pointercancel","lostpointercapture"].forEach(name=>track.addEventListener(name,()=>{
      dragging=false;
      track.classList.remove("is-dragging");
      updateControls();
    }));

    const panel=track.closest("[data-dish-panel]");
    if(panel&&"MutationObserver" in window){
      new MutationObserver(refreshControls).observe(panel,{attributes:true,attributeFilter:["hidden"]});
    }
    if("ResizeObserver" in window)new ResizeObserver(refreshControls).observe(track);
    else addEventListener("resize",refreshControls,{passive:true});
    refreshControls();
  }

  function setupDishRails(){
    const nonvegTrack=$("#dishTrack");
    const vegTrack=$("#vegDishTrack");
    renderDishTrack(nonvegTrack,dishes);
    renderDishTrack(vegTrack,vegetarianDishes);
    setupDishRail({track:nonvegTrack,previousButton:$("#dishPrev"),nextButton:$("#dishNext")});
    setupDishRail({track:vegTrack,previousButton:$("#vegDishPrev"),nextButton:$("#vegDishNext")});
  }

  function finish(){
    setupDishRails();
    const startVideo=()=>loadHeroVideo();
    if("requestIdleCallback"in window)requestIdleCallback(startVideo,{timeout:1200});
    else setTimeout(startVideo,250);
  }

  buildVegetarianPanel();
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