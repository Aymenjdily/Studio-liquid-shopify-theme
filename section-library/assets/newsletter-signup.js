/**
 * Section Library — <newsletter-signup> web component
 *
 * Progressive enhancement over Shopify's {% form 'customer' %}:
 *  - Without JS the form posts normally and Liquid renders the result.
 *  - With JS it validates locally, posts with fetch and shows the outcome in
 *    the aria-live message without reloading the page.
 *  - Honeypot: a filled "website" field is treated as a bot and silently
 *    "succeeds" without sending anything.
 *  - If Shopify answers with its bot challenge (hCaptcha) the form falls back
 *    to a normal submit so the visitor can complete it.
 */
class NewsletterSignup extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.input = this.form?.querySelector('input[type="email"]');
    this.consent = this.form?.querySelector('input[name="consent"]');
    this.trap = this.form?.querySelector('input[name="website"]');
    this.message = this.form?.querySelector('.newsletter-signup__message');
    if (!this.form || !this.input || !this.message) return;

    this.onSubmit = this.onSubmit.bind(this);
    this.form.addEventListener('submit', this.onSubmit);
    this.input.addEventListener('input', () => {
      if (this.dataset.state === 'error') this.setState('idle', '');
    });
  }

  disconnectedCallback() {
    this.form?.removeEventListener('submit', this.onSubmit);
  }

  async onSubmit(event) {
    event.preventDefault();
    if (this.dataset.state === 'loading') return;

    if (this.trap && this.trap.value) {
      this.setState('success', this.dataset.messageSuccess);
      return;
    }
    if (!this.input.value.trim() || !this.input.checkValidity()) {
      this.setState('error', this.dataset.messageError, this.input);
      return;
    }
    if (this.consent && !this.consent.checked) {
      this.setState('error', this.dataset.messageConsent, this.consent);
      return;
    }

    this.setState('loading', '');
    try {
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: new FormData(this.form),
        headers: { Accept: 'text/html' },
      });
      const url = new URL(response.url);

      if (url.pathname.startsWith('/challenge')) {
        // Shopify wants a captcha: hand over to a regular navigation.
        this.form.removeEventListener('submit', this.onSubmit);
        this.form.submit();
        return;
      }

      if (url.searchParams.get('customer_posted') === 'true') {
        this.form.reset();
        this.setState('success', this.dataset.messageSuccess);
        return;
      }

      // Shopify re-rendered the page with errors: surface its message.
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      const serverMessage = html
        .querySelector(`#${CSS.escape(this.message.id)}`)
        ?.textContent.trim();
      this.setState('error', serverMessage || this.dataset.messageError, this.input);
    } catch (error) {
      // Offline or blocked: let the browser try a normal post.
      this.form.removeEventListener('submit', this.onSubmit);
      this.form.submit();
    }
  }

  setState(state, text, focusTarget) {
    this.dataset.state = state;
    this.message.textContent = text;
    this.message.classList.toggle('newsletter-signup__message--success', state === 'success');
    this.message.classList.toggle('newsletter-signup__message--error', state === 'error');
    this.input.toggleAttribute('aria-invalid', state === 'error' && focusTarget === this.input);
    if (focusTarget) focusTarget.focus();
  }
}

if (!customElements.get('newsletter-signup')) {
  customElements.define('newsletter-signup', NewsletterSignup);
}
