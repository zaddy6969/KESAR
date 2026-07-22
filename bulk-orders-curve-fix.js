(() => {
  "use strict";

  const STYLE_ID="kesarBulkCurveOutFix";

  function addStyles(){
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
        .bulk-orders-section__media{
          clip-path:polygon(
            24% 0,
            100% 0,
            100% 100%,
            22% 100%,
            20% 96%,
            16% 90%,
            12% 83%,
            8% 75%,
            4% 66%,
            1% 57%,
            0 50%,
            1% 43%,
            4% 34%,
            8% 25%,
            12% 17%,
            16% 10%,
            20% 5%
          )!important;
          filter:drop-shadow(-2px 0 0 rgba(183,135,67,.82));
        }

        .bulk-orders-section__media::before{
          display:none!important;
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
    section.classList.add("bulk-orders-curve-out");
    return true;
  }

  function start(){
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
