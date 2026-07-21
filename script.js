(() => {
  "use strict";

  const $ = (q, r=document) => r.querySelector(q);
  const $$ = (q, r=document) => [...r.querySelectorAll(q)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hours = {
    sunday:[["13:00","23:00"]],
    monday:[["13:00","23:00"]],
    tuesday:[["13:00","23:00"]],
    wednesday:[["13:00","23:00"]],
    thursday:[["13:00","23:00"]],
    friday:[["17:00","23:00"]],
    saturday:[["13:00","23:00"]]
  };

  const combos = {
    "2":{name:"Mandi Combo",party:"2 People",label:"2 People",price:"₹499",badge:"Perfect for Two",image:"/assets/images/mandicombo-2ppl.png",alt:"Mandi feast for two",guests:"2 guests",items:["Half Al Faham Chicken","Unlimited mandi rice on selected dine-in combinations","2 Boiled Eggs","2 Soft Drinks"]},
    "5":{name:"Mandi Combo",party:"4 to 5 People",label:"4–5 People",price:"₹1,199",badge:"Most Popular",image:"/assets/images/mandicombo-5-6ppl.png",alt:"Mandi feast for four to five people",guests:"5 guests",items:["Half Al Faham Chicken","Half Tandoori Chicken","8 Pc Chicken Kabab","Unlimited mandi rice on selected dine-in combinations","5 Soft Drinks"]},
    "6":{name:"Family Mandi Feast",party:"6 People",label:"6 People",price:"₹1,499",badge:"Family Favourite",image:"/assets/images/familymandifest-6ppl.png",alt:"Family mandi feast",guests:"6 guests",items:["Full Al Faham Chicken","12 Pc Chicken Kabab","Unlimited mandi rice on selected dine-in combinations","6 Soft Drinks"]},
    "8":{name:"Mandi Combo",party:"8 People",label:"8 People",price:"₹1,999",badge:"Made for Gatherings",image:"/assets/images/mandicombo-8ppl.png",alt:"Mandi feast for eight people",guests:"7+ guests",items:["Half Tandoori Chicken","Half Al Faham Chicken","8 Pc Chicken Kabab","Unlimited mandi rice on selected dine-in combinations","8 Soft Drinks"]},
    "10":{name:"Royal Mandi Platter",party:"10 People",label:"10 People",price:"₹2,499",badge:"The Complete Feast",image:"/assets/images/royalmandiplatter-10ppl.png",alt:"Royal platter for ten people",guests:"7+ guests",items:["Full Al Faham Chicken","Full Tandoori Chicken","16 Pc Chicken Kabab","Unlimited mandi rice on selected dine-in combinations","10 Soft Drinks"]}
  };

  let selected = "5";
  let lastDialogTrigger = null;

  const minutes = value => {
    const [h,m] = value.split(":").map(Number);
    return h*60+m;
  };
  const clock = value => {
    const [h,m] = value.split(":").map(Number);
    return `${h%12||12}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`;
  };
  const parts = date => Object.fromEntries(new Intl.DateTimeFormat("en-GB",{
    timeZone:"Asia/Kolkata",weekday:"long",year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",hourCycle:"h23"
  }).formatToParts(date).map(p=>[p.type,p.value]));

  function dateString(date=new Date()){
    const p=parts(date);
    return `${p.year}-${p.month}-${p.day}`;
  }

  function periodsFor(date){
    const day=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kolkata",weekday:"long"}).format(date).toLowerCase();
    return hours[day]||[];
  }

  function hoursLabel(periods){
    return periods.length?periods.map(([a,b])=>`${clock(a)}–${clock(b)}`).join(" · "):"Closed";
  }

  function updateStatus(){
    const now=new Date(), p=parts(now), day=p.weekday.toLowerCase(), current=Number(p.hour)*60+Number(p.minute);
    const periods=hours[day]||[];
    const open=periods.find(([a,b])=>current>=minutes(a)&&current<minutes(b));
    let text;
    if(open){
      text=`Open now · closes at ${clock(open[1])}`;
    }else{
      const later=periods.find(([a])=>current<minutes(a));
      if(later) text=`Closed now · opens today at ${clock(later[0])}`;
      else{
        text="Closed now";
        for(let i=1;i<=7;i++){
          const future=new Date(now.getTime()+i*86400000);
          const fp=periodsFor(future);
          if(fp.length){
            text=`Closed now · opens ${i===1?"tomorrow":new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kolkata",weekday:"long"}).format(future)} at ${clock(fp[0][0])}`;
            break;
          }
        }
      }
    }
    $("#statusText").textContent=text;
    $("#liveTime").textContent=`${Number(p.hour)%12||12}:${p.minute} ${Number(p.hour)>=12?"PM":"AM"} · Bengaluru time`;
    $("#heroStatus").classList.toggle("open",Boolean(open));
    const today=hoursLabel(periods);
    $("#todayHours").textContent=`Today · ${today} · Bengaluru time`;
    $("#compactHours").textContent=`Today · ${today} · Bengaluru time`;
    $("#footerToday").textContent=today;
  }

  function selectCombo(key, announce=true){
    const combo=combos[key];
    if(!combo)return;
    selected=key;
    $$("[data-party]").forEach(tab=>{
      const active=tab.dataset.party===key;
      tab.setAttribute("aria-selected",String(active));
      tab.tabIndex=active?0:-1;
    });
    $("#featuredBadge").textContent=combo.badge;
    $("#featuredName").textContent=combo.name;
    $("#featuredParty").textContent=combo.party;
    $("#featuredPrice").textContent=combo.price;
    $("#featuredImage").src=combo.image;
    $("#featuredImage").alt=combo.alt;
    $("#featuredItems").innerHTML=combo.items.map(i=>`<li>${i}</li>`).join("");
    $("#summaryBadge").textContent=combo.badge;
    $("#summaryName").textContent=combo.name;
    $("#summaryParty").textContent=combo.party;
    $("#summaryPrice").textContent=combo.price;
    $("#summaryImage").src=combo.image;
    $("#summaryImage").alt=combo.alt;
    $("#mobileComboName").textContent=`${combo.name} · ${combo.label}`;
    $("#mobileComboPrice").textContent=combo.price;
    $$(".combo-row").forEach(row=>{
      const active=row.dataset.combo===key;
      row.classList.toggle("open",active);
      $("button",row).setAttribute("aria-expanded",String(active));
    });
    if(announce) $("#featuredCombo").setAttribute("aria-label",`${combo.name}, ${combo.party}, ${combo.price}`);
  }

  function buildAccordion(){
    $("#comboAccordion").innerHTML=Object.entries(combos).map(([key,c],i)=>`
      <article class="combo-row ${key===selected?"open":""}" data-combo="${key}">
        <button type="button" aria-expanded="${key===selected}">
          <span>${String(i+1).padStart(2,"0")}</span>
          <span><small>${c.badge}</small><strong>${c.name}</strong><small>${c.party}</small></span>
          <span class="row-price">${c.price}</span><span class="plus"></span>
        </button>
        <div class="combo-panel"><div><div class="combo-panel-inner">
          <ul>${c.items.map(item=>`<li>${item}</li>`).join("")}</ul>
          <button class="primary-button" type="button" data-row-reserve="${key}">Reserve this feast →</button>
        </div></div></div>
      </article>`).join("");
  }

  function reserveSelected(key=selected){
    selectCombo(key,false);
    const c=combos[key];
    $("#guests").value=c.guests;
    const note=`Interested in the ${c.name} for ${c.party} — ${c.price}.`;
    if(!$("#message").value.includes(note)) $("#message").value=($("#message").value.trim()?$("#message").value.trim()+"\n":"")+note;
    $("#reservation").scrollIntoView({behavior:reduceMotion?"auto":"smooth"});
    setTimeout(()=>$("#name").focus({preventScroll:true}),reduceMotion?0:600);
  }

  function setDishTab(name,focus=false){
    $$("[data-dish-tab]").forEach(tab=>{
      const active=tab.dataset.dishTab===name;
      tab.setAttribute("aria-selected",String(active));
      tab.tabIndex=active?0:-1;
      if(active&&focus)tab.focus();
    });
    $$("[data-dish-panel]").forEach(panel=>panel.hidden=panel.dataset.dishPanel!==name);
    updateMobileReserve();
  }

  function openDish(card,trigger){
    lastDialogTrigger=trigger;
    $("#dialogImage").src=$("img",card).src;
    $("#dialogImage").alt=$("img",card).alt;
    $("#dialogCategory").textContent=card.dataset.category;
    $("#dialogTitle").textContent=card.dataset.title;
    $("#dialogCopy").textContent=card.dataset.copy;
    $("#dialogPairing").textContent=card.dataset.pairing;
    document.body.classList.add("dialog-open");
    $("#dishDialog").showModal();
    $(".dialog-close").focus();
  }

  function closeDish(restore=true){
    $("#dishDialog").close();
    document.body.classList.remove("dialog-open");
    if(restore)lastDialogTrigger?.focus();
  }

  function validate(field){
    const value=field.value.trim();
    let msg="";
    if(field.required&&!value)msg="This field is required.";
    if(!msg&&field.id==="phone"&&value&&!/^[6-9]\d{9}$/.test(value.replace(/\D/g,"").slice(-10)))msg="Enter a valid 10-digit Indian mobile number.";
    if(!msg&&field.id==="date"&&value<dateString())msg="Choose today or a future date in Bengaluru.";
    field.setAttribute("aria-invalid",String(Boolean(msg)));
    $(".error",field.closest(".field")).textContent=msg;
    return !msg;
  }

  function populateTimes(){
    const value=$("#date").value, select=$("#time");
    select.innerHTML='<option value="">Choose a time</option>';
    if(!value){select.disabled=true;return}
    const [y,m,d]=value.split("-").map(Number);
    const periods=periodsFor(new Date(Date.UTC(y,m-1,d,12)));
    if(!periods.length){select.innerHTML='<option value="">Closed on this day</option>';select.disabled=true;return}
    periods.forEach(([a,b])=>{
      for(let t=minutes(a);t<=minutes(b)-30;t+=30){
        const raw=`${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;
        const option=document.createElement("option");
        option.value=raw;option.textContent=clock(raw);select.append(option);
      }
    });
    select.disabled=false;
  }

  function updateMobileReserve(){
    const bar=$("#mobileReserve"), start=$("#menu"), stop=$("#signature-dishes");
    if(!bar||!start||!stop)return;
    const mobile=matchMedia("(max-width:700px)").matches;
    const sr=start.getBoundingClientRect(), er=stop.getBoundingClientRect();
    const inCombo=sr.top<=innerHeight*.56&&er.top>innerHeight*.42;
    const navOpen=$("#mobileMenu").classList.contains("open");
    bar.hidden=!(mobile&&inCombo&&!navOpen);
  }

  const header=$("#siteHeader");
  addEventListener("scroll",()=>{
    header.classList.toggle("scrolled",scrollY>35);
    const max=document.documentElement.scrollHeight-innerHeight;
    $("#progress").style.width=`${max?scrollY/max*100:0}%`;
    updateMobileReserve();
  },{passive:true});
  addEventListener("resize",updateMobileReserve,{passive:true});

  const menuToggle=$("#menuToggle"), mobileMenu=$("#mobileMenu");
  function setMenu(open){
    mobileMenu.classList.toggle("open",open);
    mobileMenu.setAttribute("aria-hidden",String(!open));
    menuToggle.setAttribute("aria-expanded",String(open));
    menuToggle.textContent=open?"Close":"Menu";
    document.body.classList.toggle("menu-open",open);
    updateMobileReserve();
    if(open)requestAnimationFrame(()=>$("a",mobileMenu)?.focus());
  }
  menuToggle.addEventListener("click",()=>setMenu(!mobileMenu.classList.contains("open")));
  $$("a",mobileMenu).forEach(a=>a.addEventListener("click",()=>setMenu(false)));
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&mobileMenu.classList.contains("open")){setMenu(false);menuToggle.focus()}
  });

  buildAccordion();
  selectCombo(selected,false);

  $$("[data-party]").forEach((tab,index)=>{
    tab.addEventListener("click",()=>selectCombo(tab.dataset.party));
    tab.addEventListener("keydown",e=>{
      let next=index;
      const tabs=$$("[data-party]");
      if(e.key==="ArrowRight")next=(index+1)%tabs.length;
      else if(e.key==="ArrowLeft")next=(index-1+tabs.length)%tabs.length;
      else if(e.key==="Home")next=0;
      else if(e.key==="End")next=tabs.length-1;
      else return;
      e.preventDefault();tabs[next].focus();selectCombo(tabs[next].dataset.party);
    });
  });

  $("#comboAccordion").addEventListener("click",e=>{
    const reserve=e.target.closest("[data-row-reserve]");
    if(reserve){reserveSelected(reserve.dataset.rowReserve);return}
    const row=e.target.closest(".combo-row");
    if(row)selectCombo(row.dataset.combo);
  });
  $("[data-reserve-combo]").addEventListener("click",()=>reserveSelected());
  $("#mobileReserveButton").addEventListener("click",()=>reserveSelected());

  $$("[data-dish-tab]").forEach((tab,index)=>{
    tab.addEventListener("click",()=>setDishTab(tab.dataset.dishTab));
    tab.addEventListener("keydown",e=>{
      const tabs=$$("[data-dish-tab]");
      let next=index;
      if(e.key==="ArrowRight"||e.key==="ArrowDown")next=(index+1)%tabs.length;
      else if(e.key==="ArrowLeft"||e.key==="ArrowUp")next=(index-1+tabs.length)%tabs.length;
      else return;
      e.preventDefault();setDishTab(tabs[next].dataset.dishTab,true);
    });
  });

  $("#dishNext").addEventListener("click",()=>$("#dishTrack").scrollBy({left:$("#dishTrack").clientWidth*.82,behavior:reduceMotion?"auto":"smooth"}));
  $("#dishPrev").addEventListener("click",()=>$("#dishTrack").scrollBy({left:-$("#dishTrack").clientWidth*.82,behavior:reduceMotion?"auto":"smooth"}));
  $$("[data-details]").forEach(button=>button.addEventListener("click",()=>openDish(button.closest(".dish-card"),button)));
  $(".dialog-close").addEventListener("click",()=>closeDish());
  $("#dishDialog").addEventListener("click",e=>{if(e.target===$("#dishDialog"))closeDish()});
  $("#dialogReserve").addEventListener("click",()=>closeDish(false));

  const date=$("#date");
  date.min=dateString();
  const max=new Date(Date.now()+90*86400000);
  date.max=dateString(max);
  date.addEventListener("change",()=>{validate(date);populateTimes()});
  $$("input,select,textarea",$("#reservationForm")).forEach(field=>{
    field.addEventListener("blur",()=>validate(field));
    field.addEventListener("input",()=>{if(field.getAttribute("aria-invalid")==="true")validate(field)});
  });
  $("#reservationForm").addEventListener("submit",e=>{
    e.preventDefault();
    const bad=$$("[required]",e.currentTarget).find(field=>!validate(field));
    bad?.focus();
  });

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}
    });
  },{threshold:.12,rootMargin:"0px 0px -40px"});
  $$(".reveal").forEach(el=>observer.observe(el));

  $("#year").textContent=new Date().getFullYear();
  updateStatus();
  setInterval(updateStatus,30000);
  updateMobileReserve();

  addEventListener("load",()=>{
    setTimeout(()=>document.body.classList.add("loaded"),250);
  });
})();