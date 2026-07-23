# Hotel KESAR

Production source for [hotelkesar.com](https://hotelkesar.com/), a static one-page restaurant website deployed on Vercel.

The complete page content lives in `index.html`. JavaScript is limited to interactions, live Bengaluru time, scroll motion, media playback, and the reservation dialog:

- `base.js` — navigation, menu tabs, dish rails, dialogs, hours, and form times
- `script.js` — loader, story motion, hero video, and image enhancements
- `reservation-modal.js` — WhatsApp and email reservation flow

Run locally with any static file server, for example:

```sh
python3 -m http.server 4173
```
