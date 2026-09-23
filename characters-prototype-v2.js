// Character Visual Prototype V2 — High-Polish Pseudo-3D Directional Renderer
// (Aquarium Shop Tycoon — Character Directional Polish)
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./characters'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const chars = require('./characters');
    module.exports = factory(chars.ShopCharacters);
  } else {
    root.ShopCharacterPrototypeV2 = factory(root.ShopCharacters);
  }
})(typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : globalThis, function(ShopCharacters) {
  'use strict';

  if (!ShopCharacters) {
    console.warn('ShopCharacters not loaded before characters-prototype-v2.js');
    return null;
  }

  const { STATES } = ShopCharacters;

  /**
   * Helper to compute subtle color tints and shading
   */
  function shadeColor(hex, percent) {
    let num = parseInt(hex.replace('#', ''), 16);
    if (isNaN(num)) return hex;
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = (num >> 8 & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }

  /**
   * Determine isometric heading direction (front / back / side)
   * In 2:1 isometric projection:
   * dx = to.x - from.x, dy = to.y - from.y
   * Screen dy = (dx + dy) * 15
   * If (dx + dy) < -0.15, character is traveling UP-SCREEN into the background -> 'back'
   * If (dx + dy) > 0.15, character is traveling DOWN-SCREEN towards viewer -> 'front'
   * Otherwise -> 'side'
   */
  function resolveDirectionHeading(direction, animState, phase, facing) {
    if (direction && typeof direction.x === 'number' && typeof direction.y === 'number') {
      const screenDy = direction.x + direction.y;
      if (screenDy < -0.18) return 'back';
      if (screenDy > 0.18) return 'front';
      return 'side';
    }

    // Contextual fallback based on animState and phase
    if (phase === 'browsing' || animState === STATES.LOOK || animState === STATES.RESTOCK || animState === STATES.PICK) {
      // Frequently looking at tanks situated against the back wall
      return 'back';
    }

    if (animState === STATES.CHECKOUT || animState === STATES.SERVE_TILL) {
      // Tills are front-facing stations
      return 'front';
    }

    return 'front';
  }

  // ==========================================
  // CUSTOMER V2 VECTOR ART (Front, Back, Side)
  // ==========================================

  function createCustomerV2Art(p) {
    const skinColor = p.skin || '#fed8b1';
    const skinShadow = shadeColor(skinColor, -14);
    const skinHighlight = shadeColor(skinColor, 12);

    const hairColor = p.hairColor || '#5a3d28';
    const hairShadow = shadeColor(hairColor, -18);
    const hairLight = shadeColor(hairColor, 16);

    const shirtColor = p.color || '#4fa3d1';
    const shirtShadow = shadeColor(shirtColor, -20);
    const shirtLight = shadeColor(shirtColor, 14);

    const pantsColor = '#344557';
    const pantsShadow = shadeColor(pantsColor, -18);
    const pantsLight = shadeColor(pantsColor, 12);

    const shoeBase = '#222f3d';
    const shoeSole = '#f0f3f5';
    const shoeLaces = '#e1e8ed';

    // Shared Ambient Shadow
    const shadowMarkup = `
      <ellipse cy="3" rx="20" ry="8.5" fill="#2d4239" fill-opacity="0.22"/>
      <ellipse cy="2.5" rx="14" ry="5.5" fill="#1b2a24" fill-opacity="0.20"/>
    `;

    // 1. FRONT VIEW
    const frontView = `
      <g class="view-layer view-front">
        <!-- Legs with anatomical 3D volume & sneakers -->
        <g class="character-leg left-leg">
          <path d="M-8-23 L-8-5" stroke="${pantsColor}" stroke-width="7.5" stroke-linecap="round"/>
          <path d="M-10-22 L-10-6" stroke="${pantsShadow}" stroke-width="2" stroke-linecap="round"/>
          <path d="M-7-22 L-7-6" stroke="${pantsLight}" stroke-width="1.8" stroke-linecap="round"/>
          <!-- Sneaker -->
          <ellipse cx="-8" cy="-3" rx="5.5" ry="3.5" fill="${shoeBase}"/>
          <path d="M-13-1 Q-8 2 -3-1" stroke="${shoeSole}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
          <path d="M-10-4 L-6-4" stroke="${shoeLaces}" stroke-width="1.2" stroke-linecap="round"/>
        </g>
        <g class="character-leg right-leg">
          <path d="M8-23 L8-5" stroke="${pantsColor}" stroke-width="7.5" stroke-linecap="round"/>
          <path d="M6-22 L6-6" stroke="${pantsShadow}" stroke-width="2" stroke-linecap="round"/>
          <path d="M9-22 L9-6" stroke="${pantsLight}" stroke-width="1.8" stroke-linecap="round"/>
          <!-- Sneaker -->
          <ellipse cx="8" cy="-3" rx="5.5" ry="3.5" fill="${shoeBase}"/>
          <path d="M3-1 Q8 2 13-1" stroke="${shoeSole}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
          <path d="M6-4 L10-4" stroke="${shoeLaces}" stroke-width="1.2" stroke-linecap="round"/>
        </g>

        <!-- Torso: Structured Cozy Hoodie with volume, ribbing & seams -->
        <g class="character-torso">
          <path d="M-13-44 C-17-38 -15-20 -12-16 C-4-14 4-14 12-16 C15-20 17-38 13-44 Z" fill="${shirtColor}"/>
          <!-- Volumetric side shading -->
          <path d="M-13-44 C-17-38 -15-20 -12-16 L-8-15 C-11-20 -12-38 -10-43 Z" fill="${shirtShadow}" opacity="0.8"/>
          <path d="M13-44 C17-38 15-20 12-16 L8-15 C11-20 12-38 10-43 Z" fill="${shirtShadow}" opacity="0.5"/>
          <!-- Ribbed bottom hem -->
          <path d="M-12-16 Q0-13 12-16 L11-19 Q0-16 -11-19 Z" fill="${shirtShadow}"/>
          <!-- Hood collar curve & strings -->
          <path d="M-6-44 Q0-38 6-44" fill="none" stroke="#fff8eb" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M-3-38 L-3-27 M3-38 L3-27" stroke="#fff8eb" stroke-width="1.8" stroke-linecap="round"/>
          <circle cx="-3" cy="-26.5" r="1.2" fill="#d9cdb4"/>
          <circle cx="3" cy="-26.5" r="1.2" fill="#d9cdb4"/>
          <!-- Front pouch pocket with top stitching -->
          <path d="M-7-25 Q0-23 7-25 L6-18 Q0-16 -6-18 Z" fill="${shirtLight}" fill-opacity="0.3" stroke="${shirtShadow}" stroke-width="1"/>
        </g>

        <!-- Arms with shoulder cap, forearms and 3D hands -->
        <g class="character-arms">
          <g class="character-arm arm-left">
            <path d="M-13-42 L-18-28" stroke="${shirtColor}" stroke-width="7.5" stroke-linecap="round"/>
            <path d="M-15-41 L-20-28" stroke="${shirtShadow}" stroke-width="2" stroke-linecap="round"/>
            <circle cx="-19" cy="-24.5" r="4.3" fill="${skinColor}"/>
            <circle cx="-19.5" cy="-24.5" r="3.2" fill="${skinShadow}" opacity="0.4"/>
          </g>
          <g class="character-arm arm-right">
            <path d="M13-42 L18-28" stroke="${shirtColor}" stroke-width="7.5" stroke-linecap="round"/>
            <path d="M12-41 L17-28" stroke="${shirtLight}" stroke-width="2" stroke-linecap="round"/>
            <circle cx="19" cy="-24.5" r="4.3" fill="${skinColor}"/>
            <circle cx="18.5" cy="-24.5" r="3.2" fill="${skinHighlight}" opacity="0.5"/>
          </g>
        </g>

        <!-- Expressive Pseudo-3D Head -->
        <g class="character-head" transform-origin="0 -52">
          <!-- Volumetric Neck with chin shadow -->
          <rect x="-4.5" y="-53" width="9" height="11" rx="3" fill="${skinColor}"/>
          <path d="M-4.5-53 Q0-50 4.5-53 L4.5-48 Q0-45 -4.5-48 Z" fill="${skinShadow}"/>

          <!-- 3D Form Face Oval with ambient rim -->
          <ellipse cx="0" cy="-66" rx="16" ry="17.5" fill="${skinColor}"/>
          <path d="M-15-66 C-15-55 -4-50 0-49 C4-50 15-55 15-66 C15-53 2-48 0-48 C-2-48 -15-53 -15-66 Z" fill="${skinShadow}" opacity="0.6"/>

          <!-- Cute Soft Rosy Cheeks -->
          <ellipse cx="-10.5" cy="-62" rx="3.5" ry="2.2" fill="#ff7070" fill-opacity="0.45"/>
          <ellipse cx="10.5" cy="-62" rx="3.5" ry="2.2" fill="#ff7070" fill-opacity="0.45"/>

          <!-- High-Polish Expressive Cartoon Eyes with Shading & Multiple Highlights -->
          <g class="character-eyes">
            <!-- Left Eye -->
            <ellipse cx="-6.5" cy="-67" rx="4.2" ry="5.2" fill="#ffffff"/>
            <!-- Sclera shadow at top -->
            <path d="M-10.5-68 Q-6.5-70 -2.5-68 L-2.5-66 Q-6.5-67 -10.5-66 Z" fill="#d9e2e8"/>
            <circle cx="-5.8" cy="-66.5" r="3" fill="#205361"/>
            <circle cx="-5.5" cy="-66.5" r="1.8" fill="#102026"/>
            <!-- Highlights: large primary sparkle, secondary rim sparkle -->
            <circle cx="-7.2" cy="-68.8" r="1.3" fill="#ffffff"/>
            <circle cx="-4.5" cy="-65" r="0.7" fill="#ffffff"/>

            <!-- Right Eye -->
            <ellipse cx="6.5" cy="-67" rx="4.2" ry="5.2" fill="#ffffff"/>
            <path d="M2.5-68 Q6.5-70 10.5-68 L10.5-66 Q6.5-67 2.5-66 Z" fill="#d9e2e8"/>
            <circle cx="7.2" cy="-66.5" r="3" fill="#205361"/>
            <circle cx="7.5" cy="-66.5" r="1.8" fill="#102026"/>
            <circle cx="5.8" cy="-68.8" r="1.3" fill="#ffffff"/>
            <circle cx="8.5" cy="-65" r="0.7" fill="#ffffff"/>

            <!-- Eyebrows with character depth -->
            <path d="M-11-74 Q-6-77 -2-74" stroke="${hairShadow}" stroke-width="2" stroke-linecap="round" fill="none"/>
            <path d="M2-74 Q6-77 11-74" stroke="${hairShadow}" stroke-width="2" stroke-linecap="round" fill="none"/>
          </g>

          <!-- Charming Cartoon Mouth with lower lip hint -->
          <path class="character-mouth" d="M-3.5-59 Q0-56 3.5-59" stroke="#9e4c36" stroke-width="2.2" stroke-linecap="round" fill="none"/>
          <ellipse cx="0" cy="-56.5" rx="1.8" ry="0.8" fill="#ff8f75" opacity="0.5"/>

          <!-- Volumetric Cartoon Hair (Silhouetted bangs, volume clumps, glossy rim) -->
          <g class="character-hair">
            <path d="M-16-68 C-20-88 0-93 16-86 C21-78 20-63 18-58 C16-65 14-72 11-74 C7-76 -7-76 -12-70 C-15-66 -16-60 -16-68 Z" fill="${hairColor}"/>
            <!-- Underhair shade -->
            <path d="M-17-72 C-14-88 2-90 17-82 L15-78 C3-84 -11-82 -14-70 Z" fill="${hairShadow}" opacity="0.7"/>
            <!-- Front swept bangs -->
            <path d="M-17-72 C-14-88 2-90 17-82 C14-77 9-73 5-73 C0-73 -5-76 -10-73 C-13-71 -15-68 -17-72 Z" fill="${hairColor}"/>
            <!-- Hair volume highlight arc -->
            <path d="M-10-85 Q0-89 11-83" stroke="${hairLight}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
            <path d="M-6-82 Q0-85 7-80" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.4" stroke-linecap="round" fill="none"/>
          </g>
        </g>
      </g>
    `;

    // 2. BACK VIEW (When walking towards top/background of the store)
    const backView = `
      <g class="view-layer view-back" style="display:none">
        <!-- Legs from behind -->
        <g class="character-leg left-leg">
          <path d="M-8-23 L-8-5" stroke="${pantsColor}" stroke-width="7.5" stroke-linecap="round"/>
          <path d="M-7-22 L-7-6" stroke="${pantsLight}" stroke-width="1.8" stroke-linecap="round"/>
          <ellipse cx="-8" cy="-3" rx="5.5" ry="3.5" fill="${shoeBase}"/>
          <!-- Back heel tab of sneaker -->
          <rect x="-9.5" y="-5" width="3" height="3.5" rx="1" fill="${shoeSole}"/>
          <path d="M-13-1 Q-8 2 -3-1" stroke="${shoeSole}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        </g>
        <g class="character-leg right-leg">
          <path d="M8-23 L8-5" stroke="${pantsColor}" stroke-width="7.5" stroke-linecap="round"/>
          <path d="M9-22 L9-6" stroke="${pantsLight}" stroke-width="1.8" stroke-linecap="round"/>
          <ellipse cx="8" cy="-3" rx="5.5" ry="3.5" fill="${shoeBase}"/>
          <rect x="6.5" y="-5" width="3" height="3.5" rx="1" fill="${shoeSole}"/>
          <path d="M3-1 Q8 2 13-1" stroke="${shoeSole}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        </g>

        <!-- Torso Back: Hoodie back with resting hood draped over shoulders -->
        <g class="character-torso">
          <path d="M-13-44 C-17-38 -15-20 -12-16 C-4-14 4-14 12-16 C15-20 17-38 13-44 Z" fill="${shirtColor}"/>
          <path d="M-13-44 C-17-38 -15-20 -12-16 L-8-15 C-11-20 -12-38 -10-43 Z" fill="${shirtShadow}" opacity="0.8"/>
          <!-- Resting Hood on back -->
          <path d="M-11-45 C-12-35 0-30 11-45 C7-33 -7-33 -11-45 Z" fill="${shirtShadow}"/>
          <path d="M-9-43 C-10-36 0-33 9-43" fill="none" stroke="${shirtLight}" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Bottom ribbing -->
          <path d="M-12-16 Q0-14 12-16 L11-19 Q0-17 -11-19 Z" fill="${shirtShadow}"/>
        </g>

        <!-- Arms Back -->
        <g class="character-arms">
          <g class="character-arm arm-left">
            <path d="M-13-42 L-18-28" stroke="${shirtColor}" stroke-width="7.5" stroke-linecap="round"/>
            <circle cx="-19" cy="-24.5" r="4.3" fill="${skinColor}"/>
          </g>
          <g class="character-arm arm-right">
            <path d="M13-42 L18-28" stroke="${shirtColor}" stroke-width="7.5" stroke-linecap="round"/>
            <circle cx="19" cy="-24.5" r="4.3" fill="${skinColor}"/>
          </g>
        </g>

        <!-- Head Back: Full haircut volume without face elements -->
        <g class="character-head" transform-origin="0 -52">
          <!-- Neck Back -->
          <rect x="-4.5" y="-53" width="9" height="11" rx="3" fill="${skinColor}"/>
          <!-- Back Hair Silhouette -->
          <path d="M-16-64 C-20-88 0-94 16-88 C22-78 20-56 16-52 C12-58 8-62 0-62 C-8-62 -12-58 -16-52 C-20-56 -18-60 -16-64 Z" fill="${hairColor}"/>
          <!-- Volumetric Hair Shadow & Specular Arch -->
          <path d="M-15-70 C-18-86 0-90 15-84 L14-80 C0-85 -14-81 -14-68 Z" fill="${hairShadow}" opacity="0.6"/>
          <path d="M-10-85 Q0-89 11-83" stroke="${hairLight}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        </g>
      </g>
    `;

    // 3. SIDE VIEW (3/4 Profile)
    const sideView = `
      <g class="view-layer view-side" style="display:none">
        <!-- Legs in 3/4 depth offset -->
        <g class="character-leg left-leg">
          <path d="M-5-23 L-5-5" stroke="${pantsColor}" stroke-width="7.5" stroke-linecap="round"/>
          <ellipse cx="-5" cy="-3" rx="5.5" ry="3.5" fill="${shoeBase}"/>
          <path d="M-10-1 Q-5 2 0-1" stroke="${shoeSole}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        </g>
        <g class="character-leg right-leg">
          <path d="M5-23 L5-5" stroke="${pantsShadow}" stroke-width="7.5" stroke-linecap="round"/>
          <ellipse cx="5" cy="-3" rx="5.5" ry="3.5" fill="${shoeBase}"/>
          <path d="M0-1 Q5 2 10-1" stroke="${shoeSole}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        </g>

        <!-- Torso 3/4 -->
        <g class="character-torso">
          <path d="M-10-44 C-15-38 -12-20 -9-16 C-2-14 8-14 13-16 C15-20 16-38 11-44 Z" fill="${shirtColor}"/>
          <path d="M-10-44 C-15-38 -12-20 -9-16 L-5-15 C-8-20 -9-38 -7-43 Z" fill="${shirtShadow}" opacity="0.7"/>
          <!-- Hoodie side pocket curve -->
          <path d="M-4-25 Q2-23 8-25 L7-18 Q1-16 -3-18 Z" fill="${shirtLight}" fill-opacity="0.3" stroke="${shirtShadow}" stroke-width="1"/>
        </g>

        <!-- Arms 3/4 -->
        <g class="character-arms">
          <g class="character-arm arm-left">
            <path d="M-6-42 L-10-28" stroke="${shirtColor}" stroke-width="7.5" stroke-linecap="round"/>
            <circle cx="-11" cy="-24.5" r="4.3" fill="${skinColor}"/>
          </g>
          <g class="character-arm arm-right">
            <path d="M8-42 L13-28" stroke="${shirtLight}" stroke-width="7.5" stroke-linecap="round"/>
            <circle cx="14" cy="-24.5" r="4.3" fill="${skinColor}"/>
          </g>
        </g>

        <!-- Head 3/4 Profile with expressive eye & nose bridge -->
        <g class="character-head" transform-origin="0 -52">
          <rect x="-3" y="-53" width="8" height="11" rx="3" fill="${skinColor}"/>
          <ellipse cx="3" cy="-66" rx="15" ry="17" fill="${skinColor}"/>
          <!-- Cheek & Nose bump -->
          <path d="M12-66 C15-66 16-63 13-61 Z" fill="${skinColor}"/>
          <ellipse cx="6" cy="-62" rx="3.5" ry="2.2" fill="#ff7070" fill-opacity="0.4"/>

          <!-- 3/4 Eye -->
          <g class="character-eyes">
            <ellipse cx="7" cy="-67" rx="4.2" ry="5.2" fill="#ffffff"/>
            <circle cx="8" cy="-66.5" r="3" fill="#205361"/>
            <circle cx="8.3" cy="-66.5" r="1.8" fill="#102026"/>
            <circle cx="6.5" cy="-68.8" r="1.3" fill="#ffffff"/>
            <path d="M4-74 Q8-77 12-74" stroke="${hairShadow}" stroke-width="2" stroke-linecap="round" fill="none"/>
          </g>

          <path class="character-mouth" d="M5-59 Q8-56 10-59" stroke="#9e4c36" stroke-width="2.2" stroke-linecap="round" fill="none"/>

          <!-- Hair 3/4 Profile -->
          <g class="character-hair">
            <path d="M-13-68 C-17-88 2-93 17-84 C21-76 19-61 16-56 C12-62 6-68 0-68 C-7-68 -11-64 -13-68 Z" fill="${hairColor}"/>
            <path d="M-8-85 Q2-89 12-83" stroke="${hairLight}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
          </g>
        </g>
      </g>
    `;

    return `
      ${shadowMarkup}
      ${frontView}
      ${backView}
      ${sideView}
    `;
  }

  // ==========================================
  // STAFF V2 VECTOR ART (Front, Back, Side)
  // ==========================================

  function createStaffV2Art(p) {
    const skinColor = p.skin || '#d9a77d';
    const skinShadow = shadeColor(skinColor, -14);
    const skinHighlight = shadeColor(skinColor, 12);

    const hairColor = p.hairColor || '#343b42';
    const hairShadow = shadeColor(hairColor, -20);
    const hairLight = shadeColor(hairColor, 15);

    const brandColor = (typeof ShopIdentity !== 'undefined' && ShopIdentity.colors && ShopIdentity.colors[ShopIdentity.current?.color]) || '#427d6d';
    const brandShadow = shadeColor(brandColor, -22);
    const brandLight = shadeColor(brandColor, 16);

    const apronColor = '#f5eedb';
    const apronShadow = '#ded1b6';
    const apronLight = '#fffbf2';

    const pantsColor = '#2d3e4f';
    const pantsShadow = shadeColor(pantsColor, -18);
    const pantsLight = shadeColor(pantsColor, 12);

    const shoeBase = '#1c2833';
    const shoeSole = '#485c6b';

    const shadowMarkup = `
      <ellipse cy="3" rx="21" ry="9" fill="#1f382f" fill-opacity="0.25"/>
      <ellipse cy="2.5" rx="15" ry="5.8" fill="#132620" fill-opacity="0.20"/>
    `;

    // 1. STAFF FRONT VIEW
    const frontView = `
      <g class="view-layer view-front">
        <!-- Trousers with creases & work boots -->
        <g class="character-leg left-leg">
          <path d="M-8-23 L-8-5" stroke="${pantsColor}" stroke-width="7.5" stroke-linecap="round"/>
          <path d="M-10-22 L-10-6" stroke="${pantsShadow}" stroke-width="2" stroke-linecap="round"/>
          <path d="M-7-22 L-7-6" stroke="${pantsLight}" stroke-width="1.8" stroke-linecap="round"/>
          <ellipse cx="-8" cy="-3" rx="6" ry="3.8" fill="${shoeBase}"/>
          <path d="M-14-1 L-2-1" stroke="${shoeSole}" stroke-width="2" stroke-linecap="round"/>
        </g>
        <g class="character-leg right-leg">
          <path d="M8-23 L8-5" stroke="${pantsColor}" stroke-width="7.5" stroke-linecap="round"/>
          <path d="M6-22 L6-6" stroke="${pantsShadow}" stroke-width="2" stroke-linecap="round"/>
          <path d="M9-22 L9-6" stroke="${pantsLight}" stroke-width="1.8" stroke-linecap="round"/>
          <ellipse cx="8" cy="-3" rx="6" ry="3.8" fill="${shoeBase}"/>
          <path d="M2-1 L14-1" stroke="${shoeSole}" stroke-width="2" stroke-linecap="round"/>
        </g>

        <!-- Torso: Store Polo + Tycoon Utility Apron with professional details -->
        <g class="character-torso">
          <!-- Polo Base (Brand Color) -->
          <path d="M-14-44 C-17-38 -15-20 -12-16 C-4-14 4-14 12-16 C15-20 17-38 14-44 Z" fill="${brandColor}"/>
          <path d="M-14-44 C-17-38 -15-20 -12-16 L-8-15 C-11-20 -12-38 -10-43 Z" fill="${brandShadow}" opacity="0.8"/>
          <!-- Crisp White Polo Collar -->
          <path d="M-7-44 L0-39 L7-44 L4-46 L0-42 L-4-46 Z" fill="#ffffff"/>
          <path d="M-1-42 L1-42 L0-39 Z" fill="${brandShadow}"/>

          <!-- Utility Apron -->
          <path d="M-10-38 L10-38 L12-17 L-12-17 Z" fill="${apronColor}" stroke="${apronShadow}" stroke-width="1"/>
          <!-- Apron Straps with buckles -->
          <path d="M-8-44 L-8-38 M8-44 L8-38" stroke="#ba9e72" stroke-width="2"/>
          <rect x="-9" y="-40" width="2" height="3" fill="#695637"/>
          <rect x="7" y="-40" width="2" height="3" fill="#695637"/>

          <!-- Front Pocket with technical tools (pH pen & aquatic scraper) -->
          <path d="M-6-27 H6 V-19 H-6 Z" fill="#ebdfc0" stroke="${apronShadow}" stroke-width="1"/>
          <!-- Blue electronic pH probe -->
          <line x1="-3" y1="-30" x2="-3" y2="-24" stroke="#4ba3c7" stroke-width="2.4" stroke-linecap="round"/>
          <circle cx="-3" cy="-30.5" r="0.8" fill="#ffffff"/>
          <!-- Coral scraper pen -->
          <line x1="2" y1="-31" x2="2" y2="-24" stroke="#e67e35" stroke-width="2.4" stroke-linecap="round"/>

          <!-- Staff Tycoon Badge -->
          <g class="staff-badge" transform="translate(4 -36) scale(0.24)">
            <rect x="-8" y="-6" width="30" height="22" rx="4" fill="#ffffff" stroke="#90a89d" stroke-width="2"/>
            <circle cx="0" cy="5" r="5" fill="${brandColor}"/>
            <rect x="8" y="1" width="12" height="3" fill="#668277" rx="1.5"/>
            <rect x="8" y="6" width="8" height="2.5" fill="#9ab0a6" rx="1"/>
          </g>
        </g>

        <!-- Arms with rolled-up sleeves & sturdy forearms -->
        <g class="character-arms">
          <g class="character-arm arm-left">
            <path d="M-13-42 L-17-32" stroke="${brandColor}" stroke-width="7.5" stroke-linecap="round"/>
            <!-- Sleeve rolled cuff -->
            <path d="M-19-33 L-15-31" stroke="${brandLight}" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M-17-32 L-18-23" stroke="${skinColor}" stroke-width="6.5" stroke-linecap="round"/>
            <circle cx="-19" cy="-21" r="4.3" fill="${skinColor}"/>
          </g>
          <g class="character-arm arm-right">
            <path d="M13-42 L17-32" stroke="${brandColor}" stroke-width="7.5" stroke-linecap="round"/>
            <path d="M15-31 L19-33" stroke="${brandLight}" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M17-32 L18-23" stroke="${skinColor}" stroke-width="6.5" stroke-linecap="round"/>
            <circle cx="19" cy="-21" r="4.3" fill="${skinColor}"/>
          </g>
        </g>

        <!-- Staff Head with Official Cap/Visor -->
        <g class="character-head" transform-origin="0 -52">
          <rect x="-5" y="-53" width="10" height="11" rx="3" fill="${skinColor}"/>
          <path d="M-5-53 Q0-50 5-53 L5-48 Q0-45 -5-48 Z" fill="${skinShadow}"/>

          <ellipse cx="0" cy="-66" rx="16.5" ry="17.5" fill="${skinColor}"/>
          <path d="M-15-66 C-15-55 -4-50 0-49 C4-50 15-55 15-66 C15-53 2-48 0-48 C-2-48 -15-53 -15-66 Z" fill="${skinShadow}" opacity="0.6"/>

          <!-- Healthy Cheeks -->
          <ellipse cx="-11" cy="-62" rx="3.2" ry="2" fill="#ff8566" fill-opacity="0.38"/>
          <ellipse cx="11" cy="-62" rx="3.2" ry="2" fill="#ff8566" fill-opacity="0.38"/>

          <!-- Cheerful Cartoon Eyes -->
          <g class="character-eyes">
            <ellipse cx="-6.5" cy="-66.5" rx="3.8" ry="4.8" fill="#ffffff"/>
            <path d="M-10.3-67.5 Q-6.5-69 -2.7-67.5 L-2.7-65.5 Q-6.5-66.5 -10.3-65.5 Z" fill="#d9e2e8"/>
            <circle cx="-6" cy="-66" r="2.8" fill="#2b473c"/>
            <circle cx="-5.8" cy="-66" r="1.7" fill="#14211c"/>
            <circle cx="-7.2" cy="-68.2" r="1.3" fill="#ffffff"/>

            <ellipse cx="6.5" cy="-66.5" rx="3.8" ry="4.8" fill="#ffffff"/>
            <path d="M2.7-67.5 Q6.5-69 10.3-67.5 L10.3-65.5 Q6.5-66.5 2.7-65.5 Z" fill="#d9e2e8"/>
            <circle cx="7" cy="-66" r="2.8" fill="#2b473c"/>
            <circle cx="7.2" cy="-66" r="1.7" fill="#14211c"/>
            <circle cx="5.8" cy="-68.2" r="1.3" fill="#ffffff"/>

            <path d="M-10-73 Q-6-76 -2-74" stroke="${hairShadow}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
            <path d="M2-74 Q6-76 10-73" stroke="${hairShadow}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
          </g>

          <path class="character-mouth" d="M-4.5-58 Q0-53 4.5-58" stroke="#8c3e29" stroke-width="2.2" stroke-linecap="round" fill="#ffffff"/>

          <!-- Staff Uniform Cap / Visor with Dimensional Peak & Brand Tone -->
          <g class="character-cap">
            <!-- Back neck hair trim -->
            <path d="M-16-64 Q-18-78 -10-84 Q10-84 17-76 Q18-64 16-58" fill="${hairColor}"/>
            <!-- Cap Dome -->
            <path d="M-16-72 C-16-88 0-93 16-88 C18-80 18-72 16-70 Z" fill="${brandColor}"/>
            <path d="M-16-72 C-16-88 0-93 16-88 L14-84 C-1-89 -14-84 -14-70 Z" fill="${brandLight}" opacity="0.6"/>
            <!-- Cap Visor projecting forward with shadow underneath -->
            <path d="M-16-71 Q0-78 18-69 L22-68 Q0-75 -15-70 Z" fill="${brandShadow}" stroke="#1f3e36" stroke-width="0.8"/>
            <!-- Emblem / Store Pin -->
            <circle cx="0" cy="-79" r="3.2" fill="#fff5d9" stroke="${brandShadow}" stroke-width="0.6"/>
            <circle cx="0" cy="-79" r="1.5" fill="${brandColor}"/>
          </g>
        </g>
      </g>
    `;

    // 2. STAFF BACK VIEW
    const backView = `
      <g class="view-layer view-back" style="display:none">
        <!-- Trousers Back -->
        <g class="character-leg left-leg">
          <path d="M-8-23 L-8-5" stroke="${pantsColor}" stroke-width="7.5" stroke-linecap="round"/>
          <ellipse cx="-8" cy="-3" rx="6" ry="3.8" fill="${shoeBase}"/>
          <rect x="-9.5" y="-5" width="3" height="3.5" rx="1" fill="${shoeSole}"/>
          <path d="M-14-1 L-2-1" stroke="${shoeSole}" stroke-width="2" stroke-linecap="round"/>
        </g>
        <g class="character-leg right-leg">
          <path d="M8-23 L8-5" stroke="${pantsColor}" stroke-width="7.5" stroke-linecap="round"/>
          <ellipse cx="8" cy="-3" rx="6" ry="3.8" fill="${shoeBase}"/>
          <rect x="6.5" y="-5" width="3" height="3.5" rx="1" fill="${shoeSole}"/>
          <path d="M2-1 L14-1" stroke="${shoeSole}" stroke-width="2" stroke-linecap="round"/>
        </g>

        <!-- Torso Back: Uniform Polo back + apron crossed ties/knot -->
        <g class="character-torso">
          <path d="M-14-44 C-17-38 -15-20 -12-16 C-4-14 4-14 12-16 C15-20 17-38 14-44 Z" fill="${brandColor}"/>
          <path d="M-14-44 C-17-38 -15-20 -12-16 L-8-15 C-11-20 -12-38 -10-43 Z" fill="${brandShadow}" opacity="0.8"/>
          
          <!-- Apron Back Straps crossed with knot -->
          <path d="M-10-38 L10-22 M10-38 L-10-22" stroke="${apronColor}" stroke-width="2.2"/>
          <path d="M-10-38 L10-22 M10-38 L-10-22" stroke="${apronShadow}" stroke-width="0.8"/>
          <!-- Apron Bow/Knot at waist -->
          <circle cx="0" cy="-21" r="2.2" fill="${apronColor}" stroke="${apronShadow}" stroke-width="0.8"/>
          <path d="M-1-20 L-4-15 M1-20 L4-15" stroke="${apronColor}" stroke-width="2" stroke-linecap="round"/>
        </g>

        <!-- Arms Back -->
        <g class="character-arms">
          <g class="character-arm arm-left">
            <path d="M-13-42 L-17-32" stroke="${brandColor}" stroke-width="7.5" stroke-linecap="round"/>
            <path d="M-17-32 L-18-23" stroke="${skinColor}" stroke-width="6.5" stroke-linecap="round"/>
            <circle cx="-19" cy="-21" r="4.3" fill="${skinColor}"/>
          </g>
          <g class="character-arm arm-right">
            <path d="M13-42 L17-32" stroke="${brandColor}" stroke-width="7.5" stroke-linecap="round"/>
            <path d="M17-32 L18-23" stroke="${skinColor}" stroke-width="6.5" stroke-linecap="round"/>
            <circle cx="19" cy="-21" r="4.3" fill="${skinColor}"/>
          </g>
        </g>

        <!-- Head Back: Cap Dome + Adjustment strap + Neck hair -->
        <g class="character-head" transform-origin="0 -52">
          <rect x="-5" y="-53" width="10" height="11" rx="3" fill="${skinColor}"/>
          <!-- Neck hair -->
          <path d="M-15-62 C-16-72 0-76 15-72 C16-62 14-55 12-52 C6-55 -6-55 -12-52 Z" fill="${hairColor}"/>
          <!-- Cap Back Dome -->
          <path d="M-16-70 C-16-88 0-93 16-88 C18-80 18-72 16-68 Z" fill="${brandColor}"/>
          <!-- Cap Back Keyhole Cutout & Sizing Strap -->
          <path d="M-4-70 Q0-74 4-70 Z" fill="${hairColor}"/>
          <path d="M-5-69 L5-69" stroke="#fff5d9" stroke-width="1.8" stroke-linecap="round"/>
        </g>
      </g>
    `;

    // 3. STAFF SIDE VIEW (3/4 Profile)
    const sideView = `
      <g class="view-layer view-side" style="display:none">
        <g class="character-leg left-leg">
          <path d="M-5-23 L-5-5" stroke="${pantsColor}" stroke-width="7.5" stroke-linecap="round"/>
          <ellipse cx="-5" cy="-3" rx="6" ry="3.8" fill="${shoeBase}"/>
          <path d="M-11-1 L1-1" stroke="${shoeSole}" stroke-width="2" stroke-linecap="round"/>
        </g>
        <g class="character-leg right-leg">
          <path d="M5-23 L5-5" stroke="${pantsShadow}" stroke-width="7.5" stroke-linecap="round"/>
          <ellipse cx="5" cy="-3" rx="6" ry="3.8" fill="${shoeBase}"/>
          <path d="M-1-1 L11-1" stroke="${shoeSole}" stroke-width="2" stroke-linecap="round"/>
        </g>

        <!-- Torso 3/4 -->
        <g class="character-torso">
          <path d="M-11-44 C-16-38 -13-20 -10-16 C-3-14 7-14 12-16 C15-20 16-38 12-44 Z" fill="${brandColor}"/>
          <!-- Side Apron wrapping -->
          <path d="M-8-38 L11-38 L12-17 L-8-17 Z" fill="${apronColor}" stroke="${apronShadow}" stroke-width="1"/>
          <!-- Tool in side profile -->
          <line x1="2" y1="-30" x2="2" y2="-24" stroke="#4ba3c7" stroke-width="2.4" stroke-linecap="round"/>
        </g>

        <!-- Arms 3/4 -->
        <g class="character-arms">
          <g class="character-arm arm-left">
            <path d="M-6-42 L-10-32" stroke="${brandColor}" stroke-width="7.5" stroke-linecap="round"/>
            <path d="M-10-32 L-11-23" stroke="${skinColor}" stroke-width="6.5" stroke-linecap="round"/>
            <circle cx="-12" cy="-21" r="4.3" fill="${skinColor}"/>
          </g>
          <g class="character-arm arm-right">
            <path d="M8-42 L13-32" stroke="${brandLight}" stroke-width="7.5" stroke-linecap="round"/>
            <path d="M13-32 L15-23" stroke="${skinColor}" stroke-width="6.5" stroke-linecap="round"/>
            <circle cx="16" cy="-21" r="4.3" fill="${skinColor}"/>
          </g>
        </g>

        <!-- Head 3/4 Profile with Visor sticking out -->
        <g class="character-head" transform-origin="0 -52">
          <rect x="-3" y="-53" width="8" height="11" rx="3" fill="${skinColor}"/>
          <ellipse cx="2" cy="-66" rx="15" ry="17" fill="${skinColor}"/>
          <ellipse cx="6" cy="-62" rx="3.2" ry="2" fill="#ff8566" fill-opacity="0.38"/>

          <g class="character-eyes">
            <ellipse cx="7" cy="-66.5" rx="3.8" ry="4.8" fill="#ffffff"/>
            <circle cx="8" cy="-66" r="2.8" fill="#2b473c"/>
            <circle cx="8.2" cy="-66" r="1.7" fill="#14211c"/>
            <circle cx="6.5" cy="-68.2" r="1.3" fill="#ffffff"/>
            <path d="M4-73 Q8-76 12-73" stroke="${hairShadow}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
          </g>

          <path class="character-mouth" d="M5-58 Q8-54 11-58" stroke="#8c3e29" stroke-width="2.2" stroke-linecap="round" fill="#ffffff"/>

          <!-- Cap 3/4 Profile with protruding brim -->
          <g class="character-cap">
            <path d="M-12-72 C-12-88 2-93 15-88 C17-80 17-72 14-70 Z" fill="${brandColor}"/>
            <!-- Protruding brim in profile -->
            <path d="M2-72 L22-68 L15-65 L2-69 Z" fill="${brandShadow}" stroke="#1f3e36" stroke-width="0.8"/>
          </g>
        </g>
      </g>
    `;

    return `
      ${shadowMarkup}
      ${frontView}
      ${backView}
      ${sideView}
    `;
  }

  function rebuildNodeForV2(node) {
    node.classList.remove('character-prototype-v1', 'character-prototype-v3');
    node.classList.add('character-prototype-v2');
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');

    const id = node.dataset.visitorId || 1;
    const seed = Number(node.dataset.seed) || (Number(id) || 1);
    let p = null;
    try {
      p = JSON.parse(node.dataset.profile || '{}');
    } catch (e) {
      p = null;
    }
    const role = node.dataset.role || (node.classList.contains('live-worker') ? 'staff' : 'customer');
    if (!p || !p.skin) {
      p = (typeof ShopCharacters !== 'undefined' && ShopCharacters.createProfile)
        ? ShopCharacters.createProfile({ id, seed, role })
        : {
            skin: '#fed8b1',
            hairColor: '#4a2f1b',
            color: '#3b82f6',
            archetype: role === 'staff' ? 'staff' : 'casual'
          };
      node.dataset.profile = JSON.stringify(p);
    }
    const isStaff = role === 'staff' || String(id).startsWith('staff-') || Number(id) >= 10000;
    const artMarkup = isStaff ? createStaffV2Art(p) : createCustomerV2Art(p);
    const markMarkup = (typeof ShopIdentity !== 'undefined' && ShopIdentity.mark)
      ? ShopIdentity.mark().replace(/^<svg[^>]*>|<\/svg>$/g, '')
      : '';
    const brandColor = (typeof ShopIdentity !== 'undefined' && ShopIdentity.colors && ShopIdentity.colors[ShopIdentity.current?.color]) || '#3b8272';

    node.innerHTML = `
      <g class="character-body">
        <g class="character-model">
          <path class="character-swatch" d="M0 0" fill="${brandColor}" style="display:none;"/>
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

    if (isStaff) {
      if (typeof ShopDesign !== 'undefined' && ShopDesign.staffMotion && ShopDesign.staffMotion.visualScale) {
        const model = node.querySelector('.character-model');
        if (model) model.setAttribute('transform', 'scale(' + ShopDesign.staffMotion.visualScale + ')');
      }
      const bag = node.querySelector('.purchase-bag');
      if (bag) bag.setAttribute('transform', 'translate(20 -24) scale(1.15)');
    }
  }

  // ==========================================
  // PROTOTYPE V2 RENDERER IMPLEMENTATION
  // ==========================================

  const prototypeV2Renderer = {
    id: 'prototype-v2',
    create({ id, seed, profile: p, role }) {
      const doc = typeof document !== 'undefined' ? document : null;
      if (!doc) return null;

      const node = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
      node.classList.add(role === 'staff' ? 'live-worker' : 'live-visitor');
      node.classList.add('character-prototype-v2');
      node.dataset.visitorId = id;
      node.dataset.seed = seed;
      node.dataset.profile = JSON.stringify(p);
      node.dataset.role = role;
      node.dataset.archetype = p.archetype || (role === 'staff' ? 'staff' : 'casual');
      node.setAttribute('role', 'button');
      node.setAttribute('tabindex', '0');

      const isStaff = role === 'staff' || String(id).startsWith('staff-') || Number(id) >= 10000;
      const artMarkup = isStaff ? createStaffV2Art(p) : createCustomerV2Art(p);

      const markMarkup = (typeof ShopIdentity !== 'undefined' && ShopIdentity.mark)
        ? ShopIdentity.mark().replace(/^<svg[^>]*>|<\/svg>$/g, '')
        : '';
      const brandColor = (typeof ShopIdentity !== 'undefined' && ShopIdentity.colors && ShopIdentity.colors[ShopIdentity.current?.color]) || '#3b8272';

      node.innerHTML = `
        <g class="character-body">
          <g class="character-model">
            <path class="character-swatch" d="M0 0" fill="${brandColor}" style="display:none;"/>
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

      if (isStaff) {
        if (typeof ShopDesign !== 'undefined' && ShopDesign.staffMotion && ShopDesign.staffMotion.visualScale) {
          const model = node.querySelector('.character-model');
          if (model) model.setAttribute('transform', 'scale(' + ShopDesign.staffMotion.visualScale + ')');
        }
        const bag = node.querySelector('.purchase-bag');
        if (bag) bag.setAttribute('transform', 'translate(20 -24) scale(1.15)');
      }

      return node;
    },

    update(node, maybeAnimState, maybePose) {
      if (!node) return;

      let animState, pose;
      if (maybePose && typeof maybePose === 'object') {
        animState = maybeAnimState || STATES.IDLE;
        pose = maybePose;
      } else if (maybeAnimState && typeof maybeAnimState === 'object') {
        pose = maybeAnimState;
        animState = pose.animState || STATES.IDLE;
      } else {
        animState = maybeAnimState || STATES.IDLE;
        pose = {};
      }

      const { feet, phase, moving, distance = 0, facing = 1, direction, bubble, label = '', result } = pose;

      // Position in isometric room coordinates
      if (feet && typeof feet.x === 'number' && typeof feet.y === 'number') {
        node.setAttribute('transform', 'translate(' + feet.x + ' ' + feet.y + ')');
      }
      if (phase) node.dataset.phase = phase;
      if (result) node.dataset.result = result;
      node.dataset.animState = animState;
      if (label) node.setAttribute('aria-label', label);

      // Rebuild node layers if transitioning from another renderer or missing V2 views
      if (!node.classList.contains('character-prototype-v2') || !node.querySelector('.view-front')) {
        rebuildNodeForV2(node);
      }

      const isStaff = node.classList.contains('live-worker') || node.dataset.role === 'staff';
      const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Resolve Direction View (front / back / side)
      const heading = resolveDirectionHeading(direction, animState, phase, facing);
      node.dataset.heading = heading;

      // Switch active view layer (front / back / side)
      const frontEl = node.querySelector('.view-front');
      const backEl = node.querySelector('.view-back');
      const sideEl = node.querySelector('.view-side');

      if (frontEl && backEl && sideEl) {
        frontEl.style.display = heading === 'front' ? '' : 'none';
        backEl.style.display = heading === 'back' ? '' : 'none';
        sideEl.style.display = heading === 'side' ? '' : 'none';
      }

      // Gait & Natural Bounce Physics
      const isWalking = (
        animState === STATES.WALK ||
        animState === STATES.FETCH ||
        animState === STATES.TRANSPORT_STOCK ||
        (moving && !reduced)
      );

      // Controlled step frequency and subtle organic hop (not exaggerated)
      const stepFreq = isStaff ? 11 : 9.5;
      const walkCycle = isWalking && !reduced ? Math.sin(distance * stepFreq) : 0;
      // Natural, restrained body bounce: ~1.5px (versus 2.2+ previously)
      const verticalHop = isWalking && !reduced ? Math.abs(Math.cos(distance * stepFreq)) * 1.5 : 0;
      const mirror = facing < 0 ? -1 : 1;

      // Root body transform: bounce + flip facing
      const body = node.querySelector('.character-body');
      if (body) {
        body.setAttribute('transform', `translate(0 ${-verticalHop}) scale(${mirror} 1)`);
      }

      // Active view node to animate limbs
      const activeView = (heading === 'back' ? backEl : heading === 'side' ? sideEl : frontEl) || node;

      // Legs swing naturally in walk cycle
      const leftLeg = activeView.querySelector('.left-leg');
      const rightLeg = activeView.querySelector('.right-leg');
      if (leftLeg) {
        const legAngle = isWalking ? walkCycle * 18 : 0;
        leftLeg.setAttribute('transform', `rotate(${legAngle} -8 -22)`);
      }
      if (rightLeg) {
        const legAngle = isWalking ? -walkCycle * 18 : 0;
        rightLeg.setAttribute('transform', `rotate(${legAngle} 8 -22)`);
      }

      // Arms swing opposite to legs or express contextual poses
      const armLeft = activeView.querySelector('.arm-left');
      const armRight = activeView.querySelector('.arm-right');

      if (isWalking) {
        if (armLeft) armLeft.setAttribute('transform', `rotate(${-walkCycle * 15} -13 -42)`);
        if (armRight) armRight.setAttribute('transform', `rotate(${walkCycle * 15} 13 -42)`);
      } else {
        // Contextual stationary arm poses
        if (animState === STATES.LOOK || phase === 'browsing') {
          // Hand on chin / observing tanks
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-28 -13 -42)');
          if (armRight) armRight.setAttribute('transform', 'rotate(8 13 -42)');
        } else if (animState === STATES.CHECKOUT || animState === STATES.SERVE_TILL || phase === 'checkout') {
          // Reaching forward to till
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-22 -13 -42)');
          if (armRight) armRight.setAttribute('transform', 'rotate(-15 13 -42)');
        } else if (animState === STATES.PICK || animState === STATES.RESTOCK || phase === 'collecting-stock' || phase === 'restocking') {
          // Reaching up to shelves / handling merchandise
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-38 -13 -42)');
          if (armRight) armRight.setAttribute('transform', 'rotate(-38 13 -42)');
        } else if (animState === STATES.PREPARE || phase === 'preparing-fish' || phase === 'preparing-product') {
          // Working with hands close to center
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-26 -13 -42)');
          if (armRight) armRight.setAttribute('transform', 'rotate(20 13 -42)');
        } else if (animState === STATES.REACT_POSITIVE) {
          // Raised happy arms
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-60 -13 -42)');
          if (armRight) armRight.setAttribute('transform', 'rotate(60 13 -42)');
        } else if (animState === STATES.WAIT || animState === STATES.REACT_NEGATIVE) {
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-10 -13 -42)');
          if (armRight) armRight.setAttribute('transform', 'rotate(10 13 -42)');
        } else {
          if (armLeft) armLeft.setAttribute('transform', '');
          if (armRight) armRight.setAttribute('transform', '');
        }
      }

      // Expressive head tilting & nodding
      const head = activeView.querySelector('.character-head');
      if (head) {
        if (animState === STATES.LOOK || phase === 'browsing') {
          head.setAttribute('transform', 'rotate(8 0 -52)');
        } else if (animState === STATES.CHECKOUT || animState === STATES.SERVE_TILL || phase === 'checkout') {
          head.setAttribute('transform', 'rotate(4 0 -52)');
        } else if (animState === STATES.REACT_POSITIVE) {
          head.setAttribute('transform', 'rotate(-5 0 -52) scale(1.04)');
        } else if (animState === STATES.REACT_NEGATIVE) {
          head.setAttribute('transform', 'rotate(8 0 -52)');
        } else if (animState === STATES.PREPARE) {
          head.setAttribute('transform', 'rotate(5 0 -52)');
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
  ShopCharacters.registerRenderer('prototype-v2', prototypeV2Renderer);

  // Return public module interface
  return {
    id: 'prototype-v2',
    renderer: prototypeV2Renderer,
    createCustomerV2Art,
    createStaffV2Art,
    resolveDirectionHeading,
    enable() {
      return ShopCharacters.setRenderer('prototype-v2');
    },
    disable() {
      return ShopCharacters.setRenderer('svg-isometric');
    },
    isCurrent() {
      return ShopCharacters.getActiveRendererName() === 'prototype-v2';
    }
  };
});
