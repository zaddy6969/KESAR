(() => {
  "use strict";

  const mobileQuery=matchMedia("(max-width: 1000px)");
  const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

  const combos={
    "2":{name:"Mandi Combo",party:"2 People",label:"2 People",price:"₹499",badge:"Perfect for Two",image:"/assets/images/mandicombo-2ppl.png",alt:"Mandi feast for two",guests:"2 guests",items:["Half Al Faham Chicken","Unlimited mandi rice on selected dine-in combinations","2 Boiled Eggs","2 Soft Drinks"]},
    "5":{name:"Mandi Combo",party:"4 to 5 People",label:"4–5 People",price:"₹1,199",badge:"Most Popular",image:"/assets/images/mandicombo-5-6ppl.png",alt:"Mandi feast for four to five people",guests:"5 guests",items:["Half Al Faham Chicken","Half Tandoori Chicken","8 Pc Chicken Kabab","Unlimited mandi rice on selected dine-in combinations","5 Soft Drinks"]},
    "6":{name:"Family Mandi Feast",party:"6 People",label:"6 People",price:"₹1,499",badge:"Family Favourite",image:"/assets/images/familymandifest-6ppl.png",alt:"Family mandi feast",guests:"6 guests",items:["Full Al Faham Chicken","12 Pc Chicken Kabab","Unlimited mandi rice on selected dine-in combinations","6 Soft Drinks"]},
    "8":{name:"Mandi Combo",party:"8 People",label:"8 People",price:"₹1,999",badge:"Made for Gatherings",image:"/assets/images/mandicombo-8ppl.png",alt:"Mandi feast for eight people",guests:"7+ guests",items:["Half Tandoori Chicken","Half Al Faham Chicken","8 Pc Chicken Kabab","Unlimited mandi rice on selected dine-in combinations","8 Soft Drinks"]},
    "10":{name:"Royal Mandi Platter",party:"10 People",label:"10 People",price:"₹2,499",badge:"The Complete Feast",image:"/assets/images/royalmandiplatter-10ppl.png",alt:"Royal platter for ten people",guests:"7+ guests",items:["Full Al Faham Chicken","Full Tandoori Chicken","16 Pc Chicken Kabab","Unlimited mandi rice on selected dine-in combinations","10 Soft Drinks"]}
  };

  const RESERVE_SELECTOR='[data-reserve-combo],[data-row-reserve],#mobileReserveButton,.kesar-mobile-actions__reserve';
  let selectedKey="5";
  let initialized=false;
  let frame=0;

  function setText(selector,value){
    const element=$(selector);
    if(element&&element.textContent!==value)element.textContent=value;
  }

  function setImage(selector,src,alt){
    const image=$(selector);
    if(!image)return;
    if(image.getAttribute("src")!==src)image.src=src;
    if(image.alt!==alt)image.alt=alt;
  }

  function ensureStyles(){
    if(document.querySelector('link[data-kesar-mobile-interactions]'))return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="/mobile-interactions.css?v=mobile-interactions-1";
    link.media="(max-width: 1000px)";
    link.dataset.kesarMobileInteractions="true";
    document.head.append(link);
  }

  function ensureSummaryState(){
    if($("#summaryName"))return;
    const layout=$("#menu-combos .combo-layout");
    if(!layout)return;
    const summary=document.createElement("aside");
    summary.className="combo-summary kesar-mobile-summary-state";
    summary.hidden=true;
    summary.setAttribute("aria-hidden","true");
    summary.innerHTML=`<img id="summaryImage" src="/assets/images/mandicombo-5-6ppl.png" alt="Selected mandi combination"><div><span id="summaryBadge">Most Popular</span><h3 id="summaryName">Mandi Combo</h3><p id="summaryParty">4 to 5 People</p><strong id="summaryPrice">₹1,199</strong></div>`;
    layout.prepend(summary);
  }

  function buildAccordionIfNeeded(){
    const accordion=$("#comboAccordion");
    if(!accordion||accordion.querySelector(".combo-row"))return;
    accordion.innerHTML=Object.entries(combos).map(([key,combo],index)=>`
      <article class="combo-row ${key===selectedKey?"open":""}" data-combo="${key}">
        <button type="button" aria-expanded="${key===selectedKey}">
          <span>${String(index+1).padStart(2,"0")}</span>
          <span><small>${combo.badge}</small><strong>${combo.name}</strong><small>${combo.party}</small></span>
          <span class="row-price">${combo.price}</span><span class="plus"></span>
        </button>
        <div class="combo-panel"><div><div class="combo-panel-inner">
          <ul>${combo.items.map(item=>`<li>${item}</li>`).join("")}</ul>
          <button class="primary-button" type="button" data-row-reserve="${key}">Reserve this feast →</button>
        </div></div></div>
      </article>`).join("");
  }

  function keyFromDom(){
    const stored=document.documentElement.dataset.kesarSelectedCombo;
    if(stored&&combos[stored])return stored;
    const active=$("[data-party][aria-selected=\"true\"]")?.dataset.party;
    return active&&combos[active]?active:"5";
  }

  function keyFromTrigger(trigger){
    const rowKey=trigger?.dataset?.rowReserve||trigger?.closest?.(".combo-row")?.dataset.combo;
    if(rowKey&&combos[rowKey])return rowKey;
    const barKey=$("#mobileReserve")?.dataset.combo;
    if(barKey&&combos[barKey])return barKey;
    return keyFromDom();
  }

  function selectCombo(key,{announce=true,focusTab=false}={}){
    if(!mobileQuery.matches||!combos[key])return;
    const combo=combos[key];
    selectedKey=key;
    document.documentElement.dataset.kesarSelectedCombo=key;

    $$('[data-party]').forEach(tab=>{
      const active=tab.dataset.party===key;
      tab.setAttribute("aria-selected",String(active));
      tab.tabIndex=active?0:-1;
      tab.classList.toggle("is-active",active);
      if(active&&focusTab)tab.focus({preventScroll:true});
    });

    setText("#featuredBadge",combo.badge);
    setText("#featuredName",combo.name);
    setText("#featuredParty",combo.party);
    setText("#featuredPrice",combo.price);
    setImage("#featuredImage",combo.image,combo.alt);

    const items=$("#featuredItems");
    if(items){
      const markup=combo.items.map(item=>`<li>${item}</li>`).join("");
      if(items.innerHTML!==markup)items.innerHTML=markup;
    }

    ensureSummaryState();
    setText("#summaryBadge",combo.badge);
    setText("#summaryName",combo.name);
    setText("#summaryParty",combo.party);
    setText("#summaryPrice",combo.price);
    setImage("#summaryImage",combo.image,combo.alt);

    setText("#mobileComboName",`${combo.name} · ${combo.label}`);
    setText("#mobileComboPrice",combo.price);
    const mobileBar=$("#mobileReserve");
    if(mobileBar)mobileBar.dataset.combo=key;

    $$(".combo-row").forEach(row=>{
      const active=row.dataset.combo===key;
      row.classList.toggle("open",active);
      const button=$(":scope > button",row);
      button?.setAttribute("aria-expanded",String(active));
    });

    if(announce){
      $("#featuredCombo")?.setAttribute("aria-label",`${combo.name}, ${combo.party}, ${combo.price}`);
      const live=$("#featuredCombo");
      if(live)live.dataset.selectedCombo=key;
    }

    updateStickyBar();
  }

  function prefillReservation(key=selectedKey){
    if(!combos[key])key=keyFromDom();
    selectCombo(key,{announce:false});
    const combo=combos[key];
    const guests=$("#guests");
    const notes=$("#message");

    if(guests&&combo.guests&&guests.value!==combo.guests){
      guests.value=combo.guests;
      guests.dispatchEvent(new Event("change",{bubbles:true}));
    }

    if(notes){
      const retained=notes.value.split("\n").filter(line=>!line.trim().startsWith("Interested in the "));
      const note=`Interested in the ${combo.name} for ${combo.party} — ${combo.price}.`;
      const next=[...retained.filter(Boolean),note].join("\n");
      if(notes.value!==next){
        notes.value=next;
        notes.dispatchEvent(new Event("input",{bubbles:true}));
      }
    }
  }

  function isStickyRange(){
    const start=$("#menu");
    const stop=$("#signature-dishes");
    if(!start||!stop)return false;
    const startRect=start.getBoundingClientRect();
    const stopRect=stop.getBoundingClientRect();
    return startRect.top<=innerHeight*.64&&stopRect.top>innerHeight*.28;
  }

  function updateStickyBar(){
    const bar=$("#mobileReserve");
    if(!bar)return;
    const blocked=document.body.classList.contains("menu-open")||
      document.body.classList.contains("dialog-open")||
      document.body.classList.contains("reservation-modal-open")||
      $("#reservationModal")?.classList.contains("is-open");
    const visible=mobileQuery.matches&&isStickyRange()&&!blocked;
    bar.hidden=!visible;
    document.body.classList.toggle("combo-reserve-visible",visible);
  }

  function scheduleStickyUpdate(){
    if(frame)return;
    frame=requestAnimationFrame(()=>{
      frame=0;
      updateStickyBar();
    });
  }

  function handlePartyClick(event){
    if(!mobileQuery.matches)return;
    const target=event.target instanceof Element?event.target:null;
    const tab=target?.closest("[data-party]");
    if(tab){
      const key=tab.dataset.party;
      if(!combos[key])return;
      event.preventDefault();
      event.stopPropagation();
      selectCombo(key,{focusTab:true});
      return;
    }

    const rowButton=target?.closest(".combo-row > button");
    if(rowButton){
      const row=rowButton.closest(".combo-row");
      const key=row?.dataset.combo;
      if(!combos[key])return;
      event.preventDefault();
      event.stopPropagation();
      selectCombo(key);
    }
  }

  function prepareReserveTrigger(event){
    if(!mobileQuery.matches)return;
    const target=event.target instanceof Element?event.target:null;
    const trigger=target?.closest(RESERVE_SELECTOR);
    if(!trigger)return;
    prefillReservation(keyFromTrigger(trigger));
  }

  function handleReserveClickFallback(event){
    if(!mobileQuery.matches)return;
    const target=event.target instanceof Element?event.target:null;
    const trigger=target?.closest(RESERVE_SELECTOR);
    if(!trigger||trigger.dataset.kesarModalRetry==="true")return;
    prefillReservation(keyFromTrigger(trigger));

    if($("#reservationModal")){
      setTimeout(scheduleStickyUpdate,0);
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    trigger.dataset.kesarModalRetry="true";
    let attempts=0;
    const retry=()=>{
      attempts+=1;
      if($("#reservationModal")){
        trigger.click();
        delete trigger.dataset.kesarModalRetry;
        return;
      }
      if(attempts<12){setTimeout(retry,80);return;}
      delete trigger.dataset.kesarModalRetry;
      $("#reservation")?.scrollIntoView({behavior:reducedMotion?"auto":"smooth",block:"start"});
    };
    setTimeout(retry,80);
  }

  function handlePartyKeys(event){
    if(!mobileQuery.matches)return;
    const target=event.target instanceof Element?event.target:null;
    const tab=target?.closest("[data-party]");
    if(tab){
      const tabs=$$("[data-party]");
      const index=tabs.indexOf(tab);
      let next=index;
      if(event.key==="ArrowRight"||event.key==="ArrowDown")next=(index+1)%tabs.length;
      else if(event.key==="ArrowLeft"||event.key==="ArrowUp")next=(index-1+tabs.length)%tabs.length;
      else if(event.key==="Home")next=0;
      else if(event.key==="End")next=tabs.length-1;
      else return;
      event.preventDefault();
      event.stopPropagation();
      selectCombo(tabs[next].dataset.party,{focusTab:true});
      return;
    }

    if((event.key==="Enter"||event.key===" ")&&target?.closest(RESERVE_SELECTOR)){
      prepareReserveTrigger(event);
    }
  }

  function syncDynamicDom(){
    if(!mobileQuery.matches)return;
    ensureSummaryState();
    buildAccordionIfNeeded();
    selectCombo(keyFromDom(),{announce:false});
    scheduleStickyUpdate();
  }

  function initialize(){
    ensureStyles();
    if(initialized)return;
    initialized=true;

    selectedKey=keyFromDom();
    ensureSummaryState();
    buildAccordionIfNeeded();
    selectCombo(selectedKey,{announce:false});

    document.addEventListener("click",handlePartyClick,true);
    document.addEventListener("pointerdown",prepareReserveTrigger,true);
    document.addEventListener("touchstart",prepareReserveTrigger,{capture:true,passive:true});
    document.addEventListener("keydown",handlePartyKeys,true);
    document.addEventListener("click",handleReserveClickFallback,true);

    addEventListener("scroll",scheduleStickyUpdate,{passive:true});
    addEventListener("resize",scheduleStickyUpdate,{passive:true});
    addEventListener("orientationchange",()=>setTimeout(scheduleStickyUpdate,120),{passive:true});

    const observer=new MutationObserver(()=>{
      clearTimeout(observer.timer);
      observer.timer=setTimeout(syncDynamicDom,30);
    });
    observer.observe(document.body,{childList:true,subtree:true});

    mobileQuery.addEventListener?.("change",()=>{
      if(mobileQuery.matches)syncDynamicDom();
      else{
        const bar=$("#mobileReserve");
        if(bar)bar.hidden=true;
        document.body.classList.remove("combo-reserve-visible");
      }
    });

    scheduleStickyUpdate();
  }

  function start(attempt=0){
    ensureStyles();
    const ready=$("#menu")&&$("#featuredCombo")&&$("#mobileReserve")&&$("#reservationForm");
    if(!ready&&attempt<160){setTimeout(()=>start(attempt+1),50);return;}
    initialize();
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>start(),{once:true});
  else start();
})();