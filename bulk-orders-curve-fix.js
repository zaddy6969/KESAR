(() => {
  "use strict";

  const STYLE_ID="kesarBulkSmoothLeftImage";

  function loadMobileInteractionRepairs(){
    if(!document.querySelector('link[data-kesar-mobile-interactions]')){
      const link=document.createElement("link");
      link.rel="stylesheet";
      link.href="/mobile-interactions.css?v=mobile-interactions-1";
      link.media="(max-width: 1000px)";
      link.dataset.kesarMobileInteractions="true";
      document.head.append(link);
    }

    if(!document.querySelector('script[data-kesar-mobile-interactions]')){
      const script=document.createElement("script");
      script.src="/mobile-interactions.js?v=mobile-interactions-1";
      script.async=true;
      script.dataset.kesarMobileInteractions="true";
      document.body.append(script);
    }
  }

  function addStyles(){
    document.getElementById("kesarBulkCurveOutFix")?.remove();
    if(document.getElementById(STYLE_ID))return;

    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
      .bulk-orders-section__contacts,
      .bulk-orders-section__delivery{
        display:none!important;
      }

      .bulk-orders-section__actions{
        margin-top:24px!important;
      }

      @media (min-width:901px){
        .bulk-orders-section::before{
          inset:0 0 0 48.8%!important;
        }

        .bulk-orders-section::after{
          left:48.8%!important;
          right:0!important;
        }

        .bulk-orders-section__layout{
          grid-template-columns:48.8% 51.2%!important;
        }

        .bulk-orders-section__media{
          grid-column:1!important;
          grid-row:1!important;
          clip-path:none!important;
          filter:none!important;
          overflow:hidden!important;
        }

        .bulk-orders-section__content{
          grid-column:2!important;
          grid-row:1!important;
        }

        .bulk-orders-section__media::before{
          display:block!important;
          left:auto!important;
          right:-225px!important;
          top:-9%!important;
          width:430px!important;
          height:118%!important;
          border-radius:50%!important;
          background:var(--paper,#fbf5e9)!important;
          box-shadow:
            -23px 0 0 -20px var(--gold,#b78743),
            -38px 0 70px rgba(40,25,13,.10)!important;
          transform:translateZ(0);
          backface-visibility:hidden;
        }
      }

      @media (min-width:901px) and (max-width:1180px){
        .bulk-orders-section__media::before{
          right:-185px!important;
          width:355px!important;
        }
      }
    `;
    document.head.append(style);
  }

  function cleanSection(){
    const section=document.querySelector("#bulk-orders");
    if(!section)return false;

    section.querySelectorAll(
      ".bulk-orders-section__contacts, .bulk-orders-section__delivery"
    ).forEach(element=>element.remove());

    section.classList.remove("bulk-orders-curve-out");
    section.classList.add("bulk-orders-image-left","bulk-orders-smooth-curve");
    return true;
  }

  function start(){
    loadMobileInteractionRepairs();
    addStyles();
    if(cleanSection())return;

    const observer=new MutationObserver(()=>{
      if(cleanSection())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),10000);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",start,{once:true});
  }else{
    start();
  }
})();