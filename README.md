# Tech Paradise Hub website (agency-style variant)

Open `index.html` in a browser. No build step is needed. Host the whole folder on GitHub Pages.

## Edit these before you publish

1. **`js/site-data.js`**: contact details (WhatsApp, phone, email, Instagram, Facebook), the EmailJS keys, the three student numbers (trained, enrolled, enrolling), mentors and testimonials. Contact details are real; stats, mentors and testimonials are still samples. The mentor sections on the home and about pages are currently commented out (replaced by an Internships section), so the mentor data is not shown.
2. **Contact form (EmailJS)**: paste your real `serviceId`, `templateId` and `publicKey` into `SITE.emailjs` in `js/site-data.js`. The forms call the EmailJS REST API (`https://api.emailjs.com/api/v1.0/email/send`) with these template params: `name`, `email`, `phone`, `subject` (the chosen course), `message`, `time` (IST). The email template is stored in the EmailJS dashboard (Email Templates > Contact Us).
   - In the EmailJS dashboard, restrict the account to your live domain (Account > Security, allowed origins). Do not switch on the template's reCAPTCHA option unless a reCAPTCHA widget is also added to the forms, otherwise every send will be rejected. The browser-side rate limit (3 messages per 10 minutes, 30 s gap, 5 per session) can be bypassed, so the dashboard settings are the real protection.
3. **`pricing.html`**: crash course prices are real. Career courses and one-month programs show "Fees on request"; add real fees if you want to publish them.
4. **`contact.html`**: office hours (sample) and, if you want one, a street address.
5. **Domain**: the site uses `https://www.techparadisehub.in` in its link-preview (og:image) and search-engine (JSON-LD) tags. If you serve it from a different address, update those URLs.
6. **`privacy.html`**: have it reviewed for your business.

Do not publish invented student numbers or testimonials. Use real ones only.

## Pages

index, courses, crash-courses, pricing, stories (testimonials and numbers), about (with internships), faq, contact, privacy, 404.
