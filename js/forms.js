/* ==========================================================================
   FROSTLINK — forms.js
   - buildGoogleFormUrl(): safely builds a prefilled Google Form URL.
   - Generic handling for every <form data-google-form="..."> on the site:
     validates required fields, builds the prefilled URL, opens the Google
     Form in a new tab. The site NEVER submits directly to Google — the
     visitor reviews and submits the Google Form themselves.
   - Request a Quote modal: injected once, populated from the clicked
     product card, and reuses the same generic submit flow.
   ========================================================================== */

(function () {
  "use strict";

  /**
   * Build a prefilled Google Form URL.
   * @param {string} baseUrl - the form's /viewform base URL
   * @param {Array<[string, string]>} fieldEntries - [entryId, value] pairs.
   *        A field name may repeat (e.g. multiple checkboxes for one
   *        question) — every non-empty value is included.
   * @returns {string}
   */
  function buildGoogleFormUrl(baseUrl, fieldEntries) {
    var params = new URLSearchParams();
    params.set("usp", "pp_url");
    fieldEntries.forEach(function (pair) {
      var key = pair[0];
      var value = pair[1];
      if (!key || typeof value !== "string") return;
      var trimmed = value.trim();
      if (trimmed === "") return;
      if (key.indexOf("entry.") !== 0) return; // only forward actual Google Form entry fields
      params.append(key, trimmed);
    });
    return baseUrl + "?" + params.toString();
  }

  // Expose for reuse / testing
  window.buildGoogleFormUrl = buildGoogleFormUrl;

  /* ------------------------------------------------------------------ *
   * Generic validation + submit handling for any [data-google-form] form
   * ------------------------------------------------------------------ */

  function fieldWrapper(input) {
    return input.closest(".field") || input.parentElement;
  }

  function showFieldError(input) {
    var wrap = fieldWrapper(input);
    if (wrap) wrap.classList.add("has-error");
  }

  function clearFieldError(input) {
    var wrap = fieldWrapper(input);
    if (wrap) wrap.classList.remove("has-error");
  }

  function validateForm(form) {
    var invalidEls = [];
    var controls = form.querySelectorAll("input, select, textarea");

    controls.forEach(function (el) {
      if (el.type === "checkbox" || el.type === "radio") {
        // Checkbox groups: only flag if the whole group is required and none checked
        return;
      }
      if (el.hasAttribute("disabled")) return;
      if (el.checkValidity()) {
        clearFieldError(el);
      } else {
        showFieldError(el);
        invalidEls.push(el);
      }
    });

    // Handle "required" checkbox groups (e.g. product categories) as a set
    var requiredGroups = {};
    form.querySelectorAll('input[type="checkbox"][data-group-required]').forEach(function (cb) {
      var groupName = cb.name;
      requiredGroups[groupName] = requiredGroups[groupName] || [];
      requiredGroups[groupName].push(cb);
    });
    Object.keys(requiredGroups).forEach(function (groupName) {
      var boxes = requiredGroups[groupName];
      var anyChecked = boxes.some(function (b) { return b.checked; });
      var groupWrap = boxes[0].closest(".field");
      if (!anyChecked) {
        if (groupWrap) groupWrap.classList.add("has-error");
        invalidEls.push(boxes[0]);
      } else if (groupWrap) {
        groupWrap.classList.remove("has-error");
      }
    });

    return invalidEls;
  }

  function setStatus(form, message, isError) {
    var statusEl = form.querySelector("[data-form-status]");
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.add("is-visible");
    statusEl.classList.toggle("status-ok", !isError);
    statusEl.classList.toggle("status-err", !!isError);
  }

  function handleGoogleFormSubmit(form) {
    var invalid = validateForm(form);
    if (invalid.length) {
      invalid[0].focus({ preventScroll: false });
      invalid[0].scrollIntoView({ behavior: "smooth", block: "center" });
      setStatus(form, "Please complete the required fields highlighted below.", true);
      return;
    }

    var baseUrl = form.getAttribute("data-google-form");
    if (!baseUrl) return;

    var formData = new FormData(form);
    var entries = [];
    formData.forEach(function (value, key) {
      if (typeof value === "string") entries.push([key, value]);
    });

    var url = buildGoogleFormUrl(baseUrl, entries);
    window.open(url, "_blank", "noopener,noreferrer");
    setStatus(form, "Your information has been prepared. Please review and submit the Google Form that just opened in a new tab.", false);
  }

  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!form.hasAttribute("data-google-form")) return;
    e.preventDefault();
    handleGoogleFormSubmit(form);
  });

  // Clear error state as the visitor fixes a field
  document.addEventListener("input", function (e) {
    var el = e.target;
    if (!el.closest || !el.closest("form[data-google-form]")) return;
    if (el.checkValidity && el.checkValidity()) clearFieldError(el);
  });
  document.addEventListener("change", function (e) {
    var el = e.target;
    if (!el.closest || !el.closest("form[data-google-form]")) return;
    if (el.type === "checkbox" && el.hasAttribute("data-group-required")) {
      var group = el.closest(".field");
      if (group && group.querySelector('input[type="checkbox"]:checked')) {
        group.classList.remove("has-error");
      }
    }
  });

  /* ------------------------------------------------------------------ *
   * Request a Quote modal (Google Form 1)
   * ------------------------------------------------------------------ */

  var QUOTE_FORM_BASE = "https://docs.google.com/forms/d/e/1FAIpQLSfzQuduGW9RV77PasLM7-uqu03d7amjU35FgcoQi83NcWEAFA/viewform";

  function quoteModalMarkup() {
    return (
      '<div class="modal-overlay" data-quote-modal aria-hidden="true">' +
        '<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="quoteModalTitle">' +
          '<button type="button" class="modal-close" data-modal-close aria-label="Close">&times;</button>' +
          '<h3 id="quoteModalTitle">Request a Quote</h3>' +
          '<p class="modal-sub">Tell us what you need — we\u2019ll prepare a prefilled enquiry for you to review and send via Google Forms.</p>' +
          '<form data-google-form="' + QUOTE_FORM_BASE + '" novalidate style="margin-top:24px;">' +
            '<div class="form-grid">' +
              '<div class="field full">' +
                '<label for="q-product">Product Name <span class="req">*</span></label>' +
                '<input type="text" id="q-product" name="entry.2005620554" required maxlength="120">' +
              "</div>" +
              '<div class="field full">' +
                '<label for="q-supplier">Supplier / Manufacturer</label>' +
                '<input type="text" id="q-supplier" name="entry.1045781291" maxlength="120" placeholder="If known">' +
              "</div>" +
              '<div class="field">' +
                '<label for="q-name">Your Full Name <span class="req">*</span></label>' +
                '<input type="text" id="q-name" name="entry.1065046570" required maxlength="100">' +
              "</div>" +
              '<div class="field">' +
                '<label for="q-company">Company / Buyer Name <span class="req">*</span></label>' +
                '<input type="text" id="q-company" name="entry.1166974658" required maxlength="120">' +
              "</div>" +
              '<div class="field">' +
                '<label for="q-email">Work Email <span class="req">*</span></label>' +
                '<input type="email" id="q-email" name="entry.839337160" required maxlength="120">' +
              "</div>" +
              '<div class="field">' +
                '<label for="q-phone">Phone / WhatsApp <span class="req">*</span></label>' +
                '<input type="tel" id="q-phone" name="entry.163572529" required pattern="[0-9+\\-\\s()]{7,20}" placeholder="+91 98765 43210">' +
              "</div>" +
              '<div class="field">' +
                '<label for="q-qty">Quantity Required <span class="req">*</span></label>' +
                '<input type="text" id="q-qty" name="entry.1217233443" required placeholder="e.g. 5 MT / month" maxlength="80">' +
              "</div>" +
              '<div class="field">' +
                '<label for="q-location">Delivery Location <span class="req">*</span></label>' +
                '<input type="text" id="q-location" name="entry.576657201" required maxlength="120">' +
              "</div>" +
              '<div class="field full">' +
                '<label for="q-notes">Specific Requirements / Custom Packaging Notes</label>' +
                '<textarea id="q-notes" name="entry.1404917016" maxlength="600" placeholder="Packaging format, delivery schedule, certifications needed, etc."></textarea>' +
              "</div>" +
            "</div>" +
            '<div class="form-status" data-form-status></div>' +
            '<button type="submit" class="btn btn-primary btn-block" style="margin-top:8px;">Prepare Quote Request</button>' +
          "</form>" +
        "</div>" +
      "</div>"
    );
  }

  var quoteModalEl = null;

  function injectQuoteModal() {
    if (quoteModalEl) return quoteModalEl;
    var wrap = document.createElement("div");
    wrap.innerHTML = quoteModalMarkup();
    quoteModalEl = wrap.firstElementChild;
    document.body.appendChild(quoteModalEl);

    quoteModalEl.querySelector("[data-modal-close]").addEventListener("click", closeQuoteModal);
    quoteModalEl.addEventListener("click", function (e) {
      if (e.target === quoteModalEl) closeQuoteModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && quoteModalEl.classList.contains("is-open")) closeQuoteModal();
    });

    return quoteModalEl;
  }

  function openQuoteModal(productName, manufacturer) {
    var modal = injectQuoteModal();
    var form = modal.querySelector("form");
    form.reset();
    form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("has-error"); });
    var statusEl = form.querySelector("[data-form-status]");
    if (statusEl) { statusEl.classList.remove("is-visible", "status-ok", "status-err"); }

    var productInput = form.querySelector("#q-product");
    var supplierInput = form.querySelector("#q-supplier");
    if (productName) {
      productInput.value = productName;
      supplierInput.value = manufacturer || "";
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");

    window.setTimeout(function () {
      (productName ? form.querySelector("#q-name") : productInput).focus();
    }, 60);
  }

  function closeQuoteModal() {
    if (!quoteModalEl) return;
    quoteModalEl.classList.remove("is-open");
    quoteModalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest(".js-request-quote");
    if (!trigger) return;
    e.preventDefault();
    openQuoteModal(trigger.getAttribute("data-product-name"), trigger.getAttribute("data-product-manufacturer"));
  });

  document.addEventListener("DOMContentLoaded", injectQuoteModal);

  window.FrostLinkForms = { openQuoteModal: openQuoteModal, closeQuoteModal: closeQuoteModal };
})();
