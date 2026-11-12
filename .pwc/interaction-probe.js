/* Inject after the candidate bundle. Results are written to #interaction-results. */
(async () => {
  const results = [];
  const pause = () => new Promise(resolve => setTimeout(resolve, 120));
  const wait = async (test, timeout = 10000) => {
    const start = Date.now();
    while (!test()) {
      if (Date.now() - start > timeout) throw new Error('Candidate did not become ready');
      await pause();
    }
  };
  const check = async (name, action) => {
    try {
      const detail = await action();
      results.push({ name, pass: true, detail: detail ?? '' });
    } catch (error) {
      results.push({ name, pass: false, detail: String(error?.message || error) });
    }
  };
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const visible = element => !!element && getComputedStyle(element).display !== 'none' && getComputedStyle(element).visibility !== 'hidden' && element.getClientRects().length > 0;
  const click = async (element) => { assert(element, 'control missing'); element.click(); await pause(); };
  const one = selector => document.querySelector(selector);
  try {
    await wait(() => document.querySelector('#candidate-ready') || one('#root .header'));

    await check('menu opens and closes', async () => {
      await click(one('.menu-trigger'));
      assert(visible(one('[data-pwc-controlled="nav-menu"]')), 'menu panel did not become visible');
      if (one('.drawer-primary button')) {
        await click(one('.drawer-primary button'));
        assert(one('.drawer-submenu')?.textContent.includes('Produk'), 'Produk submenu did not open');
        await click(one('.drawer-back'));
        assert(visible(one('.drawer-primary')), 'submenu did not return to main drawer');
      }
      await click(one('.close-mega'));
      assert(!visible(one('[data-pwc-controlled="nav-menu"]')), 'menu panel did not close');
    });

    await check('search opens and accepts input', async () => {
      const mobileTrigger = one('.mobile-search-trigger');
      if (visible(mobileTrigger)) {
        await click(mobileTrigger);
      } else {
        const field = one('.header > .searchbox input');
        assert(visible(field), 'visible search input missing');
        field.focus(); await pause();
      }
      assert(one('.search-pop'), 'search popover did not open');
      const active = one('.search-pop input');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(active, 'BILLY');
      active.dispatchEvent(new Event('input', { bubbles: true }));
      await pause();
      assert(one('.search-pop')?.textContent.includes('BILLY'), 'query results did not update');
      await click(one('.search-pop button'));
      assert(!one('.search-pop'), 'search popover did not close');
    });

    if (one('.home-hero')) {
      await check('home banner next and previous', async () => {
        const image = one('.home-hero img');
        const initial = image?.getAttribute('src');
        assert(initial, 'hero image missing');
        await click(one('[data-pwc-interaction="home-banner-next"]'));
        assert(image.getAttribute('src') !== initial, 'next did not change hero image');
        await click(one('[data-pwc-interaction="home-banner-prev"]'));
        assert(image.getAttribute('src') === initial, 'previous did not restore hero image');
      });
      await check('home category and room tabs', async () => {
        const rail = one('.category-rail');
        const initial = rail?.textContent;
        assert(initial, 'category rail missing');
        await click(one('[data-pwc-interaction="home-room-tab"]'));
        assert(rail.textContent !== initial, 'room tab did not change rail');
        await click(one('[data-pwc-interaction="home-category-tab"]'));
        assert(rail.textContent === initial, 'category tab did not restore rail');
      });
      await check('all six favorite videos open and close with local sources', async () => {
        const cards = [...document.querySelectorAll('.favorite-card')];
        assert(cards.length === 6, `expected 6 favorite cards, found ${cards.length}`);
        for (const [index, card] of cards.entries()) {
          const button = card.querySelector('button');
          await click(button);
          const video = card.querySelector('.favorite-video-player');
          assert(video, `favorite video ${index + 1} did not open`);
          const authoredSource = video.dataset.pwcLocalSrc || video.getAttribute('src');
          assert(authoredSource?.startsWith('/assets/BestSeller_'), `favorite video ${index + 1} is not locally authored`);
          await click(button);
          assert(!card.querySelector('.favorite-video-player'), `favorite video ${index + 1} did not close`);
        }
      });
      await check('ALPTALL campaign video is available', async () => {
        const video = one('.himalaya video');
        assert(video, 'ALPTALL campaign video missing');
        assert(video.getAttribute('src')?.includes('28092026_ALPTALL_ALL.mp4'), 'ALPTALL local video source missing');
      });
    }

    if (one('.faq-page')) {
      await check('FAQ topic navigation reaches matching section', async () => {
        const anchor = one('.faq-topic-nav a');
        assert(anchor, 'FAQ topic link missing');
        const hash = anchor.getAttribute('href');
        assert(hash?.startsWith('#faq-topic-'), 'FAQ topic link lacks section hash');
        assert(document.querySelector(hash), 'FAQ topic target missing');
        await click(anchor);
        assert(location.hash === hash, 'FAQ topic did not update hash');
      });
      await check('FAQ answer opens and closes', async () => {
        const button = one('[data-pwc-interaction="faq-question-0-0"]');
        assert(button, 'first FAQ question missing');
        await click(button);
        assert(button.getAttribute('aria-expanded') === 'true', 'answer did not expand');
        assert(one('[data-pwc-controlled="faq-question-0-0"]'), 'answer content missing');
        await click(button);
        assert(button.getAttribute('aria-expanded') === 'false', 'answer did not collapse');
      });
    }

    if (one('.stores-page')) {
      await check('all pickup cities render locations', async () => {
        const select = one('#city');
        const locations = one('.pickup-locations');
        assert(select && locations, 'pickup selector missing');
        const options = [...select.options].map(option => option.value);
        assert(options.length === 14, `expected 14 pickup cities, found ${options.length}`);
        const outputs = new Set();
        for (const city of options) {
          select.value = city;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          await pause();
          assert(locations.querySelector('article'), `pickup location absent for ${city}`);
          outputs.add(locations.textContent.trim());
        }
        assert(outputs.size >= 10, `only ${outputs.size} distinct city result sets`);
      });
    }

    if (one('.product')) {
      if (one('.product .fav')) {
        await check('product favorite toggles', async () => {
          const favorite = one('.product .fav');
          const initial = favorite.getAttribute('aria-pressed');
          await click(favorite);
          assert(favorite.getAttribute('aria-pressed') !== initial, 'favorite state did not change');
        });
      } else {
        results.push({ name: 'product favorite toggles', pass: null, detail: 'skipped: source Home recommender cards do not show a favorite control' });
      }
      await check('product cart toggles', async () => {
        const cart = one('.product .product-info button[aria-pressed]');
        assert(cart, 'add to cart button missing');
        const initial = cart.getAttribute('aria-pressed');
        await click(cart);
        assert(cart.getAttribute('aria-pressed') !== initial, 'cart state did not change');
      });
    }

    if (one('.best-page')) {
      await check('Best direct #all fragment keeps page at banner', async () => {
        assert(!one('#all'), 'legacy #all anchor incorrectly jumps into catalog');
        location.hash = 'pwc-probe';
        window.scrollTo(0, 0);
        location.hash = 'all';
        await pause();
        assert(window.scrollY < 5, `#all fragment scrolled to ${window.scrollY}`);
        assert(one('.best-banner')?.getAttribute('href') === '#best-catalog', 'banner CTA lacks catalog target');
        assert(one('#best-catalog'), 'banner CTA catalog target missing');
      });
      if (one('.editorial-billy button')) {
        await check('BILLY editorial carousel scrolls', async () => {
          const rail = one('.billy-rail');
          const next = one('.billy-controls button[aria-label="Gambar BILLY berikutnya"]');
          assert(rail && next, 'BILLY carousel rail or next control missing');
          const initial = rail.scrollLeft;
          await click(next);
          await new Promise(resolve => setTimeout(resolve, 500));
          assert(rail.scrollLeft > initial + 10, 'BILLY carousel did not scroll');
        });
      } else {
        results.push({ name: 'BILLY editorial carousel', pass: null, detail: 'skipped: no authored carousel control' });
      }
      await check('Best category filter changes product grid', async () => {
        const grid = one('.best-grid');
        const initial = grid?.querySelectorAll('.best-product').length;
        assert(initial > 0, 'Best product grid empty');
        const tab = [...document.querySelectorAll('.best-filters button')].find(x => x.textContent.includes('Ruang kerja'));
        await click(tab);
        const filtered = grid.querySelectorAll('.best-product').length;
        assert(tab.getAttribute('aria-pressed') === 'true', 'filter not selected');
        assert(filtered > 0 && filtered < initial, 'filter did not narrow product grid');
      });
      await check('Best cart toggles', async () => {
        const button = one('.best-product button');
        assert(button, 'Best product cart button missing');
        const initial = button.getAttribute('aria-pressed');
        await click(button);
        assert(button.getAttribute('aria-pressed') !== initial, 'Best cart state did not change');
      });
    }

    await check('cookie consent dismisses banner', async () => {
      const banner = one('.cookie-banner');
      assert(banner, 'cookie banner missing');
      await click(banner.querySelector('button'));
      assert(!one('.cookie-banner'), 'cookie banner remained visible');
    });
  } catch (error) {
    results.push({ name: 'probe setup', pass: false, detail: String(error?.message || error) });
  } finally {
    const report = document.createElement('script');
    report.id = 'interaction-results';
    report.type = 'application/json';
    report.textContent = JSON.stringify({ path: location.pathname, results });
    document.body.appendChild(report);
    document.documentElement.dataset.interactionsReady = 'true';
  }
})();
