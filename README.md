# NeonKart

A responsive online store built with plain HTML, CSS and JavaScript. No frameworks, no build step.

## Run it
Open the folder in VS Code and start **Live Server** on `index.html` (double-clicking `index.html` also works).

## Features
- 12 products rendered from the `products` array in `js/data.js`, each with 3 swipeable photos, description and features
- Hero offers slider, category tiles, deals of the day with countdown, filters (category, price, search, sort)
- Product details popup with thumbnails, delivery estimate, quantity picker and Save for later
- Cart: add, change quantity, remove, empty cart; coupons `NEON10` (10% off) and `WELCOME100` (₹100 off above ₹1,500)
- Checkout form with validation and order confirmation (demo: no payment is taken)
- Cart, coupon and saved items persist through `localStorage`
- Help, policy and contact dialogs, FAQ, newsletter form; works on phones, tablets and desktops

## How totals are calculated
- Subtotal = sum of `price x quantity` for every cart line (found by product `id`, using `reduce`)
- Discount = coupon applied on the subtotal (percentage rounded to whole rupees)
- Delivery = ₹49 when the amount after discount is below ₹999, otherwise free
- Total = subtotal - discount + delivery, formatted with `toLocaleString('en-IN', { style: 'currency', currency: 'INR' })`

## Using real product photos
1. Put your photos in `images/` named `<slug>-1`, `<slug>-2`, `<slug>-3` (for example `aurora-x1-1.jpg`). Slugs are listed in `js/data.js`.
2. In `js/data.js`, change `var IMAGE_EXT = "svg";` to `"jpg"` (or `"png"` / `"webp"`).
Square photos (1:1) look best.

## Files
- `index.html` page structure
- `css/style.css` theme and responsive styles
- `js/data.js` product data
- `js/app.js` cart logic, carousels, filters, dialogs
- `images/` product images
