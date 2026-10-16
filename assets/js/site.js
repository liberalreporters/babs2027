// assets/js/site.js
// Lightweight helper to fetch JSON data and render it into pages.
// - Finds elements with data-source attribute and injects accessible markup
// - Handles news, gallery, announcements, press collections
// - Supports news detail pages and simple pagination

(function () {
  'use strict';

  // Utility: fetch JSON with timeout
  async function fetchJSON(url, timeout = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { signal: controller.signal, cache: 'no-cache' });
      clearTimeout(id);
      if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
      return await res.json();
    } catch (err) {
      clearTimeout(id);
      console.error('fetchJSON', url, err);
      throw err;
    }
  }

  function formatDateISO(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return iso; }
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else node.setAttribute(k, attrs[k]);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (!c) return;
      if (typeof c === 'string') node.appendChild(document.createTextNode(c));
      else node.appendChild(c);
    });
    return node;
  }

  function renderNews(container, items) {
    container.innerHTML = '';
    if (!items || items.length === 0) {
      container.appendChild(el('div', { class: 'placeholder' }, 'No news available.'));
      return;
    }
    items.forEach(item => {
      const article = el('article', { class: 'card' });
      const h3 = el('h3', {}, [el('a', { href: item.url || 'news-detail.html#' + item.id, html: item.title })]);
      const meta = el('div', { class: 'meta' }, formatDateISO(item.date || ''));
      const p = el('p', {}, item.excerpt || (item.content ? item.content.substring(0, 200) + '…' : ''));
      article.appendChild(h3);
      article.appendChild(meta);
      article.appendChild(p);
      container.appendChild(article);
    });
  }

  function renderNewsPaginated(container, items) {
    const perPage = parseInt(container.getAttribute('data-per-page') || 5, 10);
    const urlParams = new URLSearchParams(window.location.search);
    const page = Math.max(1, parseInt(urlParams.get('page') || '1', 10));
    const start = (page - 1) * perPage;
    const pageItems = items.slice(start, start + perPage);
    renderNews(container, pageItems);

    // pagination controls
    const totalPages = Math.ceil(items.length / perPage);
    if (totalPages > 1) {
      const pager = el('nav', { class: 'pagination', 'aria-label': 'Pagination' });
      if (page > 1) {
        const prev = el('a', { href: updateQueryStringParameter(window.location.href, 'page', page - 1), class: 'btn' }, '« Prev');
        pager.appendChild(prev);
      }
      pager.appendChild(el('span', { class: 'meta' }, ` Page ${page} of ${totalPages} `));
      if (page < totalPages) {
        const next = el('a', { href: updateQueryStringParameter(window.location.href, 'page', page + 1), class: 'btn' }, 'Next »');
        pager.appendChild(next);
      }
      container.appendChild(pager);
    }
  }

  function updateQueryStringParameter(uri, key, value) {
    const u = new URL(uri, window.location.origin);
    u.searchParams.set(key, value);
    return u.pathname + u.search;
  }

  function renderGallery(container, items) {
    container.innerHTML = '';
    if (!items || items.length === 0) {
      container.appendChild(el('div', { class: 'placeholder' }, 'No gallery items.'));
      return;
    }
    items.forEach(img => {
      const a = el('a', { href: img.url || img.src || '#', class: 'gallery-item' });
      const image = el('img', { src: img.src || img.url || img.local || '', alt: img.alt || img.title || 'Gallery image', loading: 'lazy' });
      a.appendChild(image);
      if (img.title || img.caption) {
        a.appendChild(el('span', { class: 'sr-caption' }, img.title || img.caption));
      }
      container.appendChild(a);
    });
  }

  function renderAnnouncements(container, items) {
    container.innerHTML = '';
    if (!items || items.length === 0) return container.appendChild(el('li', { class: 'placeholder' }, 'No announcements.'));
    items.forEach(a => {
      const li = el('li', {});
      const title = el('strong', {}, a.title || 'Untitled');
      const meta = el('div', { class: 'meta' }, formatDateISO(a.date || ''));
      const p = el('p', {}, a.content || '');
      li.appendChild(title);
      li.appendChild(meta);
      li.appendChild(p);
      container.appendChild(li);
    });
  }

  function renderPress(container, items) {
    container.innerHTML = '';
    if (!items || items.length === 0) return container.appendChild(el('div', { class: 'placeholder' }, 'No press items.'));
    const ul = el('ul', {});
    items.forEach(it => {
      const li = el('li', {});
      const a = el('a', { href: it.url || '#' }, it.title);
      const date = el('div', { class: 'meta' }, formatDateISO(it.date || ''));
      li.appendChild(a);
      li.appendChild(date);
      if (it.desc) li.appendChild(el('p', {}, it.desc));
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  function renderNewsDetail(container, items) {
    container.innerHTML = '';
    // find id from hash or query param
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    if (!id) {
      id = (window.location.hash || '').replace('#', '');
    }
    if (!id) {
      container.appendChild(el('div', { class: 'placeholder' }, 'No news selected.'));
      return;
    }
    const item = items.find(i => i.id === id);
    if (!item) {
      container.appendChild(el('div', { class: 'placeholder' }, 'Article not found.'));
      return;
    }
    const title = document.getElementById('nd-title');
    const meta = document.getElementById('nd-meta');
    const content = document.getElementById('nd-content');
    if (title) title.textContent = item.title;
    if (meta) meta.textContent = formatDateISO(item.date || '');
    if (content) content.innerHTML = item.content || item.excerpt || '';
  }

  async function hydrateElement(elm) {
    const src = elm.getAttribute('data-source');
    if (!src) return;
    try {
      const data = await fetchJSON(src);
      // data may be an array or an object with array in a key
      let items = data;
      if (!Array.isArray(items)) {
        // try to detect list inside object (e.g., {news: [...]})
        const keys = Object.keys(data);
        if (keys.length === 1 && Array.isArray(data[keys[0]])) items = data[keys[0]];
        else items = data;
      }

      // Detect type by container id or data-type attribute
      const id = (elm.id || '').toLowerCase();
      const dtype = (elm.getAttribute('data-type') || '').toLowerCase();

      if (id.includes('news') || dtype === 'news') {
        // if this is a detail container
        if (document.getElementById('news-detail') || id.includes('detail')) {
          renderNewsDetail(elm, items);
        } else if (elm.hasAttribute('data-per-page')) {
          renderNewsPaginated(elm, items);
        } else {
          renderNews(elm, items.slice(0, 10));
        }
      } else if (id.includes('gallery') || dtype === 'gallery') {
        renderGallery(elm, items);
      } else if (id.includes('announce') || dtype === 'announcements') {
        renderAnnouncements(elm, items);
      } else if (id.includes('press') || dtype === 'press') {
        renderPress(elm, items);
      } else {
        // Generic render: list titles
        elm.innerHTML = '';
        if (Array.isArray(items)) {
          items.forEach(it => {
            const d = el('div', { class: 'item' });
            const a = el('a', { href: it.url || '#' }, it.title || it.name || 'Item');
            d.appendChild(a);
            elm.appendChild(d);
          });
        }
      }
    } catch (err) {
      elm.innerHTML = '';
      elm.appendChild(el('div', { class: 'placeholder' }, 'Unable to load content.'));
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Hydrate all data-source elements
    const elems = document.querySelectorAll('[data-source]');
    elems.forEach(e => hydrateElement(e));

    // small nav toggle behaviour
    const btn = document.querySelector('.nav-toggle');
    if (btn) {
      const nav = document.getElementById('primary-navigation');
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        if (nav) nav.classList.toggle('open');
      });
    }
  });

})();
