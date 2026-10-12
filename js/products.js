/* ==========================================================================
   FROSTLINK — products.js
   Product catalogue data + dynamic card rendering. Edit the PRODUCTS array
   to add, remove or update products — cards are generated from this data.
   ========================================================================== */

(function () {
  "use strict";

  var CATEGORIES = [
    { key: "vegetables", label: "Frozen Vegetables" },
    { key: "fruits", label: "Frozen Fruits" },
    { key: "ready-to-cook", label: "Ready-to-Cook" }
  ];

  var PRODUCTS = [
    {
      id: "p01",
      name: "IQF Green Peas",
      category: "vegetables",
      manufacturer: "Northfield Agro Freeze",
      image: "assets/images/frozen-vegetables.jpg",
      description: "Individually quick-frozen green peas, graded for size and colour consistency. Supplied in bulk cartons for food-service use."
    },
    {
      id: "p02",
      name: "Sweet Corn Kernels",
      category: "vegetables",
      manufacturer: "Green Harvest Processors",
      image: "assets/images/frozen-vegetables.jpg",
      description: "Blanched and flash-frozen sweet corn kernels. Consistent kernel size, suited to retail repack and bulk catering orders."
    },
    {
      id: "p03",
      name: "Mixed Vegetables Blend",
      category: "vegetables",
      manufacturer: "Northfield Agro Freeze",
      image: "assets/images/frozen-vegetables.jpg",
      description: "Peas, carrot, corn and green beans blended to a standard ratio. Available in custom blend ratios on request."
    },
    {
      id: "p04",
      name: "IQF Cauliflower Florets",
      category: "vegetables",
      manufacturer: "Valley Fresh Exports",
      image: "assets/images/frozen-vegetables.jpg",
      description: "Trimmed, uniform cauliflower florets, individually frozen to prevent clumping during storage and transit."
    },
    {
      id: "p05",
      name: "IQF Broccoli Florets",
      category: "vegetables",
      manufacturer: "Valley Fresh Exports",
      image: "assets/images/frozen-vegetables.jpg",
      description: "Fresh-cut broccoli florets, blanched and frozen within hours of harvest to retain colour and texture."
    },
    {
      id: "p06",
      name: "Baby Carrot Rounds",
      category: "vegetables",
      manufacturer: "Northfield Agro Freeze",
      image: "assets/images/frozen-vegetables.jpg",
      description: "Sliced baby carrot rounds, IQF processed for even cooking. Suited to soups, mixed-vegetable packs and buffet lines."
    },
    {
      id: "p07",
      name: "IQF Mango Chunks",
      category: "fruits",
      manufacturer: "Tropicold Fruits",
      image: "assets/images/frozen-fruits.jpg",
      description: "Ripe mango, diced and individually quick-frozen. Common inputs for smoothies, desserts and food-service prep."
    },
    {
      id: "p08",
      name: "IQF Strawberries",
      category: "fruits",
      manufacturer: "Tropicold Fruits",
      image: "assets/images/frozen-fruits.jpg",
      description: "Whole and sliced strawberry options, frozen at peak ripeness. Available in bulk cartons or repack-ready formats."
    },
    {
      id: "p09",
      name: "Mixed Berry Blend",
      category: "fruits",
      manufacturer: "Alpine Berry Co.",
      image: "assets/images/frozen-fruits.jpg",
      description: "Blueberry, raspberry and blackberry blend, IQF processed. Custom blend ratios available for food-service accounts."
    },
    {
      id: "p10",
      name: "Fruit Purees",
      category: "fruits",
      manufacturer: "Tropicold Fruits",
      image: "assets/images/frozen-fruits.jpg",
      description: "Mango, strawberry and mixed-berry purees, frozen in bulk pails or bag-in-box formats for beverage and dessert use."
    },
    {
      id: "p11",
      name: "Ready-to-Cook Vegetable Mix",
      category: "ready-to-cook",
      manufacturer: "ProCold Kitchens",
      image: "assets/images/packaging-facility.jpg",
      description: "Pre-portioned, seasoned vegetable mix designed to go from freezer to pan. Custom portioning available for institutional buyers."
    },
    {
      id: "p12",
      name: "IQF Baby Corn Cobs",
      category: "ready-to-cook",
      manufacturer: "Green Harvest Processors",
      image: "assets/images/packaging-facility.jpg",
      description: "Whole baby corn cobs, individually frozen. Supplied loose-pack for further processing or direct food-service use."
    }
  ];

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function categoryLabel(key) {
    var found = CATEGORIES.filter(function (c) { return c.key === key; })[0];
    return found ? found.label : key;
  }

  function cardHtml(product) {
    return (
      '<article class="product-card" data-category="' + product.category + '">' +
        '<div class="thumb">' +
          '<span class="cat-pill">' + escapeHtml(categoryLabel(product.category)) + "</span>" +
          '<img src="' + product.image + '" alt="' + escapeHtml(product.name) + '" loading="lazy" width="400" height="300">' +
        "</div>" +
        '<div class="body">' +
          "<h3>" + escapeHtml(product.name) + "</h3>" +
          '<p class="mfr">' + escapeHtml(product.manufacturer) + "</p>" +
          '<p class="desc">' + escapeHtml(product.description) + "</p>" +
          '<div class="card-actions">' +
            '<button type="button" class="btn btn-outline btn-block btn-sm js-request-quote" ' +
              'data-product-name="' + escapeHtml(product.name) + '" ' +
              'data-product-manufacturer="' + escapeHtml(product.manufacturer) + '">' +
              "Request a Quote" +
            "</button>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderInto(container, list) {
    if (!container) return;
    if (!list.length) {
      container.innerHTML = '<div class="empty-state">No products found in this category yet. Try another category or contact us directly.</div>';
      return;
    }
    container.innerHTML = list.map(cardHtml).join("");
  }

  function initFeaturedProducts() {
    var container = document.querySelector("[data-featured-products]");
    if (!container) return;
    var count = parseInt(container.getAttribute("data-featured-products"), 10) || 6;
    renderInto(container, PRODUCTS.slice(0, count));
  }

  function initProductGrid() {
    var container = document.querySelector("[data-product-grid]");
    if (!container) return;

    var tabs = document.querySelectorAll("[data-filter]");
    var countEl = document.querySelector("[data-result-count]");

    function apply(filterKey) {
      var list = filterKey === "all" ? PRODUCTS : PRODUCTS.filter(function (p) { return p.category === filterKey; });
      renderInto(container, list);
      if (countEl) {
        countEl.textContent = list.length + (list.length === 1 ? " product" : " products");
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        apply(tab.getAttribute("data-filter"));
      });
    });

    apply("all");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFeaturedProducts();
    initProductGrid();
  });

  // Expose read-only references for forms.js (quote modal needs product data
  // only via the button's data attributes, but categories are shared here)
  window.FrostLinkProducts = {
    CATEGORIES: CATEGORIES,
    PRODUCTS: PRODUCTS
  };
})();
