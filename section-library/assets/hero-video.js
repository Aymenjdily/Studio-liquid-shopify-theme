/**
 * Section Library — <hero-video> web component
 *
 * A Studio-style slideshow where any slide can carry a video:
 *  - Scroll-snap track driven by prev/next buttons and dots.
 *  - Autoplay rotation (data-speed seconds) with a pause/play toggle; it also
 *    pauses while the pointer or focus is inside, and never runs for visitors
 *    who prefer reduced motion.
 *  - Slide videos live in <template>s and hydrate only when their slide is
 *    current and the section is near the viewport. The poster image stays
 *    visible until playback actually starts, so there is never a black flash.
 */
class HeroVideo extends HTMLElement {
  static reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  constructor() {
    super();
    this.track = this.querySelector('.hero-video__track');
    this.slides = Array.from(this.querySelectorAll('.hero-video__slide'));
    this.dots = Array.from(this.querySelectorAll('.hero-video__dot'));
    this.prevButton = this.querySelector('.hero-video__button--prev');
    this.nextButton = this.querySelector('.hero-video__button--next');
    this.autoplayButton = this.querySelector('.hero-video__autoplay');

    this.current = 0;
    this.inView = false;
    this.timer = null;
    this.userPaused = false;
    this.hovered = false;
    this.focused = false;
    this.wantsAutoplay = this.dataset.autoplay === 'true' && !HeroVideo.reducedMotion();
    this.speed = Math.max(Number(this.dataset.speed) || 5, 1) * 1000;
  }

  connectedCallback() {
    if (!this.track) return;

    this.prevButton?.addEventListener('click', () => this.goTo(this.current - 1));
    this.nextButton?.addEventListener('click', () => this.goTo(this.current + 1));
    this.dots.forEach((dot, index) => dot.addEventListener('click', () => this.goTo(index)));
    this.autoplayButton?.addEventListener('click', () => this.toggleAutoplay());

    if (!this.wantsAutoplay && this.autoplayButton) this.autoplayButton.hidden = true;

    this.addEventListener('mouseenter', () => this.setHold('hovered', true));
    this.addEventListener('mouseleave', () => this.setHold('hovered', false));
    this.addEventListener('focusin', () => this.setHold('focused', true));
    this.addEventListener('focusout', (event) => {
      if (!this.contains(event.relatedTarget)) this.setHold('focused', false);
    });

    // Track the current slide from scroll position (covers swipes too).
    this.onScroll = () => {
      cancelAnimationFrame(this.scrollFrame);
      this.scrollFrame = requestAnimationFrame(() => {
        const index = Math.round(this.track.scrollLeft / this.track.clientWidth);
        if (index !== this.current) this.setCurrent(index);
      });
    };
    this.track.addEventListener('scroll', this.onScroll, { passive: true });

    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.inView = entry.isIntersecting;
        if (this.inView) this.hydrate(this.slides[this.current]);
        this.syncAutoplay();
        this.syncVideos();
      },
      { rootMargin: '200px 0px' }
    );
    this.observer.observe(this);

    // Theme editor: show the selected block and hold rotation while editing it.
    this.onBlockSelect = (event) => {
      const index = this.slides.indexOf(event.target);
      if (index === -1) return;
      this.editorHold = true;
      this.goTo(index, 'auto');
      this.syncAutoplay();
    };
    this.onBlockDeselect = () => {
      this.editorHold = false;
      this.syncAutoplay();
    };
    document.addEventListener('shopify:block:select', this.onBlockSelect);
    document.addEventListener('shopify:block:deselect', this.onBlockDeselect);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.stopTimer();
    document.removeEventListener('shopify:block:select', this.onBlockSelect);
    document.removeEventListener('shopify:block:deselect', this.onBlockDeselect);
  }

  /* ---------- Navigation ---------- */

  goTo(index, behavior) {
    const count = this.slides.length;
    if (count < 2) return;
    const target = (index + count) % count;
    this.track.scrollTo({ left: target * this.track.clientWidth, behavior: behavior || undefined });
    this.setCurrent(target);
    this.restartTimer();
  }

  setCurrent(index) {
    this.current = index;
    this.dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    this.slides.forEach((slide, i) => {
      // Off-screen slides stay out of the tab order and accessibility tree.
      slide.toggleAttribute('inert', i !== index);
    });
    if (this.inView) this.hydrate(this.slides[index]);
    this.syncVideos();
  }

  /* ---------- Autoplay ---------- */

  setHold(key, value) {
    this[key] = value;
    this.syncAutoplay();
  }

  toggleAutoplay() {
    this.userPaused = !this.userPaused;
    const paused = this.userPaused;
    this.autoplayButton.classList.toggle('is-paused', paused);
    this.autoplayButton.setAttribute(
      'aria-label',
      paused ? this.autoplayButton.dataset.labelPlay : this.autoplayButton.dataset.labelPause
    );
    // WCAG 2.2.2: the same control stops slide rotation and video motion.
    this.syncAutoplay();
    this.syncVideos();
  }

  syncAutoplay() {
    const shouldRun =
      this.wantsAutoplay &&
      this.slides.length > 1 &&
      this.inView &&
      !this.userPaused &&
      !this.hovered &&
      !this.focused &&
      !this.editorHold;

    // Pause the rotation without the track's aria-live announcing every tick.
    this.track.setAttribute('aria-live', shouldRun ? 'off' : 'polite');

    if (shouldRun && !this.timer) this.startTimer();
    if (!shouldRun) this.stopTimer();
  }

  startTimer() {
    this.timer = setInterval(() => this.goTo(this.current + 1), this.speed);
  }

  stopTimer() {
    clearInterval(this.timer);
    this.timer = null;
  }

  restartTimer() {
    if (!this.timer) return;
    this.stopTimer();
    this.startTimer();
  }

  /* ---------- Video ---------- */

  hydrate(slide) {
    if (!slide || !this.wantsAutoplay || slide.hasAttribute('data-hydrated')) return;
    const template = slide.querySelector('template.hero-video__template');
    const media = template?.content.firstElementChild?.cloneNode(true);
    if (!media) return;

    slide.setAttribute('data-hydrated', '');
    // Append first so the browser fetches; the poster stays on top until ready.
    slide.appendChild(media);

    if (media.tagName === 'VIDEO') {
      // Muted inline playback is required for mobile autoplay.
      media.muted = true;
      media.playsInline = true;
      media.loop = true;
      media.controls = false;
      media.addEventListener('error', () => media.remove(), { once: true });
      media.addEventListener('playing', () => slide.setAttribute('data-played', ''), { once: true });
      this.syncVideos();
    } else {
      media.addEventListener('load', () => slide.setAttribute('data-played', ''), { once: true });
    }
  }

  syncVideos() {
    this.slides.forEach((slide, i) => {
      const video = slide.querySelector('video');
      if (!video) return;
      const play = i === this.current && this.inView && !this.userPaused;
      if (play) {
        // Autoplay blocked or load failed: drop the video, keep the poster.
        video.play()?.catch((error) => {
          if (error.name === 'AbortError') return; // interrupted by pause(), not a failure
          video.remove();
          slide.removeAttribute('data-played');
        });
      } else {
        video.pause();
      }
    });
  }
}

if (!customElements.get('hero-video')) {
  customElements.define('hero-video', HeroVideo);
}
