// assets/js/site.js
// Lightweight helper to fetch JSON data and render it into pages.
// - Finds elements with data-source attribute and injects accessible markup
// - Handles news, gallery, announcements, and press collections
// - Graceful fallbacks and error handling

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
    items.slice(0, 6).forEach(item => {
      const article = el('article', { class: 'card' });
      const h3 = el('h3', {}, [el('a', { href: item.url || '#', html: item.title })]);
      const meta = el('div', { class: 'meta' }, formatDateISO(item.date || ''));
      const p = el('p', {}, item.excerpt || (item.content ? item.content.substring(0, 200) + '…' : ''));
      article.appendChild(h3);
      article.appendChild(meta);
      article.appendChild(p);
      container.appendChild(article);
    });
  }

  function renderGallery(container, items) {
    container.innerHTML = '';
    if (!items || items.length === 0) {
      container.appendChild(el('div', { class: 'placeholder' }, 'No gallery items.'));
      return;
    }
    items.slice(0, 12).forEach(img => {
      const a = el('a', { href: img.url || img.src || '#', class: 'gallery-item' });
      const image = el('img', { src: img.src || '', alt: img.alt || img.title || 'Gallery image', loading: 'lazy' });
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
    items.slice(0, 10).forEach(a => {
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

  async function hydrateElement(elm) {
    const src = elm.getAttribute('data-source');
    if (!src) return;
    try {
      const data = await fetchJSON(src);
      // Detect type by container id or data-type attribute
      const type = elm.getAttribute('data-type') || elm.id || '';
      if (elm.id && elm.id.toLowerCase().includes('news')) renderNews(elm, data);
      else if (elm.id && elm.id.toLowerCase().includes('gallery')) renderGallery(elm, data);
      else if (elm.id && elm.id.toLowerCase().includes('announce')) renderAnnouncements(elm, data);
      else if (elm.id && elm.id.toLowerCase().includes('press')) renderPress(elm, data);
      else {
        // Generic render: list titles
        elm.innerHTML = '';
        if (Array.isArray(data)) {
          data.forEach(it => {
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

    // small nav toggle behaviour (re-run for other pages)
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
