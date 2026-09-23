// Visual profiles, poses, and character renderers can be replaced by 3D or sprites without changing navigation.
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.ShopCharacters = exports.ShopCharacters;
    root.ShopDepth = exports.ShopDepth;
  }
})(typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : globalThis, function() {
  'use strict';

  const appearanceOffset = (typeof crypto !== 'undefined' && crypto.getRandomValues)
    ? crypto.getRandomValues(new Uint16Array(1))[0]
    : Math.floor(Math.random() * 65535);

  const clothes = ['#d79676', '#82a59b', '#8b9fc0', '#c2a36c', '#ac86ac', '#769aab', '#b67666', '#8caa78'];
  const skins = ['#efc8a2', '#d9a77d', '#b88060', '#81563f'];
  const hairs = ['#493e38', '#82634b', '#ba915e', '#ddd2b5', '#343b42'];

  // 1. Canonical animation and behavioral states
  const STATES = Object.freeze({
    // Universal states (Customer & Staff)
    IDLE: 'idle',
    WALK: 'walk',
    LOOK: 'look',
    WAIT: 'wait',
    PICK: 'pick',
    CARRY: 'carry',
    CHECKOUT: 'checkout',
    REACT_POSITIVE: 'react_positive',
    REACT_NEGATIVE: 'react_negative',
    LEAVE: 'leave',
    // Staff-specific extension states
    FETCH: 'fetch',
    PREPARE: 'prepare',
    TRANSPORT_STOCK: 'transport_stock',
    SERVE_TILL: 'serve_till',
    RESTOCK: 'restock'
  });

  // Archetype definitions
  const ARCHETYPES = Object.freeze({
    casual: { id: 'casual', label: 'Cliente casual', scale: { x: 1, y: 1 }, young: false },
    young: { id: 'young', label: 'Cliente joven', scale: { x: 0.93, y: 0.94 }, young: true },
    elder: { id: 'elder', label: 'Cliente senior', scale: { x: 1, y: 1 }, young: false },
    staff: { id: 'staff', label: 'Personal de tienda', scale: { x: 1, y: 1 }, young: false }
  });

  /**
   * Resolves a canonical animation state from game-level movement and phase properties.
   */
  function resolveState(params, role = 'customer') {
    if (!params) return STATES.IDLE;
    if (params.animState && Object.values(STATES).includes(params.animState)) {
      return params.animState;
    }
    if (params.state && Object.values(STATES).includes(params.state)) {
      return params.state;
    }

    const isStaff = role === 'staff' || params.role === 'staff' || params.isWorker;
    const { phase, moving, result } = params;

    if (isStaff) {
      if (moving) {
        if (phase === 'to-product') return STATES.FETCH;
        if (phase === 'carrying-stock') return STATES.TRANSPORT_STOCK;
        if (phase === 'carrying-order') return STATES.CARRY;
        return STATES.WALK;
      }
      // Stationary staff
      if (phase === 'preparing-fish' || phase === 'preparing-product') return STATES.PREPARE;
      if (phase === 'collecting-stock') return STATES.PICK;
      if (phase === 'restocking') return STATES.RESTOCK;
      if (phase === 'at-counter' || phase === 'checkout') return STATES.SERVE_TILL;
      if (phase === 'blocked') return STATES.WAIT;
      if (phase === 'idle' || phase === 'returning') return STATES.IDLE;
      if (phase === 'browsing') return STATES.PREPARE;
      return STATES.IDLE;
    }

    // Customer
    if (moving) {
      if (phase === 'leaving') {
        return result === 'sale' ? STATES.CARRY : STATES.LEAVE;
      }
      return STATES.WALK;
    }

    // Stationary customer
    if (phase === 'entering') return STATES.IDLE;
    if (phase === 'to-product' || phase === 'browsing') return STATES.LOOK;
    if (phase === 'to-wait' || phase === 'service-queue' || phase === 'queue' || phase === 'to-queue') return STATES.WAIT;
    if (phase === 'to-counter' || phase === 'checkout') return STATES.CHECKOUT;
    if (phase === 'turning') {
      return (result === 'empty' || params.lost) ? STATES.REACT_NEGATIVE : STATES.LEAVE;
    }
    if (phase === 'leaving') {
      return result === 'sale' ? STATES.REACT_POSITIVE : STATES.LEAVE;
    }
    if (phase === 'waiting') return STATES.REACT_NEGATIVE;
    return STATES.IDLE;
  }

  /**
   * 2. Visual appearance profile with deterministic 28-variant legacy coverage.
   */
  function profile(id) {
    const n = Number(id) || 1;
    return {
      body: n % 3,
      hair: n % 4,
      skirt: n % 5 === 2,
      young: n % 4 === 1,
      glasses: n % 7 === 0,
      color: clothes[n % clothes.length],
      skin: skins[Math.floor(n / 2) % skins.length],
      hairColor: hairs[Math.floor(n / 3) % hairs.length]
    };
  }

  /**
   * Enriched profile builder supporting custom roles, archetypes, and accessory variations.
   */
  function createProfile(options = {}) {
    if (typeof options === 'number' || typeof options === 'string') {
      return profile(options);
    }
    const id = options.id ?? 1;
    const seed = Number.isInteger(options.seed) && options.seed >= 0 ? options.seed : Number(id) || 1;
    const base = profile(seed);
    const role = options.role || (options.isWorker || String(id).startsWith('staff-') || Number(id) >= 10000 ? 'staff' : 'customer');
    const archetype = options.archetype || (role === 'staff' ? 'staff' : base.young ? 'young' : 'casual');

    return {
      ...base,
      id,
      seed,
      role,
      archetype,
      scale: ARCHETYPES[archetype]?.scale || { x: 1, y: 1 },
      uniform: role === 'staff',
      accessories: {
        glasses: options.glasses !== undefined ? !!options.glasses : base.glasses,
        apron: role === 'staff',
        badge: role === 'staff',
        ...(options.accessories || {})
      },
      ...(options.overrides || {})
    };
  }

  // 3. Fallback SVG Artwork Generator
  function art(p) {
    const w = [13, 16, 19][p.body];
    const hair = p.hair === 0
      ? 'M-14-60Q-22-87 0-86Q20-85 14-64L7-74Q-10-68-14-60'
      : p.hair === 1
      ? 'M-14-55Q-21-88 1-86Q20-82 15-52L10-68Q-3-76-14-55'
      : p.hair === 2
      ? 'M-14-68Q-19-86-5-84Q-1-94 9-83Q20-80 14-65L6-73Z'
      : 'M-14-67Q-18-87 0-86Q18-86 15-67L8-74L-8-72Z';

    return '<ellipse cy="3" rx="19" ry="8" fill="#52776325"/>' +
      '<g class="character-leg left-leg"><path d="M-7-19L-8-3" stroke="#485965" stroke-width="8" stroke-linecap="round"/><path d="M-11-2H-4" stroke="#394c53" stroke-width="5" stroke-linecap="round"/></g>' +
      '<g class="character-leg right-leg"><path d="M7-19L8-3" stroke="#485965" stroke-width="8" stroke-linecap="round"/><path d="M5-2H12" stroke="#394c53" stroke-width="5" stroke-linecap="round"/></g>' +
      '<path d="M-' + w + '-42Q0-53 ' + w + '-42L' + (p.skirt ? w + 3 : w - 3) + '-' + (p.skirt ? 12 : 17) + 'Q0-9 -' + (p.skirt ? w + 3 : w - 3) + '-' + (p.skirt ? 12 : 17) + 'Z" fill="' + p.color + '"/>' +
      '<path d="M-6-45Q0-37 6-45" fill="none" stroke="#f5e7c9" stroke-width="2"/>' +
      '<path class="character-arm" d="M-' + w + '-39L-' + (w + 4) + '-25M' + w + '-39L' + (w + 4) + '-25" stroke="' + p.skin + '" stroke-width="7" stroke-linecap="round" fill="none"/>' +
      '<g class="character-head"><rect x="-5" y="-53" width="10" height="12" rx="3" fill="' + p.skin + '"/>' +
      '<ellipse cy="-64" rx="14" ry="17" fill="' + p.skin + '"/>' +
      '<path d="' + hair + '" fill="' + p.hairColor + '"/>' +
      '<circle cx="6" cy="-63" r="1.5" fill="#4c4e4a"/>' +
      (p.glasses ? '<path d="M0-64H12V-59H1Z" fill="none" stroke="#574e49" stroke-width="1.5"/>' : '') +
      '</g>';
  }

  // 4. Pluggable Renderers System with Built-in Isometric SVG Fallback
  const renderers = new Map();
  let activeRendererName = 'svg-isometric';

  const svgIsometricRenderer = {
    id: 'svg-isometric',
    create({ id, seed, profile: p, role }) {
      const doc = typeof document !== 'undefined' ? document : null;
      if (!doc) return null;

      const node = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
      node.classList.add(role === 'staff' ? 'live-worker' : 'live-visitor');
      node.dataset.visitorId = id;
      node.dataset.seed = seed;
      node.dataset.profile = JSON.stringify(p);
      node.dataset.role = role;
      node.dataset.archetype = p.archetype || 'casual';
      node.setAttribute('role', 'button');
      node.setAttribute('tabindex', '0');

      const markMarkup = (typeof ShopIdentity !== 'undefined' && ShopIdentity.mark)
        ? ShopIdentity.mark().replace(/^<svg[^>]*>|<\/svg>$/g, '')
        : '';

      node.innerHTML = '<g class="character-body">' +
        '<g class="character-model" transform="scale(' + (p.young ? .93 : 1) + ' ' + (p.young ? .94 : 1) + ')">' +
          art(p) +
          '<g class="purchase-bag" transform="translate(17 -28)" style="display:none">' +
            '<path d="M1 0V-5Q8-14 15-5V0" fill="none" stroke="#ad956e" stroke-width="2"/>' +
            '<path d="M-2-1H18L20 24H-3Z" fill="#f2dfb6"/>' +
            '<g><svg class="brand-badge" x="1" y="3" width="15" height="15" viewBox="0 0 64 64">' + markMarkup + '</svg></g>' +
          '</g>' +
        '</g>' +
      '</g>' +
      '<g class="visitor-bubble" transform="translate(-55 -117)"><rect width="110" height="27" rx="10"/><text x="55" y="18" text-anchor="middle"></text></g>';

      return node;
    },
    update(node, animState, pose) {
      const { feet, phase, moving, distance = 0, facing = 1, bubble, label = '', result } = pose;
      if (feet && typeof feet.x === 'number' && typeof feet.y === 'number') {
        node.setAttribute('transform', 'translate(' + feet.x + ' ' + feet.y + ')');
      }
      if (phase) node.dataset.phase = phase;
      if (result) node.dataset.result = result;
      node.dataset.animState = animState;
      if (label) node.setAttribute('aria-label', label);

      if (node.classList.contains('character-prototype-v1') || node.classList.contains('character-prototype-v2') || node.classList.contains('character-prototype-v3')) {
        node.classList.remove('character-prototype-v1', 'character-prototype-v2', 'character-prototype-v3');
        const p = profile(Number(node.dataset.seed) || 1);
        const mark = (typeof ShopIdentity !== 'undefined' && ShopIdentity.mark) ? ShopIdentity.mark() : '';
        node.innerHTML =
          '<g class="character-body"><g class="character-model">' +
          model(p, mark) +
          '<g class="purchase-bag" transform="translate(18 -26)" style="display:none">' +
          '<path d="M1 0V-6Q8-15 15-6V0" fill="none" stroke="#a17b4c" stroke-width="2.5"/>' +
          '<path d="M-3-1H19L22 25H-4Z" fill="#edd9ad" stroke="#c9ae78" stroke-width="1.2"/>' +
          '<g><svg class="brand-badge" x="2" y="4" width="14" height="14" viewBox="0 0 64 64">' + mark + '</svg></g>' +
          '</g></g></g>' +
          '<g class="visitor-bubble" transform="translate(-55 -117)"><rect width="110" height="27" rx="10"/><text x="55" y="18" text-anchor="middle"></text></g>';
      }

      const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isWalking = (animState === STATES.WALK || animState === STATES.FETCH || animState === STATES.TRANSPORT_STOCK || (moving && !reduced));
      const wave = isWalking && !reduced ? Math.sin(distance * 11) : 0;
      const mirror = facing < 0 ? -1 : 1;

      const body = node.querySelector('.character-body');
      if (body) body.setAttribute('transform', 'translate(0 ' + (wave * 1.2) + ') scale(' + mirror + ' 1)');

      const leftLeg = node.querySelector('.left-leg');
      const rightLeg = node.querySelector('.right-leg');
      if (leftLeg) leftLeg.setAttribute('transform', isWalking ? 'rotate(' + (wave * 12) + ' -7 -19)' : 'rotate(0 -7 -19)');
      if (rightLeg) rightLeg.setAttribute('transform', isWalking ? 'rotate(' + (-wave * 12) + ' 7 -19)' : 'rotate(0 7 -19)');

      const head = node.querySelector('.character-head');
      if (head) {
        if (animState === STATES.LOOK || phase === 'browsing') {
          head.setAttribute('transform', 'rotate(7 0 -49)');
        } else if (animState === STATES.CHECKOUT || animState === STATES.SERVE_TILL || phase === 'checkout') {
          head.setAttribute('transform', 'rotate(4 0 -49)');
        } else if (animState === STATES.REACT_POSITIVE) {
          head.setAttribute('transform', 'rotate(-4 0 -49)');
        } else if (animState === STATES.REACT_NEGATIVE) {
          head.setAttribute('transform', 'rotate(8 0 -49)');
        } else {
          head.setAttribute('transform', '');
        }
      }

      const arm = node.querySelector('.character-arm');
      if (arm) {
        if (animState === STATES.CHECKOUT || phase === 'checkout') {
          arm.setAttribute('transform', 'rotate(-12 0 -39)');
        } else if (animState === STATES.PICK || animState === STATES.RESTOCK) {
          arm.setAttribute('transform', 'rotate(-18 0 -39)');
        } else {
          arm.setAttribute('transform', '');
        }
      }

      const bag = node.querySelector('.purchase-bag');
      if (bag) {
        bag.style.display = (result === 'sale' || animState === STATES.CARRY || pose.carry) ? '' : 'none';
        const fishCatalog = (typeof ShopFish !== 'undefined' && ShopFish.catalog) || (typeof window !== 'undefined' && window.ShopFish && window.ShopFish.catalog); const fishBagFn = (typeof ShopFish !== 'undefined' && ShopFish.bag) || (typeof window !== 'undefined' && window.ShopFish && window.ShopFish.bag); if (result === 'sale' && pose.product && fishCatalog && fishCatalog[pose.product]) {
          const sp = pose.product;
          if (bag.dataset.species !== sp) {
            bag.dataset.species = sp;
            bag.dataset.carry = 'fish';
            bag.innerHTML = fishBagFn ? fishBagFn(sp) : '';
          }
        }
      }

      const bubbleEl = node.querySelector('.visitor-bubble');
      if (bubbleEl) {
        bubbleEl.style.display = bubble ? '' : 'none';
        const textNode = bubbleEl.querySelector('text');
        if (textNode) textNode.textContent = bubble;
        if (!node.classList.contains('live-worker')) {
          const isShort = bubble && bubble.length <= 3;
          const w = isShort ? 32 : 110;
          bubbleEl.setAttribute('transform', 'translate(' + (-w / 2) + ' -117)');
          const rectNode = bubbleEl.querySelector('rect');
          if (rectNode) rectNode.setAttribute('width', w);
          if (textNode) textNode.setAttribute('x', w / 2);
        }
      }
    },
    remove(node) {
      if (node && node.remove) node.remove();
    }
  };

  renderers.set('svg-isometric', svgIsometricRenderer);

  function registerRenderer(name, renderer) {
    if (!name || typeof renderer !== 'object' || typeof renderer.create !== 'function' || typeof renderer.update !== 'function') {
      return false;
    }
    renderers.set(name, renderer);
    return true;
  }

  function setRenderer(name) {
    if (renderers.has(name)) {
      activeRendererName = name;
      return true;
    }
    activeRendererName = 'svg-isometric';
    return false;
  }

  function getActiveRenderer() {
    return renderers.get(activeRendererName) || svgIsometricRenderer;
  }

  /**
   * 5. Modular Character Public Interface
   */
  const ShopCharacters = {
    STATES,
    ARCHETYPES,
    profile,
    createProfile,
    resolveState,
    registerRenderer,
    setRenderer,
    getRenderer: (name) => renderers.get(name),
    getActiveRendererName: () => activeRendererName,
    create({ id, seed, role, archetype, overrides } = {}) {
      const visualSeed = Number.isInteger(seed) && seed >= 0 ? seed : Number(id) + appearanceOffset;
      const charRole = role || (String(id).startsWith('staff-') || Number(id) >= 10000 ? 'staff' : 'customer');
      const p = createProfile({ id, seed: visualSeed, role: charRole, archetype, overrides });

      const renderer = getActiveRenderer();
      try {
        return renderer.create({ id, seed: visualSeed, profile: p, role: charRole });
      } catch (err) {
        return svgIsometricRenderer.create({ id, seed: visualSeed, profile: p, role: charRole });
      }
    },
    update(node, pose) {
      if (!node || !pose) return;
      const role = node.dataset.role || (node.classList.contains('live-worker') ? 'staff' : 'customer');
      const animState = resolveState(pose, role);

      const renderer = getActiveRenderer();
      try {
        renderer.update(node, animState, pose);
      } catch (err) {
        svgIsometricRenderer.update(node, animState, pose);
      }
    },
    remove(node) {
      if (!node) return;
      const renderer = getActiveRenderer();
      if (renderer && typeof renderer.remove === 'function') {
        try {
          renderer.remove(node);
          return;
        } catch (e) {}
      }
      if (node.remove) node.remove();
    }
  };

  // Pairwise floor separation, not a far-corner scalar, determines occlusion.
  const ShopDepth = {
    sort(items) {
      const edges = items.map(() => new Set());
      const indegree = items.map(() => 0);
      const behind = (a, b) => a.x + a.width <= b.x + 1e-6 || a.y + a.depth <= b.y + 1e-6;

      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = behind(items[i].bounds, items[j].bounds);
          const b = behind(items[j].bounds, items[i].bounds);
          if (a === b) continue;
          const from = a ? i : j;
          const to = a ? j : i;
          edges[from].add(to);
          indegree[to]++;
        }
      }

      const remaining = new Set(items.map((_, i) => i));
      const result = [];
      const rank = (i) => items[i].bounds.x + items[i].bounds.y + items[i].bounds.width + items[i].bounds.depth;

      while (remaining.size) {
        let ready = [...remaining].filter((i) => indegree[i] === 0);
        if (!ready.length) ready = [...remaining];
        ready.sort((a, b) => rank(a) - rank(b) || a - b);
        const i = ready[0];
        remaining.delete(i);
        result.push(items[i]);
        for (const to of edges[i]) indegree[to]--;
      }

      return result;
    }
  };

  if (typeof window !== 'undefined') {
    window.ShopCharacters = ShopCharacters;
    window.ShopDepth = ShopDepth;
  }

  return {
    ShopCharacters,
    ShopDepth
  };
});

