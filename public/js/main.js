/* ============================================================
   Marlboro Appliance Repair Pros — Main JS
   ============================================================ */

(function () {
  'use strict';

  // ─── Mobile Nav Toggle ──────────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const siteNav   = document.getElementById('siteNav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const open = siteNav.classList.toggle('open');
      navToggle.classList.toggle('active', open);
      navToggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close on link click
    siteNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        siteNav.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── FAQ Accordion ──────────────────────────────────────────
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = btn.classList.contains('active');
      // Close all
      document.querySelectorAll('.faq-question.active').forEach(b => {
        b.classList.remove('active');
        if (b.nextElementSibling) b.nextElementSibling.classList.remove('open');
      });
      if (!isOpen && answer) {
        btn.classList.add('active');
        answer.classList.add('open');
      }
    });
  });

  // ─── Lazy Loading Images ────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.addEventListener('load', () => img.classList.add('loaded'));
            img.addEventListener('error', () => {
              img.classList.add('loaded');
              img.src = img.dataset.fallback || '';
            });
          }
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
  } else {
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src || '';
      img.classList.add('loaded');
    });
  }

  // ─── Lead Form Handling ─────────────────────────────────────
  document.querySelectorAll('.lead-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;

      const btn = form.querySelector('.form-submit-btn');
      const formContainer = form.closest('.lead-form-wrap') || form.parentElement;
      const successEl = formContainer.querySelector('.form-success');
      const originalText = btn ? btn.innerHTML : '';

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<svg class="spin" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Submitting…`;
      }

      const data = {
        name:      form.querySelector('[name="name"]')?.value.trim() || '',
        phone:     form.querySelector('[name="phone"]')?.value.trim() || '',
        appliance: form.querySelector('[name="appliance"]')?.value.trim() || '',
        issue:     form.querySelector('[name="issue"]')?.value.trim() || '',
        zip:       form.querySelector('[name="zip"]')?.value.trim() || '',
        page:      window.location.pathname,
        consent:   form.querySelector('[name="consent"]')?.checked || false,
      };

      try {
        const res = await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        if (json.success) {
          if (successEl) {
            form.style.display = 'none';
            successEl.classList.add('show');
          } else {
            alert('Thank you! We will call you within 30 minutes.');
            form.reset();
          }
          // Fire GA4 event if present
          if (window.gtag) {
            window.gtag('event', 'lead_form_submit', {
              event_category: 'Lead',
              event_label: data.appliance,
              page: data.page,
            });
          }
        } else {
          console.log('Form error response:', json.errors);
          // Clear previous errors
          form.querySelectorAll('.form-error-msg').forEach(msg => msg.classList.remove('show'));
          form.querySelectorAll('[required]').forEach(f => f.classList.remove('error'));

          if (json.errors && typeof json.errors === 'object') {
            // Server returned field-level errors object
            console.log('Processing field-level errors...');
            Object.entries(json.errors).forEach(([fieldName, errorMsg]) => {
              console.log(`Field: ${fieldName}, Error: ${errorMsg}`);
              const field = form.querySelector(`[name="${fieldName}"]`);
              console.log(`Found field:`, field);
              if (field) {
                field.classList.add('error');
                const group = field.closest('.form-group');
                console.log(`Found group:`, group);
                const errorEl = group?.querySelector('.form-error-msg');
                console.log(`Found error element:`, errorEl);
                if (errorEl) {
                  errorEl.textContent = errorMsg;
                  errorEl.classList.add('show');
                  console.log(`Updated error element. Text:`, errorEl.textContent, 'Classes:', errorEl.className);
                }
              }
            });
            const firstErr = form.querySelector('.error');
            if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            alert('Something went wrong. Please call us directly.');
          }
          if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
        }
      } catch {
        alert('Network error. Please call us directly: ' + (window.__PHONE__ || ''));
        if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
      }
    });
  });

  function validateForm(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      const group = field.closest('.form-group');
      const msg   = group?.querySelector('.form-error-msg');
      const empty = !field.value.trim();
      const phoneErr = field.name === 'phone' && !/^[\d\s\(\)\-\+\.]{7,20}$/.test(field.value);
      const zipErr   = field.name === 'zip' && !/^\d{5}(-\d{4})?$/.test(field.value.trim());

      if (empty || phoneErr || zipErr) {
        field.classList.add('error');
        if (msg) msg.classList.add('show');
        valid = false;
      } else {
        field.classList.remove('error');
        if (msg) msg.classList.remove('show');
      }
    });
    // Check checkbox consent
    const consent = form.querySelector('[name="consent"]');
    if (consent && !consent.checked) {
      const msg = form.querySelector('.consent-error');
      if (msg) msg.classList.add('show');
      valid = false;
    }
    if (!valid) {
      const firstErr = form.querySelector('.error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
  }

  // ─── Smooth Scroll for anchor links ─────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ─── Spin animation ─────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite}';
  document.head.appendChild(style);

  // ─── Sticky Mobile CTA Visibility ──────────────────────────────
  // Show sticky CTA after user scrolls past hero section
  if (window.innerWidth < 768) {
    const mobileCtaBar = document.querySelector('.mobile-cta-bar');
    const pageHero = document.querySelector('.page-hero');

    if (mobileCtaBar && pageHero) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            // Hero is out of view, show sticky CTA
            mobileCtaBar.style.display = 'flex';
          } else {
            // Hero is visible, hide sticky CTA
            mobileCtaBar.style.display = 'none';
          }
        });
      }, { threshold: 0 });

      observer.observe(pageHero);
    }
  }

  // ─── Phone number injection ──────────────────────────────────
  // Replace data-phone placeholders with the real phone from config
  const phoneEls = document.querySelectorAll('[data-phone]');
  if (phoneEls.length && window.__PHONE__) {
    phoneEls.forEach(el => {
      el.textContent = window.__PHONE__;
      if (el.tagName === 'A') el.href = 'tel:' + window.__PHONE__.replace(/\D/g, '');
    });
  }
})();
