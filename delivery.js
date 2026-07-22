(() => {
  "use strict";
  const platforms={swiggy:"https://www.swiggy.com/city/bangalore/hotel-kesar-fine-dine-basaveshwaranagar-rest1288354",zomato:"https://www.zomato.com/bangalore/hotel-kesar-family-dine-veg-and-non-veg-peenya-bangalore"};
  if(!document.querySelector('link[data-kesar-mobile]')){const mobile=document.createElement("link");mobile.rel="stylesheet";mobile.href="/mobile.css";mobile.media="(max-width: 767px)";mobile.dataset.kesarMobile="true";document.head.append(mobile)}
  document.querySelectorAll("[data-delivery-platform]").forEach(link=>{const platform=link.dataset.deliveryPlatform;const url=platforms[platform];if(!url){link.hidden=true;link.removeAttribute("href");return}link.href=url;link.addEventListener("click",()=>window.dataLayer?.push({event:"delivery_platform_click",platform}))});
})();