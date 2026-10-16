/* KnightAura shared interactions — one source of truth for every page. */
(() => {
  const root = document.documentElement;
  const THEME_KEY = 'knight-aura-theme';
  const DIR_KEY = 'knight-aura-dir';

  const safeGet = (key, fallback = null) => {
    try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; }
  };
  const safeSet = (key, value) => {
    try { localStorage.setItem(key, value); } catch (_) {}
  };

  const renderIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  const applyTheme = (theme) => {
    const value = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = value;
    if (document.body) {
      document.body.dataset.theme = value;
      document.body.classList.toggle('dark-mode', value === 'dark');
    }
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-label', value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('title', value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('aria-pressed', String(value === 'dark'));
      button.innerHTML = value === 'dark'
        ? '<i data-lucide="sun"></i>'
        : '<i data-lucide="moon"></i>';
    });
    safeSet(THEME_KEY, value);
    renderIcons();
  };

  const applyDirection = (direction) => {
    const value = direction === 'rtl' ? 'rtl' : 'ltr';
    root.dir = value;
    safeSet(DIR_KEY, value);
    document.querySelectorAll('[data-rtl-toggle], [data-rtl-label]').forEach((el) => {
      el.setAttribute('aria-label', value === 'rtl' ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
      el.setAttribute('title', value === 'rtl' ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
      if (el.hasAttribute('data-rtl-toggle')) el.setAttribute('aria-pressed', String(value === 'rtl'));
    });
  };

  // Apply saved values before interactions are attached.
  root.dataset.theme = safeGet(THEME_KEY, root.dataset.theme || 'light') === 'dark' ? 'dark' : 'light';
  root.dir = safeGet(DIR_KEY, root.dir || 'ltr') === 'rtl' ? 'rtl' : 'ltr';

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(root.dataset.theme);
    applyDirection(root.dir);

    // Mark the current page in both the main navigation and footer navigation.
    const currentFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.site-header a[href], .site-footer a[href]').forEach((link) => {
      const rawHref = (link.getAttribute('href') || '').trim();
      if (!rawHref || rawHref.startsWith('#') || /^(?:https?:|mailto:|tel:|javascript:)/i.test(rawHref)) return;
      const targetFile = rawHref.split(/[?#]/)[0].split('/').pop().toLowerCase();
      if (targetFile && targetFile === currentFile) {
        link.setAttribute('aria-current', 'page');
        if (link.classList.contains('nav-link')) link.classList.add('is-active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('is-active');
      }
    });

    // Bind each theme button exactly once. This replaces the previous duplicate handlers.
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      if (button.dataset.themeBound === 'true') return;
      button.dataset.themeBound = 'true';
      button.addEventListener('click', () => {
        applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
      });
    });

    document.querySelectorAll('[data-rtl-toggle]').forEach((button) => {
      if (button.dataset.rtlBound === 'true') return;
      button.dataset.rtlBound = 'true';
      button.addEventListener('click', () => {
        applyDirection(root.dir === 'rtl' ? 'ltr' : 'rtl');
      });
    });

    // Main navigation toggle variants used across the supplied pages.
    const navToggle = document.querySelector('[data-nav-toggle]');
    const navWrap = document.querySelector('[data-nav-wrap]');
    if (navToggle && navWrap) {
      navToggle.addEventListener('click', () => {
        const open = navWrap.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(open));
      });
    }

    document.querySelectorAll('[data-dropdown-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('.nav-item');
        if (!item) return;
        const open = item.classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(open));
      });
    });

    const homeDropdown = document.querySelector('[data-home-dropdown]');
    const homeTrigger = document.querySelector('[data-home-trigger]');
    if (homeDropdown && homeTrigger) {
      homeTrigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = homeDropdown.classList.toggle('is-open');
        homeTrigger.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', (event) => {
        if (!homeDropdown.contains(event.target)) {
          homeDropdown.classList.remove('is-open');
          homeTrigger.setAttribute('aria-expanded', 'false');
        }
      });
      homeTrigger.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          homeDropdown.classList.remove('is-open');
          homeTrigger.setAttribute('aria-expanded', 'false');
          homeTrigger.focus();
        }
      });
    }

    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const mainNav = document.querySelector('[data-main-nav]');
    if (mobileToggle && mainNav) {
      mobileToggle.addEventListener('click', () => {
        const open = mainNav.classList.toggle('is-open');
        mobileToggle.setAttribute('aria-expanded', String(open));
        mobileToggle.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
        renderIcons();
      });
    }

    document.querySelectorAll('[data-password-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const input = document.getElementById(button.dataset.passwordToggle);
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
        button.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
        button.innerHTML = input.type === 'password' ? '<i data-lucide="eye"></i>' : '<i data-lucide="eye-off"></i>';
        renderIcons();
      });
    });

    const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
    const sidebar = document.querySelector('[data-dashboard-sidebar]');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        const open = sidebar.classList.toggle('is-open');
        sidebarToggle.setAttribute('aria-expanded', String(open));
      });
    }

    document.querySelectorAll('[data-demo-form]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const status = form.querySelector('[data-form-status]');
        if (status) status.textContent = 'Template interaction only — connect a backend/auth provider before production use.';
      });
    });

    document.querySelectorAll('[data-demo-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const status = document.querySelector('[data-dashboard-status]');
        if (status) status.textContent = button.dataset.demoAction + ' — connect this action to your backend to enable it.';
      });
    });

    // Accessible scroll reveals for every page.
    const revealItems = document.querySelectorAll('[data-reveal], .reveal');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    document.querySelectorAll('[data-current-year]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
    renderIcons();
  });
})();

