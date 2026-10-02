/**
 * Section Library — <collection-tabs> web component
 *
 *  - WAI-ARIA tabs: arrow keys / Home / End move between tabs and activate
 *    them (automatic activation), roving tabindex.
 *  - Inactive panels ship inside <template>; their markup (and images) is
 *    only instantiated the first time the tab is opened.
 *  - Deep-linkable: ?tab=<handle> selects a tab on load and is kept in the
 *    URL (replaceState, no history spam) when the visitor switches tabs.
 *  - Below 990px the active grid is a swipe row; the pager mirrors Studio's
 *    "‹ 1/2 ›" counter and is driven by scroll position.
 */
class CollectionTabs extends HTMLElement {
  static PARAM = 'tab';

  constructor() {
    super();
    this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
    this.panels = Array.from(this.querySelectorAll('.collection-tabs__panel'));
  }

  connectedCallback() {
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => this.select(index, { updateUrl: true }));
      tab.addEventListener('keydown', (event) => this.onKeydown(event, index));
    });

    const fromUrl = this.indexFromUrl();
    if (fromUrl > 0) this.select(fromUrl, { updateUrl: false });
    else this.setupPager(this.panels[0]);

    // Theme editor: selecting a tab block shows that tab.
    this.onBlockSelect = (event) => {
      const index = this.tabs.indexOf(event.target);
      if (index !== -1) this.select(index, { updateUrl: false });
    };
    document.addEventListener('shopify:block:select', this.onBlockSelect);
  }

  disconnectedCallback() {
    document.removeEventListener('shopify:block:select', this.onBlockSelect);
    this.pagerCleanup?.();
  }

  indexFromUrl() {
    if (!this.tabs.length) return -1;
    const wanted = new URLSearchParams(window.location.search).get(CollectionTabs.PARAM);
    return wanted ? this.tabs.findIndex((tab) => tab.dataset.tab === wanted) : -1;
  }

  onKeydown(event, index) {
    const last = this.tabs.length - 1;
    const keys = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    this.select(keys[event.key], { updateUrl: true });
    this.tabs[keys[event.key]].focus();
  }

  select(index, { updateUrl }) {
    const panel = this.panels[index];
    if (!panel) return;

    this.tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    this.render(panel);
    this.panels.forEach((p, i) => (p.hidden = i !== index));
    this.setupPager(panel);

    if (updateUrl && this.tabs[index]) {
      const url = new URL(window.location.href);
      if (index === 0) url.searchParams.delete(CollectionTabs.PARAM);
      else url.searchParams.set(CollectionTabs.PARAM, this.tabs[index].dataset.tab);
      window.history.replaceState(window.history.state, '', url);
    }
  }

  /** Instantiate a lazily-shipped panel the first time it is shown. */
  render(panel) {
    const template = panel.querySelector(':scope > template.collection-tabs__template');
    if (!template) return;
    panel.replaceChildren(template.content.cloneNode(true));
  }

  /* ---------- Mobile pager ---------- */

  setupPager(panel) {
    this.pagerCleanup?.();
    const grid = panel?.querySelector('.collection-tabs__grid');
    const pager = panel?.querySelector('.collection-tabs__pager');
    if (!grid || !pager) return;

    const items = Array.from(grid.children);
    const [prev, next] = pager.querySelectorAll('.collection-tabs__pager-button');
    const current = pager.querySelector('.collection-tabs__counter-current');
    const total = pager.querySelector('.collection-tabs__counter-total');

    const step = () => {
      if (items.length < 2) return grid.clientWidth;
      return items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
    };

    const update = () => {
      const scrollable = grid.scrollWidth > grid.clientWidth + 1;
      pager.hidden = !scrollable;
      if (!scrollable) return;
      const s = step();
      const visible = Math.max(Math.floor((grid.clientWidth + 1) / s), 1);
      const pages = Math.max(items.length - visible + 1, 1);
      const page = Math.min(Math.round(grid.scrollLeft / s) + 1, pages);
      current.textContent = page;
      total.textContent = pages;
      prev.disabled = page <= 1;
      next.disabled = page >= pages;
    };

    const onClick = (event) => {
      const direction = Number(event.currentTarget.dataset.step);
      grid.scrollBy({ left: direction * step() });
    };

    let frame;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    prev.addEventListener('click', onClick);
    next.addEventListener('click', onClick);
    grid.addEventListener('scroll', onScroll, { passive: true });
    const resizeObserver = new ResizeObserver(onScroll);
    resizeObserver.observe(grid);
    update();

    this.pagerCleanup = () => {
      prev.removeEventListener('click', onClick);
      next.removeEventListener('click', onClick);
      grid.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
    };
  }
}

if (!customElements.get('collection-tabs')) {
  customElements.define('collection-tabs', CollectionTabs);
}
