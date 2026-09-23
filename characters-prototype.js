// Character Visual Prototype V1 (Cartoon / Stylized Renderer for Aquarium Shop Tycoon)
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./characters'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const chars = require('./characters');
    module.exports = factory(chars.ShopCharacters);
  } else {
    root.ShopCharacterPrototypeV1 = factory(root.ShopCharacters);
  }
})(typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : globalThis, function(ShopCharacters) {
  'use strict';

  if (!ShopCharacters) {
    console.warn('ShopCharacters not loaded before characters-prototype.js');
    return null;
  }

  const { STATES } = ShopCharacters;

  // Custom stylized artwork for Prototype V1:
  // 1. Prototype Customer (Casual friendly cartoon shopper with oversized expressive eyes, bob haircut, stylish hoodie/sweater, warm vibrant tones)
  // 2. Prototype Employee (Energetic shop clerk with professional polo/apron, cap, brand badge, roll-up sleeves)
  function createCustomerV1Art(p) {
    // p contains { color, skin, hairColor, ... }
    const skinColor = p.skin || '#fed8b1';
    const hairColor = p.hairColor || '#5a3d28';
    const shirtColor = p.color || '#4fa3d1';
    const pantsColor = '#3a4b5c';
    const shoeColor = '#243340';

    return `
      <!-- Soft Ambient Shadow with rim -->
      <ellipse cy="3" rx="20" ry="8.5" fill="#2d4239" fill-opacity="0.22"/>
      <ellipse cy="2.5" rx="14" ry="5.5" fill="#1b2a24" fill-opacity="0.18"/>

      <!-- Legs with stylized sneakers -->
      <g class="character-leg left-leg">
        <!-- Pants leg -->
        <path d="M-8-22 L-8-6" stroke="${pantsColor}" stroke-width="7" stroke-linecap="round"/>
        <!-- Sneaker: white sole + colored shoe cap -->
        <ellipse cx="-8" cy="-3" rx="5.5" ry="3.5" fill="${shoeColor}"/>
        <path d="M-13-1 Q-8 2 -3-1" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      </g>
      <g class="character-leg right-leg">
        <path d="M8-22 L8-6" stroke="${pantsColor}" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="8" cy="-3" rx="5.5" ry="3.5" fill="${shoeColor}"/>
        <path d="M3-1 Q8 2 13-1" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Torso: Cartoon hoodie / cozy sweater with ribbing and collar -->
      <g class="character-torso">
        <!-- Body base -->
        <path d="M-13-44 C-17-38 -15-20 -12-16 C-4-14 4-14 12-16 C15-20 17-38 13-44 Z" fill="${shirtColor}"/>
        <!-- Shading fold -->
        <path d="M-11-20 Q0-16 11-20 L12-16 Q0-13 -12-16 Z" fill="#000000" fill-opacity="0.12"/>
        <!-- Hoodie drawstring & neckline -->
        <path d="M-5-44 Q0-38 5-44" fill="none" stroke="#fff8eb" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M-3-38 L-3-28 M3-38 L3-28" stroke="#fff8eb" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Front pouch pocket -->
        <path d="M-7-25 Q0-23 7-25 L6-18 Q0-16 -6-18 Z" fill="#ffffff" fill-opacity="0.22" stroke="${shirtColor}" stroke-width="0.8"/>
      </g>

      <!-- Arms: Styled cartoon arms with hands -->
      <g class="character-arms">
        <g class="character-arm arm-left">
          <!-- Sleeve -->
          <path d="M-13-42 L-18-28" stroke="${shirtColor}" stroke-width="7.5" stroke-linecap="round"/>
          <!-- Wrist cuff & Hand -->
          <circle cx="-19" cy="-25" r="4.2" fill="${skinColor}"/>
        </g>
        <g class="character-arm arm-right">
          <path d="M13-42 L18-28" stroke="${shirtColor}" stroke-width="7.5" stroke-linecap="round"/>
          <circle cx="19" cy="-25" r="4.2" fill="${skinColor}"/>
        </g>
      </g>

      <!-- Expressive Cartoon Head -->
      <g class="character-head" transform-origin="0 -52">
        <!-- Neck -->
        <rect x="-4.5" y="-53" width="9" height="11" rx="3" fill="${skinColor}"/>
        <!-- Face base: Cute rounded chubbier proportions -->
        <ellipse cx="0" cy="-66" rx="16" ry="17.5" fill="${skinColor}"/>
        
        <!-- Rosy Cheek Blushes -->
        <ellipse cx="-11" cy="-62" rx="3.5" ry="2.2" fill="#ff7d7d" fill-opacity="0.45"/>
        <ellipse cx="11" cy="-62" rx="3.5" ry="2.2" fill="#ff7d7d" fill-opacity="0.45"/>

        <!-- Large Expressive Cartoon Eyes -->
        <g class="character-eyes">
          <!-- Eye White Left & Right -->
          <ellipse cx="-6.5" cy="-67" rx="4" ry="5" fill="#ffffff"/>
          <ellipse cx="6.5" cy="-67" rx="4" ry="5" fill="#ffffff"/>
          <!-- Iris (deep ocean teal) -->
          <circle cx="-5.8" cy="-66.5" r="2.8" fill="#2b5b66"/>
          <circle cx="7.2" cy="-66.5" r="2.8" fill="#2b5b66"/>
          <!-- Pupils -->
          <circle cx="-5.5" cy="-66.5" r="1.7" fill="#15262c"/>
          <circle cx="7.5" cy="-66.5" r="1.7" fill="#15262c"/>
          <!-- Eye Highlights (Gleam / Star twinkle) -->
          <circle cx="-7" cy="-68.5" r="1.3" fill="#ffffff"/>
          <circle cx="-4.8" cy="-65" r="0.6" fill="#ffffff"/>
          <circle cx="6" cy="-68.5" r="1.3" fill="#ffffff"/>
          <circle cx="8.2" cy="-65" r="0.6" fill="#ffffff"/>
          <!-- Friendly Eyebrows -->
          <path d="M-10-74 Q-6-76 -2-73" stroke="${hairColor}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <path d="M2-73 Q6-76 10-74" stroke="${hairColor}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        </g>

        <!-- Cute Cartoon Smile / Mouth -->
        <path class="character-mouth" d="M-3.5-59 Q0-56 3.5-59" stroke="#9e4c36" stroke-width="2" stroke-linecap="round" fill="none"/>

        <!-- Volumetric Cartoon Hair (Cute side-swept bangs + bob) -->
        <g class="character-hair">
          <!-- Back hair volume -->
          <path d="M-16-68 C-20-88 0-93 16-86 C21-78 20-63 18-58 C16-65 14-72 11-74 C7-76 -7-76 -12-70 C-15-66 -16-60 -16-68 Z" fill="${hairColor}"/>
          <!-- Front Swept Bangs -->
          <path d="M-17-72 C-14-88 2-90 17-82 C14-77 9-73 5-73 C0-73 -5-76 -10-73 C-13-71 -15-68 -17-72 Z" fill="${hairColor}"/>
          <!-- Hair highlight arc -->
          <path d="M-10-85 Q0-88 10-82" stroke="#ffffff" stroke-width="1.8" stroke-opacity="0.3" stroke-linecap="round" fill="none"/>
        </g>
      </g>
    `;
  }

  function createStaffV1Art(p) {
    const skinColor = p.skin || '#d9a77d';
    const hairColor = p.hairColor || '#343b42';
    const brandColor = (typeof ShopIdentity !== 'undefined' && ShopIdentity.colors && ShopIdentity.colors[ShopIdentity.current?.color]) || '#427d6d';
    const apronColor = '#f5eedb';
    const pantsColor = '#2d3e4f';
    const shoeColor = '#1c2833';

    return `
      <!-- Soft Ambient Shadow -->
      <ellipse cy="3" rx="21" ry="9" fill="#1f382f" fill-opacity="0.25"/>
      <ellipse cy="2.5" rx="15" ry="5.8" fill="#132620" fill-opacity="0.2"/>

      <!-- Legs in sturdy work trousers -->
      <g class="character-leg left-leg">
        <path d="M-8-22 L-8-6" stroke="${pantsColor}" stroke-width="7.5" stroke-linecap="round"/>
        <ellipse cx="-8" cy="-3" rx="6" ry="3.8" fill="${shoeColor}"/>
        <path d="M-14-1 L-2-1" stroke="#485c6b" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g class="character-leg right-leg">
        <path d="M8-22 L8-6" stroke="${pantsColor}" stroke-width="7.5" stroke-linecap="round"/>
        <ellipse cx="8" cy="-3" rx="6" ry="3.8" fill="${shoeColor}"/>
        <path d="M2-1 L14-1" stroke="#485c6b" stroke-width="2" stroke-linecap="round"/>
      </g>

      <!-- Torso: Store Uniform Polo + Tycoon Utility Apron -->
      <g class="character-torso">
        <!-- Polo Base (Brand Color) -->
        <path d="M-14-44 C-17-38 -15-20 -12-16 C-4-14 4-14 12-16 C15-20 17-38 14-44 Z" fill="${brandColor}"/>
        <!-- White Polo Collar -->
        <path d="M-7-44 L0-39 L7-44 L4-46 L0-42 L-4-46 Z" fill="#ffffff"/>
        
        <!-- Utility Apron -->
        <path d="M-10-38 L10-38 L12-17 L-12-17 Z" fill="${apronColor}" stroke="#ded1b6" stroke-width="1"/>
        <!-- Apron Straps -->
        <path d="M-8-44 L-8-38 M8-44 L8-38" stroke="#ba9e72" stroke-width="2"/>
        <!-- Apron Front Utility Tool Pocket with mini water tester / scraper pen -->
        <path d="M-6-27 H6 V-19 H-6 Z" fill="#ebdfc0" stroke="#cdbe99" stroke-width="1"/>
        <line x1="-3" y1="-29" x2="-3" y2="-24" stroke="#5da9c7" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="2" y1="-30" x2="2" y2="-24" stroke="#e08b48" stroke-width="2.2" stroke-linecap="round"/>

        <!-- Staff Identity Badge -->
        <g class="staff-badge" transform="translate(4 -36) scale(0.24)">
          <rect x="-8" y="-6" width="30" height="22" rx="4" fill="#ffffff" stroke="#90a89d" stroke-width="2"/>
          <circle cx="0" cy="5" r="5" fill="${brandColor}"/>
          <rect x="8" y="1" width="12" height="3" fill="#668277" rx="1.5"/>
          <rect x="8" y="6" width="8" height="2.5" fill="#9ab0a6" rx="1"/>
        </g>
      </g>

      <!-- Arms with rolled-up work sleeves -->
      <g class="character-arms">
        <g class="character-arm arm-left">
          <!-- Upper sleeve (brand color) -->
          <path d="M-13-42 L-17-32" stroke="${brandColor}" stroke-width="7.5" stroke-linecap="round"/>
          <!-- Forearm & hand -->
          <path d="M-17-32 L-18-23" stroke="${skinColor}" stroke-width="6.5" stroke-linecap="round"/>
          <circle cx="-19" cy="-21" r="4.2" fill="${skinColor}"/>
        </g>
        <g class="character-arm arm-right">
          <path d="M13-42 L17-32" stroke="${brandColor}" stroke-width="7.5" stroke-linecap="round"/>
          <path d="M17-32 L18-23" stroke="${skinColor}" stroke-width="6.5" stroke-linecap="round"/>
          <circle cx="19" cy="-21" r="4.2" fill="${skinColor}"/>
        </g>
      </g>

      <!-- Confident & Friendly Staff Head with Visor/Cap -->
      <g class="character-head" transform-origin="0 -52">
        <!-- Neck -->
        <rect x="-5" y="-53" width="10" height="11" rx="3" fill="${skinColor}"/>
        <!-- Face Oval -->
        <ellipse cx="0" cy="-66" rx="16.5" ry="17.5" fill="${skinColor}"/>
        
        <!-- Healthy Cheeks -->
        <ellipse cx="-11" cy="-62" rx="3.2" ry="2" fill="#ff8566" fill-opacity="0.38"/>
        <ellipse cx="11" cy="-62" rx="3.2" ry="2" fill="#ff8566" fill-opacity="0.38"/>

        <!-- Cheerful Big Cartoon Eyes -->
        <g class="character-eyes">
          <ellipse cx="-6.5" cy="-66.5" rx="3.8" ry="4.8" fill="#ffffff"/>
          <ellipse cx="6.5" cy="-66.5" rx="3.8" ry="4.8" fill="#ffffff"/>
          <circle cx="-6" cy="-66" r="2.6" fill="#324f43"/>
          <circle cx="7" cy="-66" r="2.6" fill="#324f43"/>
          <circle cx="-5.8" cy="-66" r="1.6" fill="#14211c"/>
          <circle cx="7.2" cy="-66" r="1.6" fill="#14211c"/>
          <circle cx="-7" cy="-68" r="1.2" fill="#ffffff"/>
          <circle cx="6" cy="-68" r="1.2" fill="#ffffff"/>
          <!-- Active Confident Brows -->
          <path d="M-10-73 Q-6-76 -2-74" stroke="${hairColor}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
          <path d="M2-74 Q6-76 10-73" stroke="${hairColor}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        </g>

        <!-- Big Welcoming Retail Smile -->
        <path class="character-mouth" d="M-4.5-58 Q0-53 4.5-58" stroke="#8c3e29" stroke-width="2.2" stroke-linecap="round" fill="#ffffff"/>

        <!-- Staff Cap / Visor with Brand Tone -->
        <g class="character-cap">
          <!-- Back hair -->
          <path d="M-16-64 Q-18-78 -10-84 Q10-84 17-76 Q18-64 16-58" fill="${hairColor}"/>
          <!-- Cap Dome -->
          <path d="M-16-72 C-16-88 0-93 16-88 C18-80 18-72 16-70 Z" fill="${brandColor}"/>
          <!-- Cap Brim / Visor projecting forward -->
          <path d="M-16-71 Q0-78 18-69 L22-68 Q0-75 -15-70 Z" fill="#2d574c" stroke="#1f3e36" stroke-width="0.8"/>
          <!-- Mini emblem on cap -->
          <circle cx="0" cy="-79" r="3" fill="#fff5d9"/>
        </g>
      </g>
    `;
  }

  // Visual Prototype V1 Renderer Implementation
  const prototypeV1Renderer = {
    id: 'prototype-v1',
    create({ id, seed, profile: p, role }) {
      const doc = typeof document !== 'undefined' ? document : null;
      if (!doc) return null;

      const node = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
      node.classList.add(role === 'staff' ? 'live-worker' : 'live-visitor');
      node.classList.add('character-prototype-v1');
      node.dataset.visitorId = id;
      node.dataset.seed = seed;
      node.dataset.profile = JSON.stringify(p);
      node.dataset.role = role;
      node.dataset.archetype = p.archetype || (role === 'staff' ? 'staff' : 'casual');
      node.setAttribute('role', 'button');
      node.setAttribute('tabindex', '0');

      const isStaff = role === 'staff' || String(id).startsWith('staff-') || Number(id) >= 10000;
      const artMarkup = isStaff ? createStaffV1Art(p) : createCustomerV1Art(p);

      const markMarkup = (typeof ShopIdentity !== 'undefined' && ShopIdentity.mark)
        ? ShopIdentity.mark().replace(/^<svg[^>]*>|<\/svg>$/g, '')
        : '';

      node.innerHTML = `
        <g class="character-body">
          <g class="character-model">
            ${artMarkup}
            <!-- Purchase Bag (Customer checkout / carry) -->
            <g class="purchase-bag" transform="translate(18 -26)" style="display:none">
              <path d="M1 0V-6Q8-15 15-6V0" fill="none" stroke="#a17b4c" stroke-width="2.5"/>
              <path d="M-3-1H19L22 25H-4Z" fill="#edd9ad" stroke="#c9ae78" stroke-width="1.2"/>
              <g><svg class="brand-badge" x="2" y="4" width="14" height="14" viewBox="0 0 64 64">${markMarkup}</svg></g>
            </g>
          </g>
        </g>
        <!-- Interactive & Reactive Thought Bubble -->
        <g class="visitor-bubble" transform="translate(-55 -122)">
          <rect width="110" height="28" rx="11" fill="#fffdfa" stroke="#d5c19e" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
          <polygon points="51,28 55,34 59,28" fill="#fffdfa"/>
          <text x="55" y="19" text-anchor="middle" font-size="12" font-weight="bold" fill="#2d3d34"></text>
        </g>
      `;

      return node;
    },

    update(node, animState, pose) {
      const { feet, phase, moving, distance, facing, bubble, label, result } = pose;

      // Position in isometric room coordinates
      node.setAttribute('transform', 'translate(' + feet.x + ' ' + feet.y + ')');
      node.dataset.phase = phase;
      node.dataset.result = result;
      node.dataset.animState = animState;
      node.setAttribute('aria-label', label);

      const isStaff = node.classList.contains('live-worker') || node.dataset.role === 'staff';
      const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Gait & Bounce physics for stylized cartoon walk cycle
      const isWalking = (
        animState === STATES.WALK ||
        animState === STATES.FETCH ||
        animState === STATES.TRANSPORT_STOCK ||
        (moving && !reduced)
      );

      const stepFreq = isStaff ? 12 : 10.5;
      const walkCycle = isWalking && !reduced ? Math.sin(distance * stepFreq) : 0;
      const verticalHop = isWalking && !reduced ? Math.abs(Math.cos(distance * stepFreq)) * 2.2 : 0;
      const mirror = facing < 0 ? -1 : 1;

      // Root body transform: bounce + flip facing
      const body = node.querySelector('.character-body');
      if (body) {
        body.setAttribute('transform', `translate(0 ${-verticalHop}) scale(${mirror} 1)`);
      }

      // Legs swing dynamically in walk cycle
      const leftLeg = node.querySelector('.left-leg');
      const rightLeg = node.querySelector('.right-leg');
      if (leftLeg) {
        const legAngle = isWalking ? walkCycle * 22 : 0;
        leftLeg.setAttribute('transform', `rotate(${legAngle} -8 -22)`);
      }
      if (rightLeg) {
        const legAngle = isWalking ? -walkCycle * 22 : 0;
        rightLeg.setAttribute('transform', `rotate(${legAngle} 8 -22)`);
      }

      // Arms swing opposite to legs or express contextual poses
      const armLeft = node.querySelector('.arm-left');
      const armRight = node.querySelector('.arm-right');

      if (isWalking) {
        if (armLeft) armLeft.setAttribute('transform', `rotate(${-walkCycle * 18} -13 -42)`);
        if (armRight) armRight.setAttribute('transform', `rotate(${walkCycle * 18} 13 -42)`);
      } else {
        // Contextual stationary arm poses
        if (animState === STATES.LOOK || phase === 'browsing') {
          // One hand on chin/chest inspecting tanks
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-32 -13 -42)');
          if (armRight) armRight.setAttribute('transform', 'rotate(10 13 -42)');
        } else if (animState === STATES.CHECKOUT || animState === STATES.SERVE_TILL || phase === 'checkout') {
          // Reaching forward to counter / register
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-25 -13 -42)');
          if (armRight) armRight.setAttribute('transform', 'rotate(-18 13 -42)');
        } else if (animState === STATES.PICK || animState === STATES.RESTOCK || phase === 'collecting-stock' || phase === 'restocking') {
          // Active stocking / lifting hands
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-42 -13 -42)');
          if (armRight) armRight.setAttribute('transform', 'rotate(-42 13 -42)');
        } else if (animState === STATES.PREPARE || phase === 'preparing-fish' || phase === 'preparing-product') {
          // Working with hands close to center
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-30 -13 -42)');
          if (armRight) armRight.setAttribute('transform', 'rotate(24 13 -42)');
        } else if (animState === STATES.REACT_POSITIVE) {
          // Cheerful raised arms
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-65 -13 -42)');
          if (armRight) armRight.setAttribute('transform', 'rotate(65 13 -42)');
        } else if (animState === STATES.WAIT || animState === STATES.REACT_NEGATIVE) {
          // Crossed arms or hands down
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-12 -13 -42)');
          if (armRight) armRight.setAttribute('transform', 'rotate(12 13 -42)');
        } else {
          // Neutral resting
          if (armLeft) armLeft.setAttribute('transform', '');
          if (armRight) armRight.setAttribute('transform', '');
        }
      }

      // Expressive head tilting & nodding
      const head = node.querySelector('.character-head');
      if (head) {
        if (animState === STATES.LOOK || phase === 'browsing') {
          head.setAttribute('transform', 'rotate(9 0 -52)');
        } else if (animState === STATES.CHECKOUT || animState === STATES.SERVE_TILL || phase === 'checkout') {
          head.setAttribute('transform', 'rotate(5 0 -52)');
        } else if (animState === STATES.REACT_POSITIVE) {
          head.setAttribute('transform', 'rotate(-6 0 -52) scale(1.05)');
        } else if (animState === STATES.REACT_NEGATIVE) {
          head.setAttribute('transform', 'rotate(10 0 -52)');
        } else if (animState === STATES.PREPARE) {
          head.setAttribute('transform', 'rotate(6 0 -52)');
        } else {
          head.setAttribute('transform', '');
        }
      }

      // Purchase bag & Transport items
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

      // Responsive Thought Bubble with compact single-emoji support
      const bubbleEl = node.querySelector('.visitor-bubble');
      if (bubbleEl) {
        bubbleEl.style.display = bubble ? '' : 'none';
        const textNode = bubbleEl.querySelector('text');
        if (textNode) textNode.textContent = bubble;

        if (!isStaff) {
          const isShort = bubble && bubble.length <= 3;
          const w = isShort ? 34 : 110;
          bubbleEl.setAttribute('transform', `translate(${-w / 2} -122)`);
          const rectNode = bubbleEl.querySelector('rect');
          if (rectNode) rectNode.setAttribute('width', w);
          if (textNode) textNode.setAttribute('x', w / 2);
          const polyNode = bubbleEl.querySelector('polygon');
          if (polyNode) {
            const cx = w / 2;
            polyNode.setAttribute('points', `${cx - 4},28 ${cx},34 ${cx + 4},28`);
          }
        } else {
          // Compact worker activity badge
          bubbleEl.setAttribute('transform', 'translate(-14 -115)');
          const rectNode = bubbleEl.querySelector('rect');
          if (rectNode) rectNode.setAttribute('width', '28');
          if (textNode) textNode.setAttribute('x', '14');
        }
      }
    },

    remove(node) {
      if (node && node.remove) node.remove();
    }
  };

  // Register with ShopCharacters engine
  ShopCharacters.registerRenderer('prototype-v1', prototypeV1Renderer);

  // Return helper API for A/B comparison and inspection
  return {
    id: 'prototype-v1',
    renderer: prototypeV1Renderer,
    createCustomerV1Art,
    createStaffV1Art,
    enable() {
      return ShopCharacters.setRenderer('prototype-v1');
    },
    disable() {
      return ShopCharacters.setRenderer('svg-isometric');
    },
    toggle() {
      const current = ShopCharacters.getActiveRendererName();
      const next = current === 'prototype-v1' ? 'svg-isometric' : 'prototype-v1';
      ShopCharacters.setRenderer(next);
      return next;
    },
    isCurrent() {
      return ShopCharacters.getActiveRendererName() === 'prototype-v1';
    }
  };
});