/* KnightAura — reliable card reveal animation */
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(
    ".ka-card, .ka-program-card, .ka-path-card, .ka-feature-card, .ka-tournament-card, .ka-coach-card"
  );

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cards.forEach((card) => card.classList.add("ka-revealed"));
    return;
  }

  if (!("IntersectionObserver" in window)) {
    cards.forEach((card) => card.classList.add("ka-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("ka-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: "0px 0px 0px 0px"
    }
  );

  cards.forEach((card, index) => {
    card.style.transitionDelay = `${(index % 3) * 120}ms`;
    observer.observe(card);
  });
});

const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("ka-revealed");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px"
  }
);

/* KnightAura Home 2: reveal sections while scrolling */
document.addEventListener("DOMContentLoaded", () => {
  const homeTwo = document.querySelector("body.page-home-2");

  if (!homeTwo) return;

  const revealItems = document.querySelectorAll(
    "[data-reveal], .ka-reveal"
  );

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
});

/* KnightAura Home 2 — reveal animations */
document.addEventListener("DOMContentLoaded", () => {
    const homeTwo = document.querySelector("body.page-home-2");
    if (!homeTwo) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const revealItems = homeTwo.querySelectorAll(`
        .ka2-section-heading,
        .ka2-review-card,
        .ka2-eyebrow,
        .ka2-section img,
        .ka2-section picture,
        .ka2-section h2,
        .ka2-section p,
        .ka2-section button,
        .ka2-section .ka2-container > *
    `);

    if (!("IntersectionObserver" in window)) {
        revealItems.forEach(item => item.classList.add("is-visible"));
        return;
    }

    revealItems.forEach((item, index) => {
        item.classList.add("ka-reveal");

        if (item.matches(".ka2-review-card")) {
            item.style.setProperty(
                "--reveal-delay",
                `${(index % 3) * 140}ms`
            );
        }

        if (item.matches("img, picture")) {
            item.classList.add("ka-reveal-right");
        } else if (index % 2 === 0) {
            item.classList.add("ka-reveal-left");
        } else {
            item.classList.add("ka-reveal-up");
        }
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
    });

    revealItems.forEach(item => revealObserver.observe(item));
});
// KnightAura About Page

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });
}

const currentYear = document.getElementById("currentYear");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}


/* ==========================================
   KNIGHTAURA ABOUT PAGE — ANIMATION CONTROLLER
========================================== */

(() => {
    const initAboutAnimations = () => {
        const about = document.querySelector(".ka-about-new");

        if (!about) return;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const revealGroups = [
            {
                selector: ".an-story-images, .an-skills-visual, .an-coaching-image",
                className: "an-reveal-left"
            },
            {
                selector: ".an-copy, .an-skills-copy, .an-coaching-copy",
                className: "an-reveal-right"
            },
            {
                selector: ".an-purpose .an-heading, .an-learning .an-heading, .an-coaching > .an-heading",
                className: "an-reveal-up"
            },
            {
                selector: ".an-purpose-card, .an-learning-card",
                className: "an-reveal-scale"
            },
            {
                selector: ".an-final-image",
                className: "an-reveal-left"
            },
            {
                selector: ".an-final-copy",
                className: "an-reveal-right"
            }
        ];

        const elements = [];

        revealGroups.forEach((group) => {
            about.querySelectorAll(group.selector).forEach((element) => {
                if (elements.some((item) => item.element === element)) {
                    return;
                }

                elements.push({
                    element,
                    className: group.className
                });
            });
        });

        /* Show everything immediately for reduced-motion users
           or browsers without IntersectionObserver. */
        if (
            reducedMotion ||
            !("IntersectionObserver" in window)
        ) {
            elements.forEach(({ element }) => {
                element.classList.add("an-in-view");
            });

            return;
        }

        elements.forEach(({ element, className }, index) => {
            element.classList.add("an-reveal", className);

            if (element.matches(".an-purpose-card, .an-learning-card")) {
                element.style.setProperty(
                    "--an-reveal-delay",
                    `${(index % 4) * 100}ms`
                );
            }
        });

        /* Enable hidden initial states only after setup succeeds. */
        about.classList.add("an-motion-ready");

        const observer = new IntersectionObserver(
            (entries, activeObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("an-in-view");
                    activeObserver.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        elements.forEach(({ element }) => {
            observer.observe(element);
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initAboutAnimations,
            { once: true }
        );
    } else {
        initAboutAnimations();
    }
})();

/* KNIGHTAURA PROGRAMS PAGE ANIMATIONS */
document.addEventListener("DOMContentLoaded", function () {
  const page = document.querySelector("body.page-programs");

  if (!page) return;

  const main = document.querySelector("main");

  if (!main) return;

  const elements = main.querySelectorAll("[data-reveal]");

  if (!elements.length) return;

  // Respect the user's motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  // Add animation classes to existing HTML elements
  elements.forEach(function (element, index) {
    if (element.classList.contains("hero-visual")) {
      element.classList.add("ka-reveal-right");
    } else if (
      element.classList.contains("program-card") ||
      element.classList.contains("level-card") ||
      element.classList.contains("format-card")
    ) {
      element.classList.add(
        index % 2 === 0 ? "ka-reveal-left" : "ka-reveal-right"
      );
    } else {
      element.classList.add("ka-reveal-up");
    }
  });

  // IMPORTANT: CSS expects this class on a child/container of body
  main.classList.add("ka-motion-ready");

  // Show elements when they enter the screen
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries, currentObserver) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -25px 0px"
      }
    );

    elements.forEach(function (element, index) {
      element.style.transitionDelay = (index % 3) * 100 + "ms";
      observer.observe(element);
    });
  } else {
    elements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  }
});
/* =====================================================
   KNIGHTAURA TOURNAMENTS — DIRECTIONAL SCROLL REVEALS
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector("body.page-tournaments");
  if (!page) return;

  const main = page.querySelector("main");
  if (!main) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const hero = main.querySelector(".ka-tourney-hero");

  // Hero has its own entrance animations in CSS.
  // Reveal the remaining page content from its natural direction.
  const groups = [
    {
      selector: ".ka-intro-image, .ka-format-image, .ka-event-feature-image, .ka-trophy-showcase, .ka-student-photo",
      className: "ka-motion-right"
    },
    {
      selector: ".ka-intro-copy, .ka-prep-copy, .ka-faq-intro, .ka-final-copy",
      className: "ka-motion-left"
    },
    {
      selector: ".ka-section-top, .ka-achievements-heading, .ka-event-feature-copy",
      className: "ka-motion-up"
    },
    {
      selector: ".ka-format-card, .ka-event-mini, .ka-prep-step, .ka-achievement-item, .ka-stat-item, .ka-faq-item",
      className: "ka-motion-scale"
    },
    {
      selector: ".ka-event-mini-grid, .ka-prep-steps, .ka-faq-list, .ka-achievements-stats",
      className: "ka-motion-up"
    }
  ];

  const assigned = new Set();
  const items = [];

  groups.forEach(({ selector, className }) => {
    main.querySelectorAll(selector).forEach((element) => {
      if (element.closest(".ka-tourney-hero")) return;
      if (assigned.has(element)) return;

      assigned.add(element);
      items.push({ element, className });
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach(({ element }) => {
      element.classList.add("ka-motion-visible");
    });
    return;
  }

  // Start hidden only after the animation setup is ready.
  items.forEach(({ element, className }, index) => {
    element.classList.add("ka-motion-hidden", className);
    element.style.transitionDelay = `${(index % 4) * 90}ms`;
  });

  const observer = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("ka-motion-visible");
        activeObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  items.forEach(({ element }) => observer.observe(element));

  // Give hero trust icons a staggered entrance.
  if (hero) {
    hero.querySelectorAll(".ka-tourney-trust > span").forEach((item, index) => {
      item.style.animationDelay = `${700 + index * 160}ms`;
      item.style.animation = "kaHeroTextEntrance 800ms ease both";
    });
  }
});
// ============================================
// KNIGHTAURA — LOGIN & SIGNUP FORM HANDLERS
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  // ============================================
// PASSWORD VISIBILITY — LOGIN & SIGNUP
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    // Avoid duplicate event listeners
    if (button.dataset.passwordBound === "true") return;
    button.dataset.passwordBound = "true";

    button.addEventListener("click", (event) => {
      event.preventDefault();

      const inputId = button.getAttribute("data-password-toggle");
      const passwordInput = document.getElementById(inputId);

      if (!passwordInput) {
        console.error("Password input not found:", inputId);
        return;
      }

      // Toggle password visibility
      const showPassword = passwordInput.type === "password";
      passwordInput.type = showPassword ? "text" : "password";

      // Update the eye icon
      const icon = button.querySelector("[data-lucide]");

      if (icon) {
        icon.setAttribute(
          "data-lucide",
          showPassword ? "eye-off" : "eye"
        );
      } else {
        button.innerHTML = showPassword
          ? '<i data-lucide="eye-off"></i>'
          : '<i data-lucide="eye"></i>';
      }

      button.setAttribute(
        "aria-label",
        showPassword ? "Hide password" : "Show password"
      );

      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  });
});

  // 2. Login form validation
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = document.getElementById("loginEmail")?.value.trim();
      const password = document.getElementById("loginPassword")?.value;
      const status = document.getElementById("loginStatus");

      if (!email || !password) {
        if (status) {
          status.textContent = "Please enter your email and password.";
        }
        return;
      }

      if (status) {
        status.textContent =
          "Your form is valid. Authentication backend is required to sign in.";
      }
    });
  }


  // 3. Signup form validation
  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("signupName")?.value.trim();
      const email = document.getElementById("signupEmail")?.value.trim();
      const level = document.getElementById("signupLevel")?.value;
      const password = document.getElementById("signupPassword")?.value;
      const confirmPassword =
        document.getElementById("confirmPassword")?.value;
      const terms = document.getElementById("acceptTerms");
      const status = document.getElementById("signupStatus");

      if (
        !name ||
        !email ||
        !level ||
        !password ||
        !confirmPassword
      ) {
        if (status) status.textContent = "Please complete all fields.";
        return;
      }

      if (password.length < 6) {
        if (status) {
          status.textContent = "Password must contain at least 6 characters.";
        }
        return;
      }

      if (password !== confirmPassword) {
        if (status) status.textContent = "Passwords do not match.";
        return;
      }

      if (!terms?.checked) {
        if (status) {
          status.textContent = "Please accept the Terms and Privacy Policy.";
        }
        return;
      }

      if (status) {
        status.textContent =
          "Your form is valid. An account-creation backend is required to register.";
      }
    });
  }


  // 4. Forgot password
  const forgotPassword = document.getElementById("forgotPassword");

  if (forgotPassword) {
    forgotPassword.addEventListener("click", (event) => {
      event.preventDefault();

      const status = document.getElementById("loginStatus");

      if (status) {
        status.textContent =
          "Connect password reset to your authentication service.";
      }
    });
  }


  // 5. Google and Apple sign-in placeholders
  document.querySelectorAll("[data-social-login]").forEach((button) => {
    button.addEventListener("click", () => {
      const provider = button.dataset.socialLogin;
      const status = document.getElementById("loginStatus");

      if (status) {
        status.textContent =
          provider + " sign-in needs authentication provider setup.";
      }
    });
  });

});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");

  if (!form) return;

  const status = form.querySelector("[data-contact-status]");
  const submitButton = form.querySelector('button[type="submit"]');
  const messageField = document.getElementById("contact-message");
  const characterCount = document.getElementById("contact-character-count");

  // Message character counter
  function updateCharacterCount() {
    if (messageField && characterCount) {
      characterCount.textContent =
        `${messageField.value.length} / 2000`;
    }
  }

  if (messageField) {
    messageField.addEventListener("input", updateCharacterCount);
    updateCharacterCount();
  }

  // Show thank-you message after valid form submission
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (status) {
      status.textContent =
        "Thank you! Your enquiry has been submitted successfully. Our team will get in touch with you soon.";
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.querySelector("span").textContent = "Enquiry Submitted";
    }

    form.reset();
    updateCharacterCount();

    if (status) {
      status.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  });
});
/* KNIGHTAURA CONTACT PAGE — COMPLETE ANIMATION FIX */
(() => {
  function initContactAnimations() {
    const page = document.querySelector("body.page-contact");
    if (!page) return;

    const main = page.querySelector("main");
    if (!main) return;

    const selectors = [
      ".contact-hero-content > *",
      ".contact-hero-bottom",
      ".contact-intro-heading",
      ".contact-intro-copy",
      ".contact-info-card",
      ".ka-contact-v2__heading",
      ".ka-contact-v2__details",
      ".ka-contact-v2__form-card",
      ".contact-location-copy",
      ".ka-location-map",
      ".ka-faq-new__header",
      ".ka-faq-new__card",
      ".contact-final-cta-copy",
      ".contact-final-cta-actions"
    ].join(",");

    const items = [...main.querySelectorAll(selectors)];

    items.forEach((element, index) => {
      if (element.dataset.contactAnimated) return;

      element.dataset.contactAnimated = "true";
      element.classList.add("ka-contact-reveal");

      const direction = index % 3;

      element.classList.add(
        direction === 0 ? "from-left" :
        direction === 1 ? "from-bottom" :
        "from-right"
      );

      element.style.setProperty(
        "--contact-delay",
        `${(index % 4) * 100}ms`
      );
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("contact-in-view"));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("contact-in-view");
        obs.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -25px 0px"
    });

    items.forEach(item => observer.observe(item));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContactAnimations);
  } else {
    initContactAnimations();
  }
})();
/* KNIGHTAURA CONTACT PAGE — CARD & TIMELINE REVEAL */
(() => {
  function initContactReveal() {
    if (!document.body.classList.contains("page-contact")) return;

    const selectors = [
      ".contact-info-card",
      ".ka-faq-new__card",
      ".ka-contact-v2__detail",
      ".ka-contact-v2__form-card",
      ".ka-contact-v2__details > *",
      ".contact-intro-grid > *",
      ".contact-location-section > *",
      ".timeline-item",
      ".timeline-card",
      ".timeline-step",
      ".timeline li",
      ".timeline > *"
    ].join(",");

    const elements = document.querySelectorAll(selectors);

    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("contact-animated"));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("contact-animated");
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -30px 0px"
    });

    elements.forEach((el, index) => {
      el.style.setProperty("--reveal-delay", `${(index % 3) * 120}ms`);
      observer.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContactReveal);
  } else {
    initContactReveal();
  }
})();
/* ============================================
   KNIGHT AURA - STUDENT DASHBOARD
   Dashboard-specific functionality
============================================ */

document.addEventListener("DOMContentLoaded", function () {
    const dashboard = document.querySelector(".dashboard-page");
    if (!dashboard) return;

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const menuToggle = document.getElementById("menuToggle");
    const themeToggle = document.getElementById("themeToggle");
    const directionToggle = document.getElementById("directionToggle");
 // DASHBOARD RTL TOGGLE
const rtlButton = document.querySelector("[data-rtl-toggle]");

if (dashboard && rtlButton && !rtlButton.dataset.dashboardRtlBound) {
    rtlButton.dataset.dashboardRtlBound = "true";

    rtlButton.addEventListener("click", function () {
        const nextDirection =
            dashboard.getAttribute("dir") === "rtl" ? "ltr" : "rtl";

        document.documentElement.setAttribute("dir", nextDirection);
        document.body.setAttribute("dir", nextDirection);
        dashboard.setAttribute("dir", nextDirection);

        try {
            localStorage.setItem("knight-aura-dir", nextDirection);
        } catch (error) {
            console.warn("Could not save direction:", error);
        }

        rtlButton.setAttribute(
            "aria-pressed",
            String(nextDirection === "rtl")
        );

        rtlButton.setAttribute(
            "aria-label",
            nextDirection === "rtl"
                ? "Switch to left-to-right layout"
                : "Switch to right-to-left layout"
        );

        rtlButton.setAttribute(
            "title",
            nextDirection === "rtl" ? "Switch to LTR" : "Switch to RTL"
        );
    });
}
    const notificationToggle = document.getElementById("notificationToggle");
    const notificationPanel = document.getElementById("notificationPanel");
    const accountToggle = document.getElementById("accountToggle");
    const accountPanel = document.getElementById("accountPanel");

    const breadcrumbTitle = document.getElementById("breadcrumbTitle");
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    const titles = {
    overview: "Overview",
    enrollment: "Batch Enrollment",
    schedule: "Class Schedule",
    tournaments: "Tournament Registration",
    progress: "My Progress",
    payments: "Fees & Payments",
    profile: "Student Profile",
    settings: "Settings",
    learning: "My Learning"
};

    const selectedPrograms = new Set();
    const selectedEvents = new Set();
    let toastTimer;

    /* TOAST */

    function showToast(message) {
        if (!toast || !toastMessage) return;

        clearTimeout(toastTimer);
        toastMessage.textContent = message;
        toast.hidden = false;

        requestAnimationFrame(() => toast.classList.add("show"));

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => { toast.hidden = true; }, 250);
        }, 3200);
    }

    /* NAVIGATION */

    function closeSidebar() {
        sidebar?.classList.remove("open");
        overlay?.classList.remove("show");

        menuToggle?.setAttribute("aria-expanded", "false");

        if (menuToggle) {
            menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    }

    function closeDropdowns() {
        if (notificationPanel) notificationPanel.hidden = true;
        if (accountPanel) accountPanel.hidden = true;

        notificationToggle?.setAttribute("aria-expanded", "false");
        accountToggle?.setAttribute("aria-expanded", "false");
    }

    function setView(viewName) {
        if (!titles[viewName]) return;

        const target = document.getElementById(viewName);
        if (!target || !target.classList.contains("dashboard-view")) return;

        document.querySelectorAll(".dashboard-view").forEach(view => {
            const active = view.id === viewName;
            view.hidden = !active;
            view.classList.toggle("active", active);
        });

        document.querySelectorAll(".sidebar .nav-link[data-view]").forEach(button => {
            const active = button.dataset.view === viewName;
            button.classList.toggle("active", active);

            if (active) button.setAttribute("aria-current", "page");
            else button.removeAttribute("aria-current");
        });

        if (breadcrumbTitle) breadcrumbTitle.textContent = titles[viewName];

        closeDropdowns();
        closeSidebar();

        document.querySelector(".dashboard-content")?.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    dashboard.querySelectorAll("[data-view]").forEach(button => {
        button.addEventListener("click", function () {
            setView(button.dataset.view);
        });
    });

    dashboard.querySelectorAll("[data-open-view]").forEach(button => {
        button.addEventListener("click", function () {
            setView(button.dataset.openView);
        });
    });

    /* MOBILE SIDEBAR */

    menuToggle?.addEventListener("click", function () {
        const isOpen = sidebar?.classList.contains("open");

        if (isOpen) {
            closeSidebar();
        } else {
            sidebar?.classList.add("open");
            overlay?.classList.add("show");
            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        }
    });

    overlay?.addEventListener("click", closeSidebar);

    /* THEME: MOON / SUN */

    function applyTheme(theme) {
        const dark = theme === "dark";
        dashboard.classList.toggle("dark-mode", dark);

        if (themeToggle) {
            themeToggle.innerHTML = dark
                ? '<i class="fa-regular fa-sun"></i>'
                : '<i class="fa-regular fa-moon"></i>';

            themeToggle.setAttribute(
                "aria-label",
                dark ? "Switch to light mode" : "Switch to dark mode"
            );
            themeToggle.setAttribute("aria-pressed", String(dark));
        }

        try {
            localStorage.setItem("knight-aura-theme", theme);
        } catch (error) {}
    }

    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem("knight-aura-theme") || "light";
    } catch (error) {}

    applyTheme(savedTheme);

    themeToggle?.addEventListener("click", function () {
        applyTheme(
            dashboard.classList.contains("dark-mode") ? "light" : "dark"
        );
    });

    /* RTL / LTR: ARROW ICON */

    function applyDirection(direction) {
    const value = direction === "rtl" ? "rtl" : "ltr";

    document.documentElement.setAttribute("dir", value);
    document.body.setAttribute("dir", value);
    dashboard.setAttribute("dir", value);

    document.body.classList.toggle("rtl-mode", value === "rtl");

    try {
        localStorage.setItem("knight-aura-dir", value);
    } catch (error) {
        console.warn("Could not save layout direction:", error);
    }
}

let savedDirection = "ltr";

try {
    savedDirection =
        localStorage.getItem("knight-aura-dir") || "ltr";
} catch (error) {
    console.warn("Could not restore layout direction:", error);
}

applyDirection(savedDirection);
    /* HEADER DROPDOWNS */

    function toggleDropdown(button, panel, otherPanel, otherButton) {
        if (!button || !panel) return;

        const open = panel.hidden;

        if (otherPanel) otherPanel.hidden = true;
        otherButton?.setAttribute("aria-expanded", "false");

        panel.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
    }

    notificationToggle?.addEventListener("click", function (event) {
        event.stopPropagation();

        toggleDropdown(
            notificationToggle,
            notificationPanel,
            accountPanel,
            accountToggle
        );
    });

    accountToggle?.addEventListener("click", function (event) {
        event.stopPropagation();

        toggleDropdown(
            accountToggle,
            accountPanel,
            notificationPanel,
            notificationToggle
        );
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".header-dropdown")) closeDropdowns();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeDropdowns();
            closeSidebar();
        }
    });

    /* STUDENT PROFILE DETAILS */

    const student = {
        name: "Aarav Sharma",
        role: "Student",
        academy: "Knight Aura Chess Academy",
        interest: "Chess strategy and tactics"
    };

    ["sidebarName", "headerName"].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = student.name;
    });

    ["sidebarAvatar", "headerAvatar"].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = student.name.charAt(0);
    });

    /* DATE AND YEAR */

    const dateElement = document.getElementById("currentDate");
    const yearElement = document.getElementById("currentYear");

    if (dateElement) {
        dateElement.textContent = new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date());
    }

    if (yearElement) yearElement.textContent = new Date().getFullYear();

    /* BATCH ENROLLMENT INTERACTION */

    dashboard.querySelectorAll("[data-enroll]").forEach(button => {
        button.addEventListener("click", function () {
            const program = button.dataset.enroll;

            if (selectedPrograms.has(program)) {
                showToast("You have already selected the " + program + ".");
                return;
            }

            selectedPrograms.add(program);
            button.textContent = "Selected";
            button.disabled = true;
            button.setAttribute("aria-pressed", "true");

            showToast(
                program + " selected. Contact the academy to complete your enrollment."
            );
        });
    });

    /* TOURNAMENT INTEREST */

    dashboard.querySelectorAll("[data-tournament]").forEach(button => {
        button.addEventListener("click", function () {
            const eventName = button.dataset.tournament;

            if (selectedEvents.has(eventName)) {
                showToast("Your interest is already marked for " + eventName + ".");
                return;
            }

            selectedEvents.add(eventName);
            button.textContent = "Interest Selected";
            button.disabled = true;
            button.setAttribute("aria-pressed", "true");

            showToast(
                "Interest noted for " + eventName + ". Contact the academy for registration details."
            );
        });
    });

    /* SETTINGS SHORTCUTS */

    dashboard.querySelectorAll("[data-setting]").forEach(button => {
        button.addEventListener("click", function () {
            if (button.dataset.setting === "theme") {
                themeToggle?.click();
            }

            if (button.dataset.setting === "direction") {
                directionToggle?.click();
            }
        });
    });

    dashboard.querySelector("[data-open-notifications]")?.addEventListener("click", function () {
        setView("overview");
        closeDropdowns();

        notificationPanel.hidden = false;
        notificationToggle?.setAttribute("aria-expanded", "true");
        notificationPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    /* LOGOUT */

    function logout() {
        const confirmed = window.confirm("Would you like to leave the student portal?");

        if (confirmed) {
            window.location.href = "index.html";
        }
    }

    document.getElementById("logoutButton")?.addEventListener("click", logout);

    document.getElementById("accountLogout")?.addEventListener("click", function () {
        closeDropdowns();
        logout();
    });

    /* INITIAL VIEW */

    setView("overview");
});
/* ABOUT PAGE — DISABLE TEXT HOVER FORMATTING ONLY */

