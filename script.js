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
        reservationModalStyle.href="/reservation-modal.css?v=reservation-restored-1";
        reservationModalStyle.dataset.kesarReservationModal="true";
        document.head.append(reservationModalStyle);
      }
      if(!document.querySelector('script[data-kesar-reservation-modal]')){
        const reservationModal=document.createElement("script");
        reservationModal.src="/reservation-modal.js?v=reservation-restored-1";
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

  const dishes=[];
  const vegetarianDishes=[];

  function continueBootstrap(){
    loadPremiumEnhancements();
    loadStoryStyles();
    buildStory();
    loadHeroVideo();
    releaseLoader();
  }

  const existing=document.querySelector('script[data-kesar-base]');
  if(existing){
    if(existing.dataset.loaded==="true")continueBootstrap();
    else existing.addEventListener("load",continueBootstrap,{once:true});
  }else{
    const script=document.createElement("script");
    script.src=BASE_SCRIPT;
    script.async=false;
    script.dataset.kesarBase="true";
    script.addEventListener("load",()=>{
      script.dataset.loaded="true";
      continueBootstrap();
    },{once:true});
    script.addEventListener("error",releaseLoader,{once:true});
    document.body.append(script);
  }
})();