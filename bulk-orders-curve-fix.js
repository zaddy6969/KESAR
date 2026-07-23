(() => {
  "use strict";

  const STYLE_ID="kesarBulkSmoothLeftImage";
  const DISH_STYLE_ID="kesarDishHorizontalScrollFixV3";

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
    document.documentElement.dataset.kesarDishScrollFix="v3";
    document.getElementById("kesarDishHorizontalScrollFix")?.remove();

    if(!document.getElementById(DISH_STYLE_ID)){
      const style=document.createElement("style");
      style.id=DISH_STYLE_ID;
      style.textContent=`
        #signature-dishes .dish-track{
          overflow-x:scroll!important;
          overflow-y:hidden!important;
          overscroll-behavior-inline:contain!important;
          scroll-behavior:auto!important;
          scroll-snap-type:x proximity!important;
          cursor:grab!important;
          user-select:none!important;
          -webkit-user-select:none!important;
          touch-action:pan-x pan-y pinch-zoom!important;
          -webkit-overflow-scrolling:touch!important;
          scrollbar-width:thin!important;
          scrollbar-color:rgba(135,69,18,.72) rgba(23,19,15,.10)!important;
          padding-bottom:18px!important;
        }
        #signature-dishes .dish-track::-webkit-scrollbar{
          display:block!important;
          width:auto!important;
          height:9px!important;
        }
        #signature-dishes .dish-track::-webkit-scrollbar-track{
          background:rgba(23,19,15,.10)!important;
          border-radius:999px!important;
        }
        #signature-dishes .dish-track::-webkit-scrollbar-thumb{
          background:rgba(135,69,18,.72)!important;
          border-radius:999px!important;
        }
        #signature-dishes .dish-track.is-dragging{
          cursor:grabbing!important;
          scroll-snap-type:none!important;
        }
        #signature-dishes .dish-card,
        #signature-dishes .dish-card img{
          user-select:none!important;
          -webkit-user-select:none!important;
          -webkit-user-drag:none!important;
        }
        #signature-dishes .dish-card img{
          pointer-events:auto!important;
          cursor:grab!important;
        }
        #signature-dishes .dish-track.is-dragging .dish-card img{
          cursor:grabbing!important;
        }
      `;
      document.head.append(style);
    }

    const normalizeWheelDelta=(event,track)=>{
      let delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
      if(event.deltaMode===1)delta*=28;
      else if(event.deltaMode===2)delta*=track.clientWidth;
      return delta;
    };

    const prepareTrack=track=>{
      if(!(track instanceof HTMLElement))return;
      track.querySelectorAll("img").forEach(image=>{
        image.draggable=false;
        image.addEventListener("dragstart",event=>event.preventDefault());
      });

      if(track.dataset.kesarWheelV3!=="true"){
        track.dataset.kesarWheelV3="true";
        track.addEventListener("wheel",event=>{
          const maximum=Math.max(0,track.scrollWidth-track.clientWidth);
          const delta=normalizeWheelDelta(event,track);
          if(!delta||maximum<=1)return;

          const current=track.scrollLeft;
          const wantsForward=delta>0;
          const canMove=wantsForward?current<maximum-1:current>1;

          event.preventDefault();
          event.stopImmediatePropagation();

          if(canMove){
            const next=Math.max(0,Math.min(maximum,current+(delta*1.65)));
            track.scrollLeft=next;
            return;
          }

          if(Math.abs(event.deltaY)>0){
            window.scrollBy({top:event.deltaY,left:0,behavior:"auto"});
          }
        },{capture:true,passive:false});
      }

      if(track.dataset.kesarDragV3!=="true"){
        track.dataset.kesarDragV3="true";
        let active=false;
        let pointerId=null;
        let startX=0;
        let startScroll=0;
        let moved=false;

        track.addEventListener("pointerdown",event=>{
          if(event.pointerType==="touch"||event.button!==0)return;
          if(event.target instanceof Element&&event.target.closest("button,a,input,select,textarea,label"))return;
          if(track.scrollWidth<=track.clientWidth+1)return;

          active=true;
          pointerId=event.pointerId;
          startX=event.clientX;
          startScroll=track.scrollLeft;
          moved=false;
          track.classList.add("is-dragging");
          track.setPointerCapture?.(pointerId);
          event.preventDefault();
          event.stopImmediatePropagation();
        },{capture:true});

        track.addEventListener("pointermove",event=>{
          if(!active||event.pointerId!==pointerId)return;
          const distance=event.clientX-startX;
          if(Math.abs(distance)>3)moved=true;
          track.scrollLeft=startScroll-distance;
          if(moved){
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        },{capture:true,passive:false});

        const stopDrag=event=>{
          if(!active||event.pointerId!==pointerId)return;
          track.classList.remove("is-dragging");
          try{track.releasePointerCapture?.(pointerId);}catch{}
          active=false;
          pointerId=null;
          requestAnimationFrame(()=>{moved=false;});
        };

        track.addEventListener("pointerup",stopDrag,{capture:true});
        track.addEventListener("pointercancel",stopDrag,{capture:true});
        track.addEventListener("lostpointercapture",()=>{
          track.classList.remove("is-dragging");
          active=false;
          pointerId=null;
          moved=false;
        });

        track.addEventListener("click",event=>{
          if(!moved)return;
          event.preventDefault();
          event.stopImmediatePropagation();
          moved=false;
        },true);
      }
    };

    const prepareTracks=()=>{
      document.querySelectorAll("#signature-dishes .dish-track").forEach(prepareTrack);
    };

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