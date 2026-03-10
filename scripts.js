"use strict";

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const revealEls = Array.from(document.querySelectorAll(".reveal"));
revealEls.forEach((el) => el.classList.add("visible"));

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const hasSubmenu = document.querySelector(".has-submenu");
const servicesMenuBtn = document.getElementById("servicesMenuBtn");
const headerCallBtn = document.getElementById("headerCallBtn");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}

if (headerCallBtn) {
  headerCallBtn.addEventListener("click", () => {
    window.location.href = "tel:+17279351016";
  });
}

if (hasSubmenu && servicesMenuBtn) {
  servicesMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = hasSubmenu.classList.toggle("open");
    servicesMenuBtn.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (!hasSubmenu.contains(event.target)) {
      hasSubmenu.classList.remove("open");
      servicesMenuBtn.setAttribute("aria-expanded", "false");
    }
  });
}

const navLinks = Array.from(document.querySelectorAll(".main-nav a[href^='#']"));
const sectionMap = new Map();

navLinks.forEach((link) => {
  const targetId = link.getAttribute("href")?.slice(1);
  if (!targetId) {
    return;
  }
  const section = document.getElementById(targetId);
  if (section) {
    sectionMap.set(targetId, { section, link });
  }
});

function clearActiveLinks() {
  navLinks.forEach((link) => link.classList.remove("active"));
  if (servicesMenuBtn) {
    servicesMenuBtn.classList.remove("active");
  }
  Array.from(document.querySelectorAll(".services-submenu a")).forEach((link) => link.classList.remove("active"));
}

function setActiveLinkById(sectionId) {
  clearActiveLinks();
  const matched = sectionMap.get(sectionId);
  if (matched) {
    matched.link.classList.add("active");
  }

  const serviceIds = ["service-oil", "service-brakes", "service-ac", "service-tire", "service-diagnostics", "service-overhaul", "service-other"];
  if (servicesMenuBtn && serviceIds.includes(sectionId)) {
    servicesMenuBtn.classList.add("active");
    const activeSub = document.querySelector(`.services-submenu a[href="#${sectionId}"]`);
    if (activeSub) {
      activeSub.classList.add("active");
    }
  }
}

function animateSectionFromNav(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) {
    return;
  }

  const leftEls = Array.from(section.querySelectorAll(".from-left"));
  const rightEls = Array.from(section.querySelectorAll(".from-right"));

  leftEls.forEach((el) => {
    el.classList.remove("nav-animate-left");
    void el.offsetWidth;
    el.classList.add("nav-animate-left");
  });

  rightEls.forEach((el) => {
    el.classList.remove("nav-animate-right");
    void el.offsetWidth;
    el.classList.add("nav-animate-right");
  });
}

if (mainNav) {
  Array.from(mainNav.querySelectorAll("a[href^='#']")).forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href")?.slice(1);
      if (targetId) {
        setTimeout(() => animateSectionFromNav(targetId), 80);
      }

      if (window.innerWidth <= 1024 && menuToggle) {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
      if (hasSubmenu && servicesMenuBtn) {
        hasSubmenu.classList.remove("open");
        servicesMenuBtn.setAttribute("aria-expanded", "false");
      }
    });
  });
}

const trackedSections = Array.from(sectionMap.values()).map((item) => item.section);
if (trackedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visibleEntries[0]?.target?.id) {
        setActiveLinkById(visibleEntries[0].target.id);
      }
    },
    { threshold: [0.2, 0.45, 0.7], rootMargin: "-20% 0px -55% 0px" }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
}
setActiveLinkById("home");

const pageButtons = Array.from(document.querySelectorAll(".page-btn"));
const testimonialPages = Array.from(document.querySelectorAll(".testimonial-page"));

function showPage(pageNumber) {
  testimonialPages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === pageNumber);
  });
  pageButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.targetPage === pageNumber);
  });
}

pageButtons.forEach((btn) => {
  btn.addEventListener("click", () => showPage(btn.dataset.targetPage));
});

const successModal = document.getElementById("successModal");
let successTimer = null;
let successPreviousBodyOverflow = null;
const FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/iglibregu00@hotmail.com";
const FORM_SUBMIT_FALLBACK_ENDPOINT = "https://formsubmit.co/iglibregu00@hotmail.com";

async function sendSubmissionEmail(payload) {
  const submissionData = {
    ...payload,
    _captcha: "false",
    _template: "table"
  };

  try {
    const response = await fetch(FORM_SUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(submissionData)
    });

    const responseData = await response.json().catch(() => ({}));
    const isExplicitFailure = responseData.success === false || responseData.success === "false";
    if (!response.ok || isExplicitFailure) {
      throw new Error(responseData.message || "Email submission failed.");
    }
    return;
  } catch (ajaxError) {
    const formData = new FormData();
    Object.entries(submissionData).forEach(([key, value]) => {
      formData.append(key, String(value ?? ""));
    });

    // Fallback for cases where CORS blocks AJAX form submission.
    await fetch(FORM_SUBMIT_FALLBACK_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });
  }
}

function showSuccessModal() {
  if (!successModal) {
    return;
  }
  if (!successModal.classList.contains("show")) {
    successPreviousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  successModal.classList.add("show");
  successModal.setAttribute("aria-hidden", "false");
  if (successTimer) {
    window.clearTimeout(successTimer);
  }
  successTimer = window.setTimeout(() => {
    successModal.classList.remove("show");
    successModal.setAttribute("aria-hidden", "true");
    if (successPreviousBodyOverflow !== null) {
      document.body.style.overflow = successPreviousBodyOverflow;
      successPreviousBodyOverflow = null;
    }
  }, 3000);
}

const bookingModal = document.getElementById("bookingModal");
const openBookingHero = document.getElementById("openBookingHero");
const closeModalButtons = Array.from(document.querySelectorAll("[data-close-modal]"));

const bookingForm = document.getElementById("bookingForm");
const formSteps = Array.from(document.querySelectorAll(".form-step"));
const prevStepBtn = document.getElementById("prevStep");
const stepActionBtn = document.getElementById("stepActionBtn");
const modalStepText = document.getElementById("modalStepText");
const formError = document.getElementById("formError");
const timelineOther = document.getElementById("timelineOther");
const otherDateWrap = document.getElementById("otherDateWrap");
const otherDateInput = document.getElementById("otherDate");

let currentStep = 1;

function updateStepUi() {
  formSteps.forEach((step) => {
    step.classList.toggle("active", Number(step.dataset.step) === currentStep);
  });

  modalStepText.textContent = `Step ${currentStep} of 4`;
  prevStepBtn.hidden = currentStep === 1;
  stepActionBtn.textContent = currentStep === 4 ? "Send Request" : "Next";
  formError.textContent = "";
}

function openModal() {
  bookingModal.classList.add("open");
  bookingModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  bookingModal.classList.remove("open");
  bookingModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

if (openBookingHero) {
  openBookingHero.addEventListener("click", openModal);
}

closeModalButtons.forEach((btn) => btn.addEventListener("click", closeModal));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && bookingModal.classList.contains("open")) {
    closeModal();
  }
});

function validateStep(step) {
  if (step === 1) {
    const serviceSelected = bookingForm.querySelector("input[name='service']:checked");
    if (!serviceSelected) {
      formError.textContent = "Please select a service to continue.";
      return false;
    }
  }

  if (step === 2) {
    const city = bookingForm.querySelector("input[name='city']").value.trim();
    if (!city) {
      formError.textContent = "Please enter your city.";
      return false;
    }
  }

  if (step === 3) {
    const timeline = bookingForm.querySelector("input[name='timeline']:checked");
    if (!timeline) {
      formError.textContent = "Please choose a request timeline.";
      return false;
    }
    if (timeline.value === "Other" && !otherDateInput.value) {
      formError.textContent = "Please choose a date for the Other option.";
      return false;
    }
  }

  if (step === 4) {
    const requiredFields = ["name", "phone", "email"];
    for (const fieldName of requiredFields) {
      const field = bookingForm.querySelector(`[name='${fieldName}']`);
      if (!field || !field.value.trim()) {
        formError.textContent = "Please complete all contact fields.";
        return false;
      }
    }
  }

  return true;
}

