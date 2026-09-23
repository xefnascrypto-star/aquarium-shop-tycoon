// Character Visual Prototype V3 — Volumetric Cartoon Directional Renderer
// (Aquarium Shop Tycoon — Character Visual Prototype V3: Definitive Base Candidate)
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./characters'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const chars = require('./characters');
    module.exports = factory(chars.ShopCharacters);
  } else {
    root.ShopCharacterPrototypeV3 = factory(root.ShopCharacters);
  }
})(typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : globalThis, function(ShopCharacters) {
  'use strict';

  if (!ShopCharacters) {
    console.warn('ShopCharacters not loaded before characters-prototype-v3.js');
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
   * Screen Y delta = dx + dy
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
      return 'back';
    }
    if (animState === STATES.CHECKOUT || animState === STATES.SERVE_TILL) {
      return 'front';
    }
    return 'front';
  }

  // ==========================================
  // CUSTOMER V3 VECTOR ART (Volumetric Cartoon)
  // ==========================================
  function createCustomerV3Art(p) {
    const skinColor = p.skin || '#fed8b1';
    const skinShadow = shadeColor(skinColor, -16);
    const skinLight = shadeColor(skinColor, 12);

    const hairColor = p.hairColor || '#4a2f1b';
    const hairShadow = shadeColor(hairColor, -22);
    const hairLight = shadeColor(hairColor, 18);

    const hoodieColor = p.color || '#3b82f6';
    const hoodieShadow = shadeColor(hoodieColor, -22);
    const hoodieLight = shadeColor(hoodieColor, 16);

    const pantsColor = '#243242';
    const pantsShadow = shadeColor(pantsColor, -20);
    const pantsLight = shadeColor(pantsColor, 14);

    const shoeBase = '#e2e8f0';
    const shoeAccent = '#1e293b';
    const shoeSole = '#cbd5e1';

    // Soft grounded ambient occlusion shadow
    const shadowMarkup = `
      <ellipse cy="2" rx="22" ry="9.5" fill="#1b2e26" fill-opacity="0.28"/>
      <ellipse cy="1.5" rx="14" ry="6" fill="#0f1f19" fill-opacity="0.22"/>
    `;

    // 1. CUSTOMER FRONT VIEW
    const frontView = `
      <g class="view-layer view-front">
        <!-- Volumetric Chunky Legs with Curved Silhouette -->
        <g class="character-leg left-leg">
          <!-- Pants Upper & Lower -->
          <path d="M-13-24 C-14-16 -13-8 -11-4 L-4-4 C-5-8 -5-16 -6-24 Z" fill="${pantsColor}"/>
          <path d="M-13-24 C-14-16 -13-8 -11-4 L-9-4 C-11-8 -11-16 -10-24 Z" fill="${pantsShadow}" opacity="0.65"/>
          <path d="M-7-23 C-6-16 -6-8 -5-5" stroke="${pantsLight}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <!-- Chunky Rounded Sneaker -->
          <path d="M-14-4 C-14-8 -4-8 -3-4 L-2-1 C-2 1 -14 1 -14-1 Z" fill="${shoeBase}"/>
          <path d="M-11-4 Q-8-7 -5-4" stroke="${shoeAccent}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
          <rect x="-14" y="-1.5" width="12" height="2.5" rx="1.2" fill="${shoeSole}"/>
        </g>
        <g class="character-leg right-leg">
          <path d="M6-24 C5-16 5-8 4-4 L11-4 C13-8 14-16 13-24 Z" fill="${pantsColor}"/>
          <path d="M10-24 C11-16 11-8 9-4 L11-4 C13-8 14-16 13-24 Z" fill="${pantsShadow}" opacity="0.65"/>
          <path d="M7-23 C6-16 6-8 5-5" stroke="${pantsLight}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <!-- Chunky Rounded Sneaker -->
          <path d="M3-4 C3-8 13-8 14-4 L14-1 C14 1 2 1 2-1 Z" fill="${shoeBase}"/>
          <path d="M5-4 Q8-7 11-4" stroke="${shoeAccent}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
          <rect x="2" y="-1.5" width="12" height="2.5" rx="1.2" fill="${shoeSole}"/>
        </g>

        <!-- Volumetric Torso: Rounded Casual Hoodie with clear masses -->
        <g class="character-torso">
          <!-- Main Body Mass -->
          <path d="M-16-46 C-19-38 -18-20 -14-16 C-5-13 5-13 14-16 C18-20 19-38 16-46 C11-49 -11-49 -16-46 Z" fill="${hoodieColor}"/>
          <!-- Volumetric Left Side Core Shadow -->
          <path d="M-16-46 C-19-38 -18-20 -14-16 L-9-15 C-13-20 -14-38 -11-45 Z" fill="${hoodieShadow}" opacity="0.75"/>
          <!-- Subtle Right Top Light Rim -->
          <path d="M11-45 C14-38 13-20 9-15 L14-16 C18-20 19-38 16-46 Z" fill="${hoodieLight}" opacity="0.5"/>
          <!-- Elastic Hem Band -->
          <path d="M-14-16 Q0-13 14-16 L13-19 Q0-16 -13-19 Z" fill="${hoodieShadow}"/>
          <!-- Hood Collar Cushion & Strings -->
          <path d="M-8-47 Q0-41 8-47 Q0-44 -8-47" fill="${hoodieShadow}"/>
          <path d="M-7-46 Q0-40 7-46" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M-3-40 L-3-28 M3-40 L3-28" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
          <circle cx="-3" cy="-27.5" r="1.4" fill="#cbd5e1"/>
          <circle cx="3" cy="-27.5" r="1.4" fill="#cbd5e1"/>
          <!-- Big Kangaroo Pocket Mass -->
          <path d="M-8-26 Q0-24 8-26 L7-18 Q0-16 -7-18 Z" fill="${hoodieLight}" fill-opacity="0.35" stroke="${hoodieShadow}" stroke-width="1.2"/>
        </g>

        <!-- Arms with Defined Shoulders and Clearly Visible Mitt Hands -->
        <g class="character-arms">
          <g class="character-arm arm-left">
            <path d="M-14-43 C-19-38 -21-30 -19-24" stroke="${hoodieColor}" stroke-width="9.5" stroke-linecap="round" fill="none"/>
            <path d="M-16-42 C-21-37 -23-30 -21-24" stroke="${hoodieShadow}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
            <!-- Visible Volumetric Hand with Thumb -->
            <ellipse cx="-19" cy="-20" rx="5.2" ry="4.8" fill="${skinColor}"/>
            <circle cx="-19" cy="-20" r="4.8" fill="${skinShadow}" opacity="0.25"/>
            <!-- Thumb pointing inward -->
            <path d="M-16-22 C-14-22 -14-19 -16-19 Z" fill="${skinColor}"/>
          </g>
          <g class="character-arm arm-right">
            <path d="M14-43 C19-38 21-30 19-24" stroke="${hoodieColor}" stroke-width="9.5" stroke-linecap="round" fill="none"/>
            <path d="M13-42 C18-37 19-30 17-24" stroke="${hoodieLight}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
            <!-- Visible Volumetric Hand with Thumb -->
            <ellipse cx="19" cy="-20" rx="5.2" ry="4.8" fill="${skinColor}"/>
            <circle cx="19" cy="-20" r="4.8" fill="${skinLight}" opacity="0.3"/>
            <!-- Thumb pointing inward -->
            <path d="M16-22 C14-22 14-19 16-19 Z" fill="${skinColor}"/>
          </g>
        </g>

        <!-- Solid Volumetric Head: Large, Expressive, Clean Silhouette -->
        <g class="character-head" transform-origin="0 -53">
          <!-- Wide Defined Neck -->
          <rect x="-6" y="-55" width="12" height="12" rx="4" fill="${skinColor}"/>
          <path d="M-6-55 Q0-51 6-55 L6-49 Q0-46 -6-49 Z" fill="${skinShadow}"/>

          <!-- Volumetric Face Mass -->
          <ellipse cx="0" cy="-67" rx="17.5" ry="18.5" fill="${skinColor}"/>
          <!-- Chin & Cheek Contour Shadow -->
          <path d="M-16-67 C-16-54 -5-49 0-48 C5-49 16-54 16-67 C16-52 3-47 0-47 C-3-47 -16-52 -16-67 Z" fill="${skinShadow}" opacity="0.6"/>

          <!-- Soft Warm Cheeks -->
          <ellipse cx="-11" cy="-63" rx="4" ry="2.5" fill="#f87171" fill-opacity="0.45"/>
          <ellipse cx="11" cy="-63" rx="4" ry="2.5" fill="#f87171" fill-opacity="0.45"/>

          <!-- High-Contrast Cartoon Eyes: Distinct, Bold, Legible at Zoom -->
          <g class="character-eyes">
            <!-- Left Eye -->
            <ellipse cx="-7" cy="-68" rx="4.5" ry="5.5" fill="#ffffff"/>
            <ellipse cx="-6.2" cy="-67.5" rx="3.2" ry="4" fill="#0f172a"/>
            <!-- Single Bold Sparkle Top-Left + Rim Light -->
            <circle cx="-7.6" cy="-69.5" r="1.6" fill="#ffffff"/>
            <circle cx="-5.2" cy="-66" r="0.8" fill="#ffffff"/>

            <!-- Right Eye -->
            <ellipse cx="7" cy="-68" rx="4.5" ry="5.5" fill="#ffffff"/>
            <ellipse cx="6.2" cy="-67.5" rx="3.2" ry="4" fill="#0f172a"/>
            <!-- Sparkles -->
            <circle cx="5" cy="-69.5" r="1.6" fill="#ffffff"/>
            <circle cx="7.2" cy="-66" r="0.8" fill="#ffffff"/>

            <!-- Bold Stylized Eyebrows -->
            <path d="M-12-76 Q-7-79 -2-76" stroke="${hairShadow}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
            <path d="M2-76 Q7-79 12-76" stroke="${hairShadow}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
          </g>

          <!-- Cute Friendly Smile -->
          <path class="character-mouth" d="M-4.5-59 Q0-55 4.5-59" stroke="#881337" stroke-width="2.4" stroke-linecap="round" fill="none"/>
          <ellipse cx="0" cy="-56.5" rx="2" ry="1" fill="#f43f5e" opacity="0.5"/>

          <!-- Strong Hair Silhouette Clumps with Clear Volume -->
          <g class="character-hair">
            <!-- Main Hair Shell -->
            <path d="M-18-68 C-22-90 0-96 18-88 C23-80 22-63 20-58 C17-66 15-74 12-76 C8-78 -8-78 -13-72 C-16-67 -18-60 -18-68 Z" fill="${hairColor}"/>
            <!-- Volumetric Shadow Underneath Bangs -->
            <path d="M-19-72 C-15-90 2-92 19-84 L17-80 C3-86 -13-84 -16-70 Z" fill="${hairShadow}" opacity="0.75"/>
            <!-- Chunky Front Bangs -->
            <path d="M-19-73 C-15-89 2-91 19-83 C16-78 11-74 6-74 C0-74 -6-77 -12-74 C-15-72 -17-69 -19-73 Z" fill="${hairColor}"/>
            <!-- Big Curved Volume Light Arc -->
            <path d="M-11-87 Q0-92 12-85" stroke="${hairLight}" stroke-width="3" stroke-linecap="round" fill="none"/>
          </g>
        </g>
      </g>
    `;

    // 2. CUSTOMER BACK VIEW
    const backView = `
      <g class="view-layer view-back" style="display:none">
        <!-- Volumetric Legs Back -->
        <g class="character-leg left-leg">
          <path d="M-13-24 C-14-16 -13-8 -11-4 L-4-4 C-5-8 -5-16 -6-24 Z" fill="${pantsColor}"/>
          <path d="M-7-23 C-6-16 -6-8 -5-5" stroke="${pantsLight}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <!-- Sneaker Back Heel -->
          <path d="M-14-4 C-14-8 -4-8 -3-4 L-2-1 C-2 1 -14 1 -14-1 Z" fill="${shoeBase}"/>
          <rect x="-10" y="-7" width="4" height="4" rx="1.5" fill="${shoeAccent}"/>
          <rect x="-14" y="-1.5" width="12" height="2.5" rx="1.2" fill="${shoeSole}"/>
        </g>
        <g class="character-leg right-leg">
          <path d="M6-24 C5-16 5-8 4-4 L11-4 C13-8 14-16 13-24 Z" fill="${pantsColor}"/>
          <path d="M10-24 C11-16 11-8 9-4 L11-4 C13-8 14-16 13-24 Z" fill="${pantsShadow}" opacity="0.65"/>
          <!-- Sneaker Back Heel -->
          <path d="M3-4 C3-8 13-8 14-4 L14-1 C14 1 2 1 2-1 Z" fill="${shoeBase}"/>
          <rect x="7" y="-7" width="4" height="4" rx="1.5" fill="${shoeAccent}"/>
          <rect x="2" y="-1.5" width="12" height="2.5" rx="1.2" fill="${shoeSole}"/>
        </g>

        <!-- Torso Back: Clean Hoodie Back with Resting Hood -->
        <g class="character-torso">
          <path d="M-16-46 C-19-38 -18-20 -14-16 C-5-13 5-13 14-16 C18-20 19-38 16-46 C11-49 -11-49 -16-46 Z" fill="${hoodieColor}"/>
          <path d="M-16-46 C-19-38 -18-20 -14-16 L-9-15 C-13-20 -14-38 -11-45 Z" fill="${hoodieShadow}" opacity="0.75"/>
          <!-- Resting Hood on Back -->
          <path d="M-13-47 C-14-36 0-31 13-47 C8-34 -8-34 -13-47 Z" fill="${hoodieShadow}"/>
          <path d="M-10-45 C-11-37 0-34 10-45" fill="none" stroke="${hoodieLight}" stroke-width="2" stroke-linecap="round"/>
          <!-- Bottom Hem -->
          <path d="M-14-16 Q0-13 14-16 L13-19 Q0-16 -13-19 Z" fill="${hoodieShadow}"/>
        </g>

        <!-- Arms Back -->
        <g class="character-arms">
          <g class="character-arm arm-left">
            <path d="M-14-43 C-19-38 -21-30 -19-24" stroke="${hoodieColor}" stroke-width="9.5" stroke-linecap="round" fill="none"/>
            <ellipse cx="-19" cy="-20" rx="5.2" ry="4.8" fill="${skinColor}"/>
          </g>
          <g class="character-arm arm-right">
            <path d="M14-43 C19-38 21-30 19-24" stroke="${hoodieColor}" stroke-width="9.5" stroke-linecap="round" fill="none"/>
            <ellipse cx="19" cy="-20" rx="5.2" ry="4.8" fill="${skinColor}"/>
          </g>
        </g>

        <!-- Head Back: Full Hair Mass without face elements -->
        <g class="character-head" transform-origin="0 -53">
          <rect x="-6" y="-55" width="12" height="12" rx="4" fill="${skinColor}"/>
          <!-- Full Rounded Hair Mass -->
          <path d="M-18-65 C-22-90 0-96 18-90 C24-80 22-57 18-52 C13-58 9-63 0-63 C-9-63 -13-58 -18-52 C-22-57 -20-61 -18-65 Z" fill="${hairColor}"/>
          <path d="M-16-72 C-19-88 0-92 16-86 L15-81 C0-87 -15-83 -15-69 Z" fill="${hairShadow}" opacity="0.65"/>
          <path d="M-11-87 Q0-92 12-85" stroke="${hairLight}" stroke-width="3" stroke-linecap="round" fill="none"/>
        </g>
      </g>
    `;

    // 3. CUSTOMER SIDE VIEW (3/4 Profile with Real Silhouette)
    const sideView = `
      <g class="view-layer view-side" style="display:none">
        <!-- Volumetric 3/4 Legs -->
        <g class="character-leg left-leg">
          <path d="M-7-24 C-9-16 -8-8 -6-4 L1-4 C0-8 0-16 -1-24 Z" fill="${pantsColor}"/>
          <path d="M-9-4 C-9-8 1-8 2-4 L3-1 C3 1 -9 1 -9-1 Z" fill="${shoeBase}"/>
          <rect x="-9" y="-1.5" width="12" height="2.5" rx="1.2" fill="${shoeSole}"/>
        </g>
        <g class="character-leg right-leg">
          <path d="M6-24 C4-16 5-8 4-4 L11-4 C13-8 13-16 12-24 Z" fill="${pantsShadow}"/>
          <path d="M2-4 C2-8 12-8 13-4 L14-1 C14 1 2 1 2-1 Z" fill="${shoeBase}"/>
          <rect x="2" y="-1.5" width="12" height="2.5" rx="1.2" fill="${shoeSole}"/>
        </g>

        <!-- Torso 3/4 Mass -->
        <g class="character-torso">
          <path d="M-12-46 C-17-38 -14-20 -11-16 C-3-13 7-13 14-16 C17-20 18-38 13-46 Z" fill="${hoodieColor}"/>
          <path d="M-12-46 C-17-38 -14-20 -11-16 L-7-15 C-10-20 -11-38 -9-45 Z" fill="${hoodieShadow}" opacity="0.75"/>
          <!-- Hoodie Kangaroo Pocket curve on side -->
          <path d="M-5-26 Q2-24 9-26 L8-18 Q1-16 -4-18 Z" fill="${hoodieLight}" fill-opacity="0.3" stroke="${hoodieShadow}" stroke-width="1.2"/>
        </g>

        <!-- Arms 3/4 -->
        <g class="character-arms">
          <g class="character-arm arm-left">
            <path d="M-7-43 C-12-38 -14-30 -12-24" stroke="${hoodieColor}" stroke-width="9.5" stroke-linecap="round" fill="none"/>
            <ellipse cx="-12" cy="-20" rx="5.2" ry="4.8" fill="${skinColor}"/>
          </g>
          <g class="character-arm arm-right">
            <path d="M9-43 C14-38 16-30 14-24" stroke="${hoodieLight}" stroke-width="9.5" stroke-linecap="round" fill="none"/>
            <ellipse cx="15" cy="-20" rx="5.2" ry="4.8" fill="${skinColor}"/>
          </g>
        </g>

        <!-- Head 3/4 Profile with Clear Nose Bridge and Bold Eye -->
        <g class="character-head" transform-origin="0 -53">
          <rect x="-4" y="-55" width="10" height="12" rx="4" fill="${skinColor}"/>
          <ellipse cx="3" cy="-67" rx="16.5" ry="18" fill="${skinColor}"/>
          <!-- Volumetric Nose & Cheek Profile Curve -->
          <path d="M13-68 C17-68 18-64 14-61 Z" fill="${skinColor}"/>
          <ellipse cx="7" cy="-63" rx="4" ry="2.5" fill="#f87171" fill-opacity="0.4"/>

          <!-- 3/4 Eye -->
          <g class="character-eyes">
            <ellipse cx="8" cy="-68" rx="4.5" ry="5.5" fill="#ffffff"/>
            <ellipse cx="9" cy="-67.5" rx="3.2" ry="4" fill="#0f172a"/>
            <circle cx="7.2" cy="-69.5" r="1.6" fill="#ffffff"/>
            <path d="M5-76 Q9-79 13-76" stroke="${hairShadow}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
          </g>
          <path class="character-mouth" d="M6-59 Q9-56 12-59" stroke="#881337" stroke-width="2.4" stroke-linecap="round" fill="none"/>

          <!-- 3/4 Hair Profile -->
          <g class="character-hair">
            <path d="M-15-68 C-19-90 2-96 19-86 C23-78 21-62 18-57 C13-63 7-69 0-69 C-8-69 -12-65 -15-68 Z" fill="${hairColor}"/>
            <path d="M-9-87 Q3-92 13-85" stroke="${hairLight}" stroke-width="3" stroke-linecap="round" fill="none"/>
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
  // STAFF V3 VECTOR ART (Volumetric Cartoon)
  // ==========================================
  function createStaffV3Art(p) {
    const skinColor = p.skin || '#d9a77d';
    const skinShadow = shadeColor(skinColor, -16);
    const skinLight = shadeColor(skinColor, 12);

    const hairColor = p.hairColor || '#2c3437';
    const hairShadow = shadeColor(hairColor, -22);
    const hairLight = shadeColor(hairColor, 16);

    const brandColor = (typeof ShopIdentity !== 'undefined' && ShopIdentity.colors && ShopIdentity.colors[ShopIdentity.current?.color]) || '#3b8272';
    const brandShadow = shadeColor(brandColor, -24);
    const brandLight = shadeColor(brandColor, 18);

    const apronColor = '#f5eedb';
    const apronShadow = '#ded0b5';
    const apronLight = '#fffdf7';

    const pantsColor = '#1e293b';
    const pantsShadow = shadeColor(pantsColor, -20);
    const pantsLight = shadeColor(pantsColor, 14);

    const shoeBase = '#0f172a';
    const shoeSole = '#475569';

    // Ambient Occlusion Shadow
    const shadowMarkup = `
      <ellipse cy="2" rx="22" ry="9.5" fill="#152620" fill-opacity="0.30"/>
      <ellipse cy="1.5" rx="15" ry="6" fill="#0b1713" fill-opacity="0.24"/>
    `;

    // 1. STAFF FRONT VIEW
    const frontView = `
      <g class="view-layer view-front">
        <!-- Volumetric Trousers & Heavy Duty Boots -->
        <g class="character-leg left-leg">
          <path d="M-13-24 C-14-16 -13-8 -11-4 L-4-4 C-5-8 -5-16 -6-24 Z" fill="${pantsColor}"/>
          <path d="M-13-24 C-14-16 -13-8 -11-4 L-9-4 C-11-8 -11-16 -10-24 Z" fill="${pantsShadow}" opacity="0.7"/>
          <path d="M-7-23 C-6-16 -6-8 -5-5" stroke="${pantsLight}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <!-- Sturdy Work Boot -->
          <path d="M-15-4 C-15-8 -4-8 -3-4 L-2-1 C-2 1 -15 1 -15-1 Z" fill="${shoeBase}"/>
          <rect x="-15" y="-1.5" width="13" height="2.5" rx="1.2" fill="${shoeSole}"/>
        </g>
        <g class="character-leg right-leg">
          <path d="M6-24 C5-16 5-8 4-4 L11-4 C13-8 14-16 13-24 Z" fill="${pantsColor}"/>
          <path d="M10-24 C11-16 11-8 9-4 L11-4 C13-8 14-16 13-24 Z" fill="${pantsShadow}" opacity="0.7"/>
          <path d="M7-23 C6-16 6-8 5-5" stroke="${pantsLight}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <!-- Sturdy Work Boot -->
          <path d="M3-4 C3-8 14-8 15-4 L15-1 C15 1 3 1 3-1 Z" fill="${shoeBase}"/>
          <rect x="3" y="-1.5" width="13" height="2.5" rx="1.2" fill="${shoeSole}"/>
        </g>

        <!-- Torso: Brand Uniform Polo + Sturdy Tycoon Apron -->
        <g class="character-torso">
          <!-- Polo Body Base -->
          <path d="M-17-46 C-20-38 -19-20 -15-16 C-5-13 5-13 15-16 C19-20 20-38 17-46 C12-49 -12-49 -17-46 Z" fill="${brandColor}"/>
          <path d="M-17-46 C-20-38 -19-20 -15-16 L-10-15 C-14-20 -15-38 -12-45 Z" fill="${brandShadow}" opacity="0.75"/>
          <!-- Crisp Volumetric White Collar -->
          <path d="M-8-46 L0-40 L8-46 L5-48 L0-44 L-5-48 Z" fill="#ffffff"/>
          <path d="M-1-44 L1-44 L0-40 Z" fill="${brandShadow}"/>

          <!-- Full Utility Apron (Large Mass, Clear Separation) -->
          <path d="M-12-40 L12-40 L14-17 L-14-17 Z" fill="${apronColor}" stroke="${apronShadow}" stroke-width="1.2"/>
          <path d="M-12-40 L-14-17 L-10-17 L-8-40 Z" fill="${apronShadow}" opacity="0.6"/>
          <!-- Apron Leather Straps -->
          <path d="M-9-46 L-9-40 M9-46 L9-40" stroke="#a16207" stroke-width="2.6" stroke-linecap="round"/>

          <!-- High-Contrast Front Utility Pocket -->
          <path d="M-7-29 H7 V-19 H-7 Z" fill="#ede3c7" stroke="${apronShadow}" stroke-width="1.2"/>
          <!-- Aquarist Tool: Aquatic Scraper / Hand Net Clip -->
          <line x1="-3" y1="-32" x2="-3" y2="-25" stroke="#0284c7" stroke-width="2.8" stroke-linecap="round"/>
          <line x1="3" y1="-33" x2="3" y2="-25" stroke="#ea580c" stroke-width="2.8" stroke-linecap="round"/>

          <!-- Official Store Employee Badge -->
          <g class="staff-badge" transform="translate(5 -38) scale(0.26)">
            <rect x="-8" y="-6" width="32" height="24" rx="4" fill="#ffffff" stroke="#64748b" stroke-width="2"/>
            <circle cx="0" cy="6" r="6" fill="${brandColor}"/>
            <rect x="9" y="2" width="13" height="3.5" fill="#334155" rx="1.5"/>
            <rect x="9" y="8" width="9" height="3" fill="#64748b" rx="1.5"/>
          </g>
        </g>

        <!-- Arms with Rolled Sleeves and Large Solid Hands -->
        <g class="character-arms">
          <g class="character-arm arm-left">
            <!-- Sleeve -->
            <path d="M-15-43 C-20-38 -21-32 -19-28" stroke="${brandColor}" stroke-width="9.5" stroke-linecap="round" fill="none"/>
            <path d="M-21-29 L-17-27" stroke="${brandLight}" stroke-width="2.8" stroke-linecap="round"/>
            <!-- Forearm -->
            <path d="M-19-28 L-19-21" stroke="${skinColor}" stroke-width="8" stroke-linecap="round"/>
            <!-- Solid Hand with Thumb -->
            <ellipse cx="-19" cy="-18" rx="5.2" ry="4.8" fill="${skinColor}"/>
            <circle cx="-19" cy="-18" r="4.8" fill="${skinShadow}" opacity="0.25"/>
            <path d="M-16-20 C-14-20 -14-17 -16-17 Z" fill="${skinColor}"/>
          </g>
          <g class="character-arm arm-right">
            <!-- Sleeve -->
            <path d="M15-43 C20-38 21-32 19-28" stroke="${brandColor}" stroke-width="9.5" stroke-linecap="round" fill="none"/>
            <path d="M17-27 L21-29" stroke="${brandLight}" stroke-width="2.8" stroke-linecap="round"/>
            <!-- Forearm -->
            <path d="M19-28 L19-21" stroke="${skinColor}" stroke-width="8" stroke-linecap="round"/>
            <!-- Solid Hand with Thumb -->
            <ellipse cx="19" cy="-18" rx="5.2" ry="4.8" fill="${skinColor}"/>
            <circle cx="19" cy="-18" r="4.8" fill="${skinLight}" opacity="0.3"/>
            <path d="M16-20 C14-20 14-17 16-17 Z" fill="${skinColor}"/>
          </g>
        </g>

        <!-- Staff Head with Official Cap/Visor & Confident Cartoon Face -->
        <g class="character-head" transform-origin="0 -53">
          <!-- Defined Neck -->
          <rect x="-6" y="-55" width="12" height="12" rx="4" fill="${skinColor}"/>
          <path d="M-6-55 Q0-51 6-55 L6-49 Q0-46 -6-49 Z" fill="${skinShadow}"/>

          <!-- Face Mass -->
          <ellipse cx="0" cy="-67" rx="17.5" ry="18.5" fill="${skinColor}"/>
          <path d="M-16-67 C-16-54 -5-49 0-48 C5-49 16-54 16-67 C16-52 3-47 0-47 C-3-47 -16-52 -16-67 Z" fill="${skinShadow}" opacity="0.6"/>

          <ellipse cx="-11" cy="-63" rx="3.8" ry="2.2" fill="#fb923c" fill-opacity="0.4"/>
          <ellipse cx="11" cy="-63" rx="3.8" ry="2.2" fill="#fb923c" fill-opacity="0.4"/>

          <!-- High-Contrast Friendly Eyes -->
          <g class="character-eyes">
            <ellipse cx="-7" cy="-67.5" rx="4.2" ry="5.2" fill="#ffffff"/>
            <ellipse cx="-6.2" cy="-67" rx="3" ry="3.8" fill="#14532d"/>
            <circle cx="-7.5" cy="-69" r="1.5" fill="#ffffff"/>

            <ellipse cx="7" cy="-67.5" rx="4.2" ry="5.2" fill="#ffffff"/>
            <ellipse cx="6.2" cy="-67" rx="3" ry="3.8" fill="#14532d"/>
            <circle cx="5" cy="-69" r="1.5" fill="#ffffff"/>

            <path d="M-11-75 Q-6-78 -2-75" stroke="${hairShadow}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
            <path d="M2-75 Q6-78 11-75" stroke="${hairShadow}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
          </g>

          <path class="character-mouth" d="M-5-59 Q0-54 5-59" stroke="#7f1d1d" stroke-width="2.4" stroke-linecap="round" fill="#ffffff"/>

          <!-- Official Store Cap / Visor with Dimensional Peak -->
          <g class="character-cap">
            <!-- Back Hair Trim -->
            <path d="M-17-64 Q-19-79 -11-85 Q11-85 18-77 Q19-64 17-58" fill="${hairColor}"/>
            <!-- Cap Dome (Brand Tone) -->
            <path d="M-18-73 C-18-90 0-96 18-90 C20-81 20-73 18-71 Z" fill="${brandColor}"/>
            <path d="M-18-73 C-18-90 0-96 18-90 L16-86 C0-91 -16-86 -16-71 Z" fill="${brandLight}" opacity="0.6"/>
            <!-- Sturdy Visor Peak with Underneath Shadow -->
            <path d="M-18-72 Q0-79 20-70 L24-69 Q0-76 -17-71 Z" fill="${brandShadow}" stroke="#0f291e" stroke-width="1"/>
            <!-- Golden Store Fish Pin / Emblem -->
            <circle cx="0" cy="-81" r="3.6" fill="#fef08a" stroke="${brandShadow}" stroke-width="0.8"/>
            <circle cx="0" cy="-81" r="1.8" fill="${brandColor}"/>
          </g>
        </g>
      </g>
    `;

    // 2. STAFF BACK VIEW
    const backView = `
      <g class="view-layer view-back" style="display:none">
        <!-- Volumetric Trousers Back -->
        <g class="character-leg left-leg">
          <path d="M-13-24 C-14-16 -13-8 -11-4 L-4-4 C-5-8 -5-16 -6-24 Z" fill="${pantsColor}"/>
          <path d="M-7-23 C-6-16 -6-8 -5-5" stroke="${pantsLight}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <path d="M-15-4 C-15-8 -4-8 -3-4 L-2-1 C-2 1 -15 1 -15-1 Z" fill="${shoeBase}"/>
          <rect x="-15" y="-1.5" width="13" height="2.5" rx="1.2" fill="${shoeSole}"/>
        </g>
        <g class="character-leg right-leg">
          <path d="M6-24 C5-16 5-8 4-4 L11-4 C13-8 14-16 13-24 Z" fill="${pantsColor}"/>
          <path d="M10-24 C11-16 11-8 9-4 L11-4 C13-8 14-16 13-24 Z" fill="${pantsShadow}" opacity="0.7"/>
          <path d="M3-4 C3-8 14-8 15-4 L15-1 C15 1 3 1 3-1 Z" fill="${shoeBase}"/>
          <rect x="3" y="-1.5" width="13" height="2.5" rx="1.2" fill="${shoeSole}"/>
        </g>

        <!-- Torso Back: Uniform Polo + Crossed Apron Straps & Bow -->
        <g class="character-torso">
          <path d="M-17-46 C-20-38 -19-20 -15-16 C-5-13 5-13 15-16 C19-20 20-38 17-46 C12-49 -12-49 -17-46 Z" fill="${brandColor}"/>
          <path d="M-17-46 C-20-38 -19-20 -15-16 L-10-15 C-14-20 -15-38 -12-45 Z" fill="${brandShadow}" opacity="0.75"/>
          <!-- Crossed Apron Straps in Back -->
          <path d="M-11-40 L11-22 M11-40 L-11-22" stroke="${apronColor}" stroke-width="2.6"/>
          <path d="M-11-40 L11-22 M11-40 L-11-22" stroke="${apronShadow}" stroke-width="1"/>
          <!-- Apron Bow/Knot at Waist -->
          <circle cx="0" cy="-21" r="2.6" fill="${apronColor}" stroke="${apronShadow}" stroke-width="1"/>
          <path d="M-2-20 L-5-14 M2-20 L5-14" stroke="${apronColor}" stroke-width="2.4" stroke-linecap="round"/>
        </g>

        <!-- Arms Back -->
        <g class="character-arms">
          <g class="character-arm arm-left">
            <path d="M-15-43 C-20-38 -21-32 -19-28" stroke="${brandColor}" stroke-width="9.5" stroke-linecap="round" fill="none"/>
            <path d="M-19-28 L-19-21" stroke="${skinColor}" stroke-width="8" stroke-linecap="round"/>
            <ellipse cx="-19" cy="-18" rx="5.2" ry="4.8" fill="${skinColor}"/>
          </g>
          <g class="character-arm arm-right">
            <path d="M15-43 C20-38 21-32 19-28" stroke="${brandColor}" stroke-width="9.5" stroke-linecap="round" fill="none"/>
            <path d="M19-28 L19-21" stroke="${skinColor}" stroke-width="8" stroke-linecap="round"/>
            <ellipse cx="19" cy="-18" rx="5.2" ry="4.8" fill="${skinColor}"/>
          </g>
        </g>

        <!-- Head Back: Cap Dome + Sizing Strap + Neck Hair -->
        <g class="character-head" transform-origin="0 -53">
          <rect x="-6" y="-55" width="12" height="12" rx="4" fill="${skinColor}"/>
          <!-- Neck Hair -->
          <path d="M-16-63 C-17-73 0-77 16-73 C17-63 15-56 13-53 C7-56 -7-56 -13-53 Z" fill="${hairColor}"/>
          <!-- Cap Back Dome -->
          <path d="M-18-72 C-18-90 0-96 18-90 C20-82 20-74 18-70 Z" fill="${brandColor}"/>
          <!-- Keyhole Cutout & Adjustment Strap -->
          <path d="M-5-71 Q0-76 5-71 Z" fill="${hairColor}"/>
          <path d="M-6-70 L6-70" stroke="#fef08a" stroke-width="2.2" stroke-linecap="round"/>
        </g>
      </g>
    `;

    // 3. STAFF SIDE VIEW (3/4 Profile)
    const sideView = `
      <g class="view-layer view-side" style="display:none">
        <g class="character-leg left-leg">
          <path d="M-7-24 C-9-16 -8-8 -6-4 L1-4 C0-8 0-16 -1-24 Z" fill="${pantsColor}"/>
          <path d="M-9-4 C-9-8 1-8 2-4 L3-1 C3 1 -9 1 -9-1 Z" fill="${shoeBase}"/>
          <rect x="-9" y="-1.5" width="12" height="2.5" rx="1.2" fill="${shoeSole}"/>
        </g>
        <g class="character-leg right-leg">
          <path d="M6-24 C4-16 5-8 4-4 L11-4 C13-8 13-16 12-24 Z" fill="${pantsShadow}"/>
          <path d="M2-4 C2-8 12-8 13-4 L14-1 C14 1 2 1 2-1 Z" fill="${shoeBase}"/>
          <rect x="2" y="-1.5" width="12" height="2.5" rx="1.2" fill="${shoeSole}"/>
        </g>

        <!-- Torso 3/4 -->
        <g class="character-torso">
          <path d="M-13-46 C-18-38 -15-20 -12-16 C-4-13 6-13 13-16 C16-20 17-38 13-46 Z" fill="${brandColor}"/>
          <path d="M-10-40 L12-40 L13-17 L-10-17 Z" fill="${apronColor}" stroke="${apronShadow}" stroke-width="1.2"/>
          <line x1="3" y1="-32" x2="3" y2="-25" stroke="#0284c7" stroke-width="2.8" stroke-linecap="round"/>
        </g>

        <!-- Arms 3/4 -->
        <g class="character-arms">
          <g class="character-arm arm-left">
            <path d="M-7-43 C-12-38 -14-32 -12-28" stroke="${brandColor}" stroke-width="9.5" stroke-linecap="round" fill="none"/>
            <path d="M-12-28 L-13-21" stroke="${skinColor}" stroke-width="8" stroke-linecap="round"/>
            <ellipse cx="-13" cy="-18" rx="5.2" ry="4.8" fill="${skinColor}"/>
          </g>
          <g class="character-arm arm-right">
            <path d="M9-43 C14-38 16-32 14-28" stroke="${brandLight}" stroke-width="9.5" stroke-linecap="round" fill="none"/>
            <path d="M14-28 L15-21" stroke="${skinColor}" stroke-width="8" stroke-linecap="round"/>
            <ellipse cx="16" cy="-18" rx="5.2" ry="4.8" fill="${skinColor}"/>
          </g>
        </g>

        <!-- Head 3/4 Profile with Visor Peak -->
        <g class="character-head" transform-origin="0 -53">
          <rect x="-4" y="-55" width="10" height="12" rx="4" fill="${skinColor}"/>
          <ellipse cx="3" cy="-67" rx="16.5" ry="18" fill="${skinColor}"/>
          <ellipse cx="7" cy="-63" rx="3.8" ry="2.2" fill="#fb923c" fill-opacity="0.4"/>
          <g class="character-eyes">
            <ellipse cx="8" cy="-67.5" rx="4.2" ry="5.2" fill="#ffffff"/>
            <ellipse cx="9" cy="-67" rx="3" ry="3.8" fill="#14532d"/>
            <circle cx="7.2" cy="-69" r="1.5" fill="#ffffff"/>
            <path d="M5-75 Q9-78 13-75" stroke="${hairShadow}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
          </g>
          <path class="character-mouth" d="M6-59 Q9-55 12-59" stroke="#7f1d1d" stroke-width="2.4" stroke-linecap="round" fill="#ffffff"/>

          <!-- Cap 3/4 with Forward Visor -->
          <g class="character-cap">
            <path d="M-14-73 C-14-90 2-96 16-90 C18-82 18-74 15-72 Z" fill="${brandColor}"/>
            <path d="M3-73 L24-69 L17-66 L3-70 Z" fill="${brandShadow}" stroke="#0f291e" stroke-width="1"/>
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

  function rebuildNodeForV3(node) {
    node.classList.remove('character-prototype-v1', 'character-prototype-v2');
    node.classList.add('character-prototype-v3');
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
    const artMarkup = isStaff ? createStaffV3Art(p) : createCustomerV3Art(p);
    const markMarkup = (typeof ShopIdentity !== 'undefined' && ShopIdentity.mark)
      ? ShopIdentity.mark().replace(/^<svg[^>]*>|<\/svg>$/g, '')
      : '';
    const brandColor = (typeof ShopIdentity !== 'undefined' && ShopIdentity.colors && ShopIdentity.colors[ShopIdentity.current?.color]) || '#3b8272';

    node.innerHTML = `
      <g class="character-body">
        <g class="character-model">
          <path class="character-swatch" d="M0 0" fill="${brandColor}" style="display:none;"/>
          ${artMarkup}
          <!-- Transport / Purchase Bag (Clearly held by hand, separated from torso) -->
          <g class="purchase-bag" transform="translate(19 -22)" style="display:none">
            <!-- Clear Top Handle grasped right at hand level -->
            <path d="M0 0 V-6 Q7-14 14-6 V0" fill="none" stroke="#92400e" stroke-width="2.6" stroke-linecap="round"/>
            <!-- Bag Body with Clean Dimensions -->
            <path d="M-3-1 H17 L20 24 H-4 Z" fill="#fef3c7" stroke="#d97706" stroke-width="1.4"/>
            <g><svg class="brand-badge" x="2" y="3" width="13" height="13" viewBox="0 0 64 64">${markMarkup}</svg></g>
          </g>
        </g>
      </g>
      <!-- Interactive & Reactive Thought Bubble -->
      <g class="visitor-bubble" transform="translate(-55 -122)">
        <rect width="110" height="28" rx="11" fill="#0f172a" stroke="#38bdf8" stroke-width="1.4" opacity="0.94"/>
        <polygon points="51,28 55,34 59,28" fill="#0f172a"/>
        <text x="55" y="18" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700" font-family="system-ui, sans-serif"></text>
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
  // PROTOTYPE V3 RENDERER IMPLEMENTATION
  // ==========================================
  const prototypeV3Renderer = {
    id: 'prototype-v3',

    create({ id, seed, profile: p, role }) {
      const doc = typeof document !== 'undefined' ? document : null;
      if (!doc) return null;

      const node = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
      node.classList.add(role === 'staff' ? 'live-worker' : 'live-visitor');
      node.classList.add('character-prototype-v3');
      node.dataset.visitorId = id;
      node.dataset.seed = seed;
      node.dataset.profile = JSON.stringify(p);
      node.dataset.role = role;
      node.dataset.archetype = p.archetype || (role === 'staff' ? 'staff' : 'casual');
      node.setAttribute('role', 'button');
      node.setAttribute('tabindex', '0');

      const isStaff = role === 'staff' || String(id).startsWith('staff-') || Number(id) >= 10000;
      const artMarkup = isStaff ? createStaffV3Art(p) : createCustomerV3Art(p);

      const markMarkup = (typeof ShopIdentity !== 'undefined' && ShopIdentity.mark)
        ? ShopIdentity.mark().replace(/^<svg[^>]*>|<\/svg>$/g, '')
        : '';
      const brandColor = (typeof ShopIdentity !== 'undefined' && ShopIdentity.colors && ShopIdentity.colors[ShopIdentity.current?.color]) || '#3b8272';

      node.innerHTML = `
        <g class="character-body">
          <g class="character-model">
            <path class="character-swatch" d="M0 0" fill="${brandColor}" style="display:none;"/>
            ${artMarkup}
            <!-- Transport / Purchase Bag (Clearly held by hand, separated from torso) -->
            <g class="purchase-bag" transform="translate(19 -22)" style="display:none">
              <!-- Clear Top Handle grasped right at hand level -->
              <path d="M0 0 V-6 Q7-14 14-6 V0" fill="none" stroke="#92400e" stroke-width="2.6" stroke-linecap="round"/>
              <!-- Bag Body with Clean Dimensions -->
              <path d="M-3-1 H17 L20 24 H-4 Z" fill="#fef3c7" stroke="#d97706" stroke-width="1.4"/>
              <g><svg class="brand-badge" x="2" y="3" width="13" height="13" viewBox="0 0 64 64">${markMarkup}</svg></g>
            </g>
          </g>
        </g>
        <!-- Interactive & Reactive Thought Bubble -->
        <g class="visitor-bubble" transform="translate(-55 -122)">
          <rect width="110" height="28" rx="11" fill="#0f172a" stroke="#38bdf8" stroke-width="1.4" opacity="0.94"/>
          <polygon points="51,28 55,34 59,28" fill="#0f172a"/>
          <text x="55" y="18" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700" font-family="system-ui, sans-serif"></text>
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

      const {
        feet,
        phase,
        moving = false,
        distance = 0,
        facing = 1,
        direction,
        bubble,
        result,
        label = ''
      } = pose;

      // Position in isometric room coordinates (synchronous with V1/V2 and floor grid)
      if (feet && typeof feet.x === 'number' && typeof feet.y === 'number') {
        node.setAttribute('transform', 'translate(' + feet.x + ' ' + feet.y + ')');
      }
      if (phase) node.dataset.phase = phase;
      if (result) node.dataset.result = result;
      node.dataset.animState = animState;
      if (label) node.setAttribute('aria-label', label);

      // Rebuild node layers if transitioning from another renderer or missing V3 views
      if (!node.classList.contains('character-prototype-v3') || !node.querySelector('.view-front')) {
        rebuildNodeForV3(node);
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

      // Gait & Natural Volumetric Bounce Physics
      const isWalking = (
        animState === STATES.WALK ||
        animState === STATES.FETCH ||
        animState === STATES.TRANSPORT_STOCK ||
        (moving && !reduced)
      );

      // Controlled step frequency and subtle organic hop giving weight (1.6px bounce)
      const stepFreq = isStaff ? 11 : 9.5;
      const walkCycle = isWalking && !reduced ? Math.sin(distance * stepFreq) : 0;
      const verticalHop = isWalking && !reduced ? Math.abs(Math.cos(distance * stepFreq)) * 1.6 : 0;
      const mirror = facing < 0 ? -1 : 1;

      // Root body transform: bounce + flip facing
      const body = node.querySelector('.character-body');
      if (body) {
        body.setAttribute('transform', `translate(0 ${-verticalHop}) scale(${mirror} 1)`);
      }

      // Active view node to animate limbs
      const activeView = (heading === 'back' ? backEl : heading === 'side' ? sideEl : frontEl) || node;

      // Legs swing naturally with alternating rhythm
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
        if (armLeft) armLeft.setAttribute('transform', `rotate(${-walkCycle * 15} -14 -43)`);
        if (armRight) armRight.setAttribute('transform', `rotate(${walkCycle * 15} 14 -43)`);
      } else {
        // Contextual stationary arm poses
        if (animState === STATES.LOOK || phase === 'browsing') {
          // Hand on chin / observing aquarium
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-28 -14 -43)');
          if (armRight) armRight.setAttribute('transform', 'rotate(8 14 -43)');
        } else if (animState === STATES.CHECKOUT || animState === STATES.SERVE_TILL || phase === 'checkout') {
          // Reaching forward to counter / till
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-22 -14 -43)');
          if (armRight) armRight.setAttribute('transform', 'rotate(-15 14 -43)');
        } else if (animState === STATES.PICK || animState === STATES.RESTOCK || phase === 'collecting-stock' || phase === 'restocking') {
          // Reaching up to shelves / handling merchandise
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-38 -14 -43)');
          if (armRight) armRight.setAttribute('transform', 'rotate(-38 14 -43)');
        } else if (animState === STATES.PREPARE || phase === 'preparing-fish' || phase === 'preparing-product') {
          // Working with hands close to center
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-26 -14 -43)');
          if (armRight) armRight.setAttribute('transform', 'rotate(20 14 -43)');
        } else if (animState === STATES.REACT_POSITIVE) {
          // Raised happy arms
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-60 -14 -43)');
          if (armRight) armRight.setAttribute('transform', 'rotate(60 14 -43)');
        } else if (animState === STATES.WAIT || animState === STATES.REACT_NEGATIVE) {
          if (armLeft) armLeft.setAttribute('transform', 'rotate(-10 -14 -43)');
          if (armRight) armRight.setAttribute('transform', 'rotate(10 14 -43)');
        } else {
          if (armLeft) armLeft.setAttribute('transform', '');
          if (armRight) armRight.setAttribute('transform', '');
        }
      }

      // Expressive head tilting & nodding
      const head = activeView.querySelector('.character-head');
      if (head) {
        if (animState === STATES.LOOK || phase === 'browsing') {
          head.setAttribute('transform', 'rotate(8 0 -53)');
        } else if (animState === STATES.CHECKOUT || animState === STATES.SERVE_TILL || phase === 'checkout') {
          head.setAttribute('transform', 'rotate(4 0 -53)');
        } else if (animState === STATES.REACT_POSITIVE) {
          head.setAttribute('transform', 'rotate(-5 0 -53) scale(1.04)');
        } else if (animState === STATES.REACT_NEGATIVE) {
          head.setAttribute('transform', 'rotate(8 0 -53)');
        } else if (animState === STATES.PREPARE) {
          head.setAttribute('transform', 'rotate(5 0 -53)');
        } else {
          head.setAttribute('transform', '');
        }
      }

      // Purchase bag & Transport items (Fish Transport Visual Identity)
      const bag = node.querySelector('.purchase-bag');
      if (bag) {
        const shouldShow = (result === 'sale' || animState === STATES.CARRY || pose.carry);
        bag.style.display = shouldShow ? '' : 'none';
        const fishCatalog = (typeof ShopFish !== 'undefined' && ShopFish.catalog) || (typeof window !== 'undefined' && window.ShopFish && window.ShopFish.catalog);
        const fishBagFn = (typeof ShopFish !== 'undefined' && ShopFish.bag) || (typeof window !== 'undefined' && window.ShopFish && window.ShopFish.bag);
        if (shouldShow && pose.product && fishCatalog && fishCatalog[pose.product]) {
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
  ShopCharacters.registerRenderer('prototype-v3', prototypeV3Renderer);

  // Return public module interface
  return {
    id: 'prototype-v3',
    renderer: prototypeV3Renderer,
    createCustomerV3Art,
    createStaffV3Art,
    resolveDirectionHeading,
    enable() {
      return ShopCharacters.setRenderer('prototype-v3');
    },
    disable() {
      return ShopCharacters.setRenderer('svg-isometric');
    },
    isCurrent() {
      return ShopCharacters.getActiveRendererName() === 'prototype-v3';
    }
  };
});
