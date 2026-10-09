const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function setupGallery() {
  const timers = [];
  const element = (attributes, classes = []) => {
    const classNames = new Set(classes);
    const listeners = new Map();
    return {
      hidden: false,
      style: {},
      getAttribute: (name) => attributes[name],
      setAttribute: (name, value) => { attributes[name] = value; },
      classList: {
        contains: (name) => classNames.has(name),
        add: (name) => classNames.add(name),
        remove: (name) => classNames.delete(name),
        toggle: (name, enabled) => enabled ? classNames.add(name) : classNames.delete(name),
      },
      addEventListener: (name, callback) => listeners.set(name, callback),
      click: () => listeners.get('click')(),
    };
  };
  const categories = ['gel', 'biab', 'nail-art', 'acrylic', 'acrylic', 'pedicure', 'nail-art', 'gel'];
  const buttons = ['all', 'gel', 'biab', 'acrylic', 'nail-art', 'pedicure'].map((filter) =>
    element({ 'data-filter': filter }, filter === 'all' ? ['active'] : [])
  );
  const items = categories.map((category) => element({ 'data-category': category }));
  const querySelectorAll = (selector) => selector === '.filter-btn' ? buttons : items;
  const gallery = { querySelectorAll };
  const context = {
    document: {
      addEventListener() {},
      getElementById: (id) => id === 'gallery' ? gallery : null,
      querySelectorAll,
    },
    setTimeout: (callback, delay) => timers.push({ callback, delay }),
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(join(__dirname, '..', 'script.js'), 'utf8'), context);
  vm.runInContext('initGalleryFilter()', context);
  return {
    buttons,
    click: (filter) => buttons.find((button) => button.getAttribute('data-filter') === filter).click(),
    visibleCategories: () => items.filter((item) => !item.hidden && item.style.display !== 'none')
      .map((item) => item.getAttribute('data-category')),
    flushTimers: () => timers.splice(0).sort((a, b) => a.delay - b.delay)
      .forEach(({ callback }) => callback()),
  };
}

test('rapid category changes cannot hide images from the latest selection', () => {
  const gallery = setupGallery();
  gallery.click('gel');
  gallery.click('all');
  gallery.flushTimers();
  assert.equal(gallery.visibleCategories().length, 8);

  for (const category of ['biab', 'acrylic', 'pedicure', 'gel', 'nail-art']) {
    gallery.click(category);
  }
  gallery.flushTimers();
  assert.deepEqual(gallery.visibleCategories(), ['nail-art', 'nail-art']);
});

test('each filter updates immediately and exposes only one selected button', () => {
  const gallery = setupGallery();
  const expectedCounts = { all: 8, gel: 2, biab: 1, acrylic: 2, 'nail-art': 2, pedicure: 1 };
  for (const [filter, count] of Object.entries(expectedCounts)) {
    gallery.click(filter);
    assert.equal(gallery.visibleCategories().length, count);
    if (filter !== 'all') assert.ok(gallery.visibleCategories().every((category) => category === filter));
    assert.equal(gallery.buttons.filter((button) => button.classList.contains('active')).length, 1);
    assert.equal(gallery.buttons.filter((button) => button.getAttribute('aria-pressed') === 'true').length, 1);
  }
});