if (timelineOther && otherDateWrap && otherDateInput) {
  bookingForm.querySelectorAll("input[name='timeline']").forEach((input) => {
    input.addEventListener("change", () => {
      const showDate = timelineOther.checked;
      otherDateWrap.classList.toggle("hidden", !showDate);
      otherDateInput.required = showDate;
    });
  });
}

if (stepActionBtn) {
  stepActionBtn.addEventListener("click", async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < 4) {
      currentStep += 1;
      updateStepUi();
      return;
    }

    const service = bookingForm.querySelector("input[name='service']:checked")?.value || "";
    const city = bookingForm.querySelector("input[name='city']")?.value.trim() || "";
    const timeline = bookingForm.querySelector("input[name='timeline']:checked")?.value || "";
    const otherDate = bookingForm.querySelector("input[name='otherDate']")?.value || "";
    const name = bookingForm.querySelector("input[name='name']")?.value.trim() || "";
    const phone = bookingForm.querySelector("input[name='phone']")?.value.trim() || "";
    const email = bookingForm.querySelector("input[name='email']")?.value.trim() || "";

    formError.textContent = "";
    stepActionBtn.disabled = true;
    stepActionBtn.textContent = "Sending...";

    try {
      await sendSubmissionEmail({
        _subject: "New Booking Request - Full Service Auto Repair",
        Source: "Booking Modal",
        Service: service,
        City: city,
        Timeline: timeline,
        "Other Date": otherDate || "N/A",
        Name: name,
        Phone: phone,
        Email: email
      });

      closeModal();
      bookingForm.reset();
      currentStep = 1;
      otherDateWrap.classList.add("hidden");
      otherDateInput.required = false;
      updateStepUi();
      showSuccessModal();
    } catch (error) {
      formError.textContent = "We could not send your request. Please try again.";
      console.error(error);
    } finally {
      stepActionBtn.disabled = false;
      stepActionBtn.textContent = currentStep === 4 ? "Send Request" : "Next";
    }
  });
}

if (prevStepBtn) {
  prevStepBtn.addEventListener("click", () => {
    currentStep = Math.max(1, currentStep - 1);
    updateStepUi();
  });
}

const contactForm = document.getElementById("contactForm");
const contactFormError = document.getElementById("contactFormError");

if (contactForm && contactFormError) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = contactForm.querySelector("input[name='name']")?.value.trim() || "";
    const surname = contactForm.querySelector("input[name='surname']")?.value.trim() || "";
    const phone = contactForm.querySelector("input[name='phone']")?.value.trim() || "";
    const email = contactForm.querySelector("input[name='email']")?.value.trim() || "";
    const contactSubmitButton = contactForm.querySelector("button[type='submit']");

    if (!name || !surname || !phone || !email) {
      contactFormError.textContent = "Please fill in all contact form fields.";
      return;
    }

    contactFormError.textContent = "";

    if (contactSubmitButton) {
      contactSubmitButton.disabled = true;
      contactSubmitButton.textContent = "Sending...";
    }

    try {
      await sendSubmissionEmail({
        _subject: "New Contact Request - Full Service Auto Repair",
        Source: "Contact Form",
        Name: name,
        Surname: surname,
        Phone: phone,
        Email: email
      });

      contactForm.reset();
      showSuccessModal();
    } catch (error) {
      contactFormError.textContent = "We could not send your request. Please try again.";
      console.error(error);
    } finally {
      if (contactSubmitButton) {
        contactSubmitButton.disabled = false;
        contactSubmitButton.textContent = "Send Request";
      }
    }
  });
}

updateStepUi();
