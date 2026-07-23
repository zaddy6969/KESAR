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

  function setupDishHorizontalScrolling(){
    if(document.documentElement.dataset.kesarDishScrollFix==="true")return;
    document.documentElement.dataset.kesarDishScrollFix="true";

    const style=document.createElement("style");
    style.id="kesarDishHorizontalScrollFix";
    style.textContent=`
      #signature-dishes .dish-track{
        overflow-x:auto!important;
        overflow-y:hidden!important;
        overscroll-behavior-x:contain!important;
        scroll-behavior:auto!important;
        cursor:grab!important;
        user-select:none!important;
        -webkit-user-select:none!important;
        -webkit-overflow-scrolling:touch;
      }
      #signature-dishes .dish-track.is-dragging{
        cursor:grabbing!important;
        scroll-snap-type:none!important;
      }
      #signature-dishes .dish-card img{
        pointer-events:auto!important;
        user-select:none!important;
        -webkit-user-select:none!important;
        -webkit-user-drag:none!important;
      }
    `;
    document.head.append(style);

    const trackFromEvent=event=>{
      const path=typeof event.composedPath==="function"?event.composedPath():[];
      const fromPath=path.find(node=>node instanceof Element&&node.matches?.("#signature-dishes .dish-track"));
      if(fromPath)return fromPath;
      return event.target instanceof Element?event.target.closest("#signature-dishes .dish-track"):null;
    };

    const prepareTracks=()=>{
      document.querySelectorAll("#signature-dishes .dish-track").forEach(track=>{
        track.querySelectorAll("img").forEach(image=>image.draggable=false);
      });
    };

    document.addEventListener("wheel",event=>{
      const track=trackFromEvent(event);
      if(!track)return;

      const maximum=Math.max(0,track.scrollWidth-track.clientWidth);
      if(maximum<=1)return;

      let delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
      if(event.deltaMode===1)delta*=22;
      else if(event.deltaMode===2)delta*=track.clientWidth;
      if(!delta)return;

      const current=track.scrollLeft;
      const next=Math.max(0,Math.min(maximum,current+delta));
      if(Math.abs(next-current)<0.5)return;

      event.preventDefault();
      event.stopPropagation();
      track.scrollLeft=next;
    },{capture:true,passive:false});

    let activeTrack=null;
    let activePointer=null;
    let startX=0;
    let startScroll=0;
    let moved=false;

    document.addEventListener("pointerdown",event=>{
      if(event.pointerType!=="mouse"||event.button!==0)return;
      const track=trackFromEvent(event);
      if(!track||event.target.closest?.("button,a,input,select,textarea,label"))return;
      if(track.scrollWidth<=track.clientWidth+1)return;

      activeTrack=track;
      activePointer=event.pointerId;
      startX=event.clientX;
      startScroll=track.scrollLeft;
      moved=false;
      track.classList.add("is-dragging");
      track.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    },true);

    document.addEventListener("pointermove",event=>{
      if(!activeTrack||event.pointerId!==activePointer)return;
      const distance=event.clientX-startX;
      if(Math.abs(distance)>2)moved=true;
      activeTrack.scrollLeft=startScroll-distance;
      if(moved)event.preventDefault();
    },{capture:true,passive:false});

    const stopDrag=event=>{
      if(!activeTrack||event.pointerId!==activePointer)return;
      activeTrack.classList.remove("is-dragging");
      activeTrack.releasePointerCapture?.(event.pointerId);
      activeTrack=null;
      activePointer=null;
      moved=false;
    };
    document.addEventListener("pointerup",stopDrag,true);
    document.addEventListener("pointercancel",stopDrag,true);

    prepareTracks();
    const observer=new MutationObserver(prepareTracks);
    observer.observe(document.body,{childList:true,subtree:true});
  }

  function start(){
    loadMobileInteractionRepairs();
    addStyles();
    setupDishHorizontalScrolling();
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