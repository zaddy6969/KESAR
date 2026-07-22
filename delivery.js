(() => {
  "use strict";

  const platforms={
    swiggy:"https://www.swiggy.com/city/bangalore/hotel-kesar-fine-dine-basaveshwaranagar-rest1288354",
    zomato:"https://www.zomato.com/bangalore/hotel-kesar-family-dine-veg-and-non-veg-peenya-bangalore"
  };
  const hotel={
    phone:"8951919010",
    whatsapp:"918951919010",
    email:"hotelkesar41@gmail.com",
    hours:"10:00 AM–11:00 PM"
  };

  if(!document.querySelector('link[data-kesar-mobile]')){
    const mobile=document.createElement("link");
    mobile.rel="stylesheet";
    mobile.href="/mobile.css";
    mobile.media="(max-width: 767px)";
    mobile.dataset.kesarMobile="true";
    document.head.append(mobile);
  }

  if(!document.querySelector('link[data-kesar-compact]')){
    const compact=document.createElement("link");
    compact.rel="stylesheet";
    compact.href="/compact.css";
    compact.dataset.kesarCompact="true";
    document.head.append(compact);
  }

  document.querySelectorAll("[data-delivery-platform]").forEach(link=>{
    const platform=link.dataset.deliveryPlatform;
    const url=platforms[platform];
    if(!url){
      link.hidden=true;
      link.removeAttribute("href");
      return;
    }
    link.href=url;
    link.addEventListener("click",()=>window.dataLayer?.push({event:"delivery_platform_click",platform}));
  });

  const $=(selector,root=document)=>root.querySelector(selector);

  function setFieldError(field,message){
    if(!field)return;
    field.setAttribute("aria-invalid",String(Boolean(message)));
    const error=field.closest(".field")?.querySelector(".error");
    if(error)error.textContent=message;
  }

  function validateReservation(form){
    const checks=[
      [$("#name",form),"Please enter your name."],
      [$("#phone",form),"Please enter your phone number."],
      [$("#date",form),"Please choose a reservation date."],
      [$("#time",form),"Please choose a reservation time."],
      [$("#guests",form),"Please choose the number of guests."]
    ];
    let firstInvalid=null;

    checks.forEach(([field,requiredMessage])=>{
      if(!field)return;
      const value=field.value.trim();
      let message=value?"":requiredMessage;
      if(!message&&field.id==="phone"){
        const digits=value.replace(/\D/g,"");
        if(!/^[6-9]\d{9}$/.test(digits.slice(-10)))message="Enter a valid 10-digit Indian mobile number.";
      }
      setFieldError(field,message);
      if(message&&!firstInvalid)firstInvalid=field;
    });

    if(firstInvalid){
      firstInvalid.focus();
      firstInvalid.scrollIntoView({behavior:"smooth",block:"center"});
      return false;
    }
    return true;
  }

  function readableDate(value){
    if(!value)return "";
    const [year,month,day]=value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-IN",{
      day:"2-digit",
      month:"long",
      year:"numeric",
      timeZone:"Asia/Kolkata"
    }).format(new Date(Date.UTC(year,month-1,day,12)));
  }

  function reservationDetails(form){
    const name=$("#name",form)?.value.trim()||"";
    const phone=$("#phone",form)?.value.trim()||"";
    const date=$("#date",form)?.value||"";
    const timeField=$("#time",form);
    const time=timeField?.selectedOptions?.[0]?.textContent?.trim()||timeField?.value||"";
    const guests=$("#guests",form)?.value||"";
    const occasion=$("#occasion",form)?.value||"Dining";
    const notes=$("#message",form)?.value.trim()||"None";

    return {
      name,
      phone,
      date:readableDate(date),
      time,
      guests,
      occasion,
      notes
    };
  }

  function reservationMessage(form){
    const details=reservationDetails(form);
    return [
      "Hello Hotel Kesar,",
      "",
      "I would like to reserve a table.",
      "",
      `Name: ${details.name}`,
      `Phone: ${details.phone}`,
      `Date: ${details.date}`,
      `Time: ${details.time}`,
      `Guests: ${details.guests}`,
      `Occasion: ${details.occasion}`,
      `Notes: ${details.notes}`,
      "",
      "Please confirm availability.",
      "",
      "Sent from the Hotel Kesar website."
    ].join("\n");
  }

  function openExternal(url){
    const link=document.createElement("a");
    link.href=url;
    link.target="_blank";
    link.rel="noopener noreferrer";
    document.body.append(link);
    link.click();
    link.remove();
  }

  function bindReservationActions(form){
    form.querySelectorAll("[data-reservation-action]").forEach(action=>{
      if(action.dataset.bound==="true")return;
      action.dataset.bound="true";
      action.addEventListener("click",event=>{
        event.preventDefault();
        if(!validateReservation(form))return;

        const message=reservationMessage(form);
        const type=action.dataset.reservationAction;
        if(type==="whatsapp"){
          openExternal(`https://wa.me/${hotel.whatsapp}?text=${encodeURIComponent(message)}`);
          window.dataLayer?.push({event:"reservation_whatsapp_click"});
          return;
        }

        const details=reservationDetails(form);
        const subject=`Table Reservation - ${details.name} - ${details.date}`;
        window.location.href=`mailto:${hotel.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.dataLayer?.push({event:"reservation_email_click"});
      });
    });
  }

  function applyCompactLayout(){
    const reservation=$("#reservation");
    const heading=reservation?.querySelector(".reservation-head");
    if(heading){
      const kicker=heading.querySelector(".kicker");
      const title=heading.querySelector(".display");
      const copy=heading.querySelector(":scope > p");
      if(kicker)kicker.textContent="Reserve a table";
      if(title)title.textContent="Book your table at Kesar.";
      if(copy)copy.innerHTML=`Enter your reservation details, then send them directly to Hotel Kesar through <a href="https://wa.me/${hotel.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a> or email <a href="mailto:${hotel.email}">${hotel.email}</a>. We are open daily from ${hotel.hours}.`;
    }

    const form=reservation?.querySelector("#reservationForm");
    if(form&&!reservation.querySelector(".reservation-contact-bar")){
      const contact=document.createElement("div");
      contact.className="reservation-contact-bar reveal visible";
      contact.innerHTML=`<div><span>Hotel Kesar reservations</span><strong>Daily · ${hotel.hours}</strong></div><div class="reservation-contact-actions"><a href="https://wa.me/${hotel.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Hotel Kesar at ${hotel.phone}">WhatsApp ${hotel.phone}</a><a href="mailto:${hotel.email}" aria-label="Email Hotel Kesar at ${hotel.email}">Email us</a></div>`;
      form.before(contact);
    }

    const submit=form?.querySelector(".submit-row");
    if(submit){
      submit.innerHTML=`<p>Complete all required details, then send the full reservation request through WhatsApp or email.</p><div class="reservation-submit-actions"><a class="primary-button inline-button" href="#" data-reservation-action="whatsapp">WhatsApp to reserve →</a><a class="reservation-email-link" href="#" data-reservation-action="email">Email reservation ↗</a></div>`;
    }
    if(form)bindReservationActions(form);

    const footer=document.querySelector("footer");
    if(footer&&!footer.classList.contains("footer-compact-ready")){
      footer.classList.add("footer-compact-ready");
      footer.innerHTML=`<div class="shell footer-grid footer-grid--compact"><div class="footer-brand"><h2>KESAR</h2><span>MANDI HOUSE DINING</span><p>Slow-roasted mandi, fragrant rice and generous dining in Bengaluru.</p></div><div class="footer-contact"><h3>Contact</h3><a href="tel:+918951919010">${hotel.phone}</a><a href="https://wa.me/${hotel.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp reservations</a><a href="mailto:${hotel.email}">${hotel.email}</a></div><div class="footer-hours"><h3>Hours</h3><p>Daily · ${hotel.hours}</p><p>Today · <strong id="footerToday">${hotel.hours}</strong></p></div></div><div class="shell footer-bottom"><span>© <span id="year">${new Date().getFullYear()}</span> Hotel Kesar</span><span>Bengaluru · Mandi House Dining</span></div>`;
    }
  }

  function indiaTime(){
    return Object.fromEntries(new Intl.DateTimeFormat("en-GB",{
      timeZone:"Asia/Kolkata",
      hour:"2-digit",
      minute:"2-digit",
      hourCycle:"h23"
    }).formatToParts(new Date()).map(part=>[part.type,part.value]));
  }

  function syncHours(){
    const parts=indiaTime();
    const current=Number(parts.hour)*60+Number(parts.minute);
    const open=current>=600&&current<1380;
    const status=$("#statusText");
    const live=$("#liveTime");
    const heroStatus=$("#heroStatus");
    const today=$("#todayHours");
    const compact=$("#compactHours");
    const footerToday=$("#footerToday");

    if(status){
      status.textContent=open
        ?"Open now · closes at 11:00 PM"
        :current<600
          ?"Closed now · opens today at 10:00 AM"
          :"Closed now · opens tomorrow at 10:00 AM";
    }
    if(live)live.textContent=`${Number(parts.hour)%12||12}:${parts.minute} ${Number(parts.hour)>=12?"PM":"AM"} · Bengaluru time`;
    heroStatus?.classList.toggle("open",open);
    if(today)today.textContent=`Today · ${hotel.hours} · Bengaluru time`;
    if(compact)compact.textContent=`Today · ${hotel.hours} · Bengaluru time`;
    if(footerToday)footerToday.textContent=hotel.hours;
  }

  function populateHotelTimes(){
    const date=$("#date");
    const select=$("#time");
    if(!date||!select)return;
    select.innerHTML='<option value="">Choose a time</option>';
    if(!date.value){
      select.disabled=true;
      return;
    }
    for(let total=600;total<=1350;total+=30){
      const hour=Math.floor(total/60);
      const minute=total%60;
      const raw=`${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;
      const option=document.createElement("option");
      option.value=raw;
      option.textContent=`${hour%12||12}:${String(minute).padStart(2,"0")} ${hour>=12?"PM":"AM"}`;
      select.append(option);
    }
    select.disabled=false;
  }

  function initializeCompactUpdate(attempt=0){
    const baseReady=$("#comboAccordion .combo-row")&&$("#date")&&$("#footerToday");
    if(!baseReady&&attempt<80){
      setTimeout(()=>initializeCompactUpdate(attempt+1),50);
      return;
    }
    applyCompactLayout();
    syncHours();
    const date=$("#date");
    if(date&&!date.dataset.kesarHoursBound){
      date.dataset.kesarHoursBound="true";
      date.addEventListener("change",()=>setTimeout(populateHotelTimes,0));
    }
    setInterval(syncHours,10000);
  }

  initializeCompactUpdate();
})();