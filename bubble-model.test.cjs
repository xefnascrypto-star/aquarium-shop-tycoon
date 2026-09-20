const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Mock browser environment for characters.js and visitors.js unit tests
const window = {
  crypto: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 65535);
      return arr;
    }
  },
  matchMedia: () => ({ matches: false }),
  ShopIdentity: {
    mark: () => '<svg></svg>',
    colors: { sage: '#7e9a86', ocean: '#5a8296', terracotta: '#c27d60', plum: '#8b6b80', gold: '#c99e58' },
    current: { color: 'sage' }
  }
};

const document = {
  createElementNS: (ns, tag) => {
    const el = {
      tagName: tag,
      classList: new Set(),
      dataset: {},
      attributes: {},
      children: [],
      style: {},
      setAttribute(k, v) { this.attributes[k] = String(v); },
      getAttribute(k) { return this.attributes[k]; },
      querySelector(sel) {
        if (sel === '.visitor-bubble') {
          return this.children.find(c => c.classList.has('visitor-bubble')) || null;
        }
        if (sel === '.visitor-bubble text') {
          const b = this.querySelector('.visitor-bubble');
          return b ? b.children.find(c => c.tagName === 'text') : null;
        }
        if (sel === 'rect') {
          return this.children.find(c => c.tagName === 'rect') || null;
        }
        if (sel === 'text') {
          return this.children.find(c => c.tagName === 'text') || null;
        }
        if (sel === '.character-body' || sel === '.left-leg' || sel === '.right-leg' || sel === '.character-head' || sel === '.character-arm' || sel === '.purchase-bag') {
          return { setAttribute() {}, style: {} };
        }
        return null;
      },
      querySelectorAll() { return []; },
      remove() {}
    };
    el.classList.add = (c) => el.classList.add(c);
    el.classList.contains = (c) => el.classList.has(c);
    el.classList.remove = (c) => el.classList.delete(c);
    return el;
  }
};

// Evaluate characters.js in context
const codeCharacters = fs.readFileSync('characters.js', 'utf8');
const context = { window, document, crypto: window.crypto, matchMedia: window.matchMedia, console };
vm.createContext(context);
vm.runInContext(codeCharacters, context);

const ShopCharacters = context.window.ShopCharacters;
assert.ok(ShopCharacters, 'ShopCharacters must be defined');

// Test 1: Bubble adaptive sizing for short icons vs text
// Build a minimal node representing the visitor SVG
const classSet = new Set(['live-visitor']);
const node = {
  classList: {
    add: (c) => classSet.add(c),
    contains: (c) => classSet.has(c),
    remove: (c) => classSet.delete(c)
  },
  dataset: {},
  attributes: {},
  style: {},
  setAttribute(k, v) { this.attributes[k] = String(v); },
  querySelector(sel) {
    if (sel === '.character-body' || sel === '.left-leg' || sel === '.right-leg' || sel === '.character-head' || sel === '.character-arm' || sel === '.purchase-bag') {
      return { setAttribute() {}, style: {} };
    }
    if (sel === '.visitor-bubble') return this.bubbleEl;
    return null;
  }
};
const rectEl = {
  attributes: {},
  setAttribute(k, v) { this.attributes[k] = String(v); }
};
const textEl = {
  attributes: {},
  textContent: '',
  setAttribute(k, v) { this.attributes[k] = String(v); }
};
const bubbleEl = {
  attributes: {},
  style: {},
  setAttribute(k, v) { this.attributes[k] = String(v); },
  querySelector(sel) {
    if (sel === 'rect') return rectEl;
    if (sel === 'text') return textEl;
    return null;
  }
};
node.bubbleEl = bubbleEl;

// Test compact icon: '🐟'
ShopCharacters.update(node, {
  feet: { x: 10, y: 20 },
  phase: 'browsing',
  moving: false,
  distance: 0,
  facing: 1,
  bubble: '🐟',
  label: 'Test Visitor',
  result: 'pending'
});

assert.equal(bubbleEl.style.display, '');
assert.equal(textEl.textContent, '🐟');
assert.equal(rectEl.attributes['width'], '32', 'Short icon bubble should have compact width 32');
assert.equal(bubbleEl.attributes['transform'], 'translate(-16 -117)', 'Short icon bubble should be centered at -16');

// Test waiting icon: '⏳'
ShopCharacters.update(node, {
  feet: { x: 10, y: 20 },
  phase: 'service-queue',
  moving: false,
  distance: 0,
  facing: 1,
  bubble: '⏳',
  label: 'Test Waiting',
  result: 'pending'
});
assert.equal(textEl.textContent, '⏳');
assert.equal(rectEl.attributes['width'], '32');

// Test dissatisfaction reaction: '✕📦'
ShopCharacters.update(node, {
  feet: { x: 10, y: 20 },
  phase: 'turning',
  moving: false,
  distance: 0,
  facing: 1,
  bubble: '✕📦',
  label: 'Test Dissatisfaction',
  result: 'empty'
});
assert.equal(textEl.textContent, '✕📦');
assert.equal(rectEl.attributes['width'], '32');

// Test longer text
ShopCharacters.update(node, {
  feet: { x: 10, y: 20 },
  phase: 'entering',
  moving: false,
  distance: 0,
  facing: 1,
  bubble: '¡Hola!',
  label: 'Test Hello',
  result: 'pending'
});
assert.equal(textEl.textContent, '¡Hola!');
assert.equal(rectEl.attributes['width'], '110', 'Longer text bubble should have standard width 110');

// Test worker node does not have width overridden
node.classList.add('live-worker');
rectEl.attributes['width'] = '26';
ShopCharacters.update(node, {
  feet: { x: 10, y: 20 },
  phase: 'checkout',
  moving: false,
  distance: 0,
  facing: 1,
  bubble: '✓',
  label: 'Staff Clerk',
  result: 'pending'
});
assert.equal(rectEl.attributes['width'], '26', 'Staff worker bubble width should be preserved');

console.log('PASS: Visitor thought bubbles, compact width calculation, worker bubble immunity, and reaction indicators.');