document.addEventListener("DOMContentLoaded", () => {
    const about = document.querySelector(".ka-about-new");
    if (!about) return;

    const textSelectors = [
        "h1", "h2", "h3", "h4", "p",
        "span", "strong", "em", "small", "li",
        ".an-label", ".an-heading", ".an-link",
        ".an-card-bottom",
        ".an-hero-copy",
        ".an-hero-copy h1",
        ".an-hero-copy p",
        ".an-hero-copy .an-label",
        ".an-hero-copy .an-link"
    ].join(",");

    about.querySelectorAll(textSelectors).forEach((element) => {
        element.addEventListener("mouseenter", () => {
            element.style.setProperty("transform", "none", "important");
            element.style.setProperty("text-shadow", "none", "important");
            element.style.setProperty("letter-spacing", "inherit", "important");
        });
    });
});

/* =========================================
   KNIGHT AURA — COMING SOON PAGE
========================================= */

(() => {
    const page = document.querySelector(".coming-soon-page");
    if (!page) return;

    const root = document.documentElement;
    const themeToggle = document.getElementById("themeToggle");
    const themeSymbol = document.getElementById("themeSymbol");
    const directionToggle = document.getElementById("directionToggle");

    // Theme toggle
    if (themeToggle && themeSymbol) {
        let savedTheme = "light";

        try {
            savedTheme = localStorage.getItem("knightAuraTheme") || "light";
        } catch (error) {
            // Continue with the default theme.
        }

        root.setAttribute("data-theme", savedTheme);
        themeSymbol.textContent = savedTheme === "dark" ? "☀" : "☾";

        themeToggle.addEventListener("click", () => {
            const nextTheme =
                root.getAttribute("data-theme") === "dark" ? "light" : "dark";

            root.setAttribute("data-theme", nextTheme);
            themeSymbol.textContent = nextTheme === "dark" ? "☀" : "☾";

            try {
                localStorage.setItem("knightAuraTheme", nextTheme);
            } catch (error) {
                // Theme switching still works without storage.
            }
        });
    }

    // RTL / LTR toggle
    if (directionToggle) {
        directionToggle.addEventListener("click", () => {
            const nextDirection =
                root.getAttribute("dir") === "rtl" ? "ltr" : "rtl";

            root.setAttribute("dir", nextDirection);
            root.classList.toggle("rtl-mode", nextDirection === "rtl");
        });
    }

    // Countdown: example launch date is 30 days from page setup.
    // Replace this with your actual launch date when decided.
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30);

    const countdownMessage = document.getElementById("countdownMessage");

    function updateCountdown() {
        const difference = launchDate.getTime() - Date.now();

        if (difference <= 0) {
            ["days", "hours", "minutes", "seconds"].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = "00";
            });

            if (countdownMessage) {
                countdownMessage.textContent = "The next move starts now.";
            }
            return;
        }

        const values = {
            days: Math.floor(difference / 86400000),
            hours: Math.floor((difference % 86400000) / 3600000),
            minutes: Math.floor((difference % 3600000) / 60000),
            seconds: Math.floor((difference % 60000) / 1000)
        };

        Object.entries(values).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = String(value).padStart(2, "0");
            }
        });
    }

    if (
        document.getElementById("days") &&
        document.getElementById("hours") &&
        document.getElementById("minutes") &&
        document.getElementById("seconds")
    ) {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // Footer year
    const currentYear = document.getElementById("currentYear");
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Email form — frontend validation only.
    // Connect an email service/backend to actually collect addresses.
    const notifyForm = document.getElementById("notifyForm");

    if (notifyForm) {
        notifyForm.addEventListener("submit", event => {
            event.preventDefault();

            const emailInput = document.getElementById("notifyEmail");
            const formMessage = document.getElementById("formMessage");

            if (!emailInput || !emailInput.checkValidity()) {
                if (emailInput) emailInput.reportValidity();
                return;
            }

            if (formMessage) {
                formMessage.textContent =
                    "Your email is valid. Email notifications need to be connected to a service.";
                formMessage.classList.add("is-visible");
            }
        });
    }
})();
