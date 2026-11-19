# NeonKart | E-Commerce Store

**NeonKart** is a modern and responsive e-commerce storefront designed to deliver a seamless and interactive online shopping experience. Built using HTML5, CSS3, and Vanilla JavaScript, the project focuses on clean UI design, dynamic product interactions, and efficient shopping cart management.

## Overview

NeonKart provides a complete frontend shopping experience with product discovery, interactive product details, cart functionality, promotional offers, and a streamlined checkout interface.

## Features

### Product Browsing
- Dynamic product catalog featuring 12 products.
- Three swipeable images for each product.
- Detailed product descriptions and feature highlights.
- Interactive product categories and promotional sections.

### Search & Filtering
- Real-time product search.
- Category-based filtering.
- Price range filtering.
- Product sorting options.

### Product Details
- Interactive product details popup.
- Image gallery with thumbnail navigation.
- Product quantity selection.
- Estimated delivery information.
- Save for Later functionality.

### Shopping Cart
- Add and remove products.
- Increase or decrease product quantities.
- Clear cart functionality.
- Dynamic cart and order summary.
- Persistent cart data using Local Storage.

### Offers & Discounts
- Promotional hero slider.
- Deals of the Day with countdown timer.
- Coupon code integration:
  - `NEON10` – 10% discount.
  - `WELCOME100` – ₹100 discount on orders above ₹1,500.

### Checkout & Order Management
- Interactive checkout form.
- Form validation.
- Automatic price and discount calculations.
- Delivery charge calculation.
- Order confirmation interface.

### Additional Functionality
- FAQ section.
- Help and policy dialogs.
- Contact interface.
- Newsletter subscription form.
- Responsive navigation and layouts.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Website structure and content |
| CSS3 | Styling, layouts and responsive design |
| JavaScript | Interactive functionality and dynamic content |
| Local Storage | Persistent cart, coupon and saved-item data |

## Project Structure

```text
NeonKart/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── data.js
│   └── app.js
│
├── images/
│   └── Product images and visual assets
│
└── README.md
```

## Shopping & Pricing Logic

The application dynamically calculates the final order amount using the following logic:

- **Subtotal:** Sum of individual product prices multiplied by their quantities.
- **Discount:** Calculated according to the applied coupon.
- **Delivery Charges:** ₹49 for orders below ₹999 after discount; free delivery for orders of ₹999 or above.
- **Final Total:** Subtotal − Discount + Delivery Charges.

All currency values are formatted using the Indian Rupee (INR) format.

## Responsive Design

The interface is designed to provide a consistent shopping experience across:

- Desktop computers
- Tablets
- Mobile devices

## Important Note

NeonKart is a frontend e-commerce demonstration project. The checkout process and order confirmation are simulated. No real transactions or payments are processed.

---

**Developed with HTML, CSS and JavaScript.**
