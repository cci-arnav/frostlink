# FrostLink — B2B Frozen Food Network

A frontend-only, multi-page website for FrostLink, a B2B network connecting
frozen food manufacturers with commercial buyers. Built with plain HTML,
CSS and vanilla JavaScript — no build step, no framework, no backend.

## Running it

There's nothing to install or build. Open `index.html` directly in a
browser, or serve the folder with any static file server, e.g.:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## File structure

```
/
  index.html            Home page
  products.html          Product catalogue (filterable grid)
  manufacturers.html     Manufacturer network overview + registration form
  buyers.html             For Buyers + Commercial Sourcing Enquiry form
  about.html              About FrostLink
  contact.html             Contact form

  css/
    style.css             All styles (design tokens, layout, components)

  js/
    main.js                Mobile nav menu, active nav-link highlighting
    products.js             Product catalogue data + card rendering
    forms.js                 Google Form URL builder, form validation,
                              submit handling, and the Request-a-Quote modal

  assets/images/
    frozen-vegetables.jpg    Product category / card imagery
    frozen-fruits.jpg
    packaging-facility.jpg
    cold-storage-warehouse.jpg
```

## How the Google Forms integration works

FrostLink never submits data directly to Google. Instead:

1. The visitor fills in a form on the FrostLink site.
2. JavaScript validates the required fields.
3. `buildGoogleFormUrl()` (in `js/forms.js`) builds a prefilled Google Form
   URL using `URLSearchParams`, so special characters (`&`, `+`, `@`,
   commas, line breaks, etc.) are encoded safely.
4. The Google Form opens in a new tab, prefilled with the visitor's answers.
5. The visitor reviews the form and clicks **Google's own Submit button**.
   Only then is the response recorded.

Every form that should use this flow simply needs two things in the HTML:

- `<form data-google-form="https://docs.google.com/forms/d/e/.../viewform">`
- Inputs whose `name` attribute is the Google Form entry ID, e.g.
  `name="entry.2005620554"`

`forms.js` listens for `submit` on any `form[data-google-form]` on the page
(including forms injected later, like the quote modal), so no extra wiring
is needed to add a new form — just give it the right `data-google-form`
base URL and `entry.*` field names.

Checkbox groups that should map to one Google Forms question (like
"Product Categories Manufactured") just share the same `name`; the URL
builder automatically repeats that `entry.*` parameter once per checked
box, which is how Google Forms expects prefilled checkbox answers.

### The four forms in use

| Form | Page | Purpose |
|---|---|---|
| Form 1 | Request a Quote modal (site-wide) | Product-specific quote requests |
| Form 2 | `manufacturers.html#register` | Manufacturer registration |
| Form 3 | `buyers.html#sourcing` | Commercial sourcing enquiries |
| Form 4 | `contact.html` | General contact |

## Editing the product catalogue

All product data lives in one place: the `PRODUCTS` array near the top of
`js/products.js`. Each entry looks like:

```js
{
  id: "p01",
  name: "IQF Green Peas",
  category: "vegetables",       // "vegetables" | "fruits" | "ready-to-cook"
  manufacturer: "Northfield Agro Freeze",
  image: "assets/images/frozen-vegetables.jpg",
  description: "..."
}
```

Add, remove or edit entries there — the product grid on `products.html`
and the featured-products strip on `index.html` are both generated from
this same array, so there's nothing else to update. Clicking "Request a
Quote" on any card automatically passes that product's name and
manufacturer into the quote form.

## Notes

- No frameworks, no bundler, no TypeScript, no backend — plain HTML/CSS/JS
  throughout, per the brief.
- Fonts (Space Grotesk, Inter) load from Google Fonts over the network;
  the layout still works without them (system-font fallback is set).
- Replace the placeholder manufacturer names in `products.js` with your
  real manufacturer list whenever you're ready.
