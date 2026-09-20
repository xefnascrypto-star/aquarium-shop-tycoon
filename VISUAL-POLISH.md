# Visual polish — 2026-09-19

## Scope and isolation
Branch: codex/visual-polish-20260919. Local source snapshot: c22e25d (current local v0.13, based on published v0.12 f2501dc). The shared source folder remains untouched. No publication or merge.

The visual change is isolated in visual-polish.js and visual-polish.css, with two includes in index.html. Remove those includes and reload to recover the previous presentation. Gameplay modules and fish-art.js remain unchanged.

## Presentation
- Rounded cartoon characters: shaded faces and clothing, eyes, cheeks, shoes; preserved profiles, uniforms, animation pivots, bag and task hooks.
- Warm timber tank cabinets, layered turquoise water, teal checkout counter, detailed bottles and cartons on the existing shelves.
- Warm tiled floor, soft sage walls with trim, plant materials and receiving-package details.
- Softer mobile HUD, dialogs, action dock, contrast and keyboard focus styling.
- Existing SVG/isometric renderer retained: volumetric 2.5D treatment, no new 3D engine, downloaded assets or external fonts.

## Safety
No changes to geometry, footprints, navigation, movement speed, timing, economy, stock, suppliers, progression or persistence. Decoration is noninteractive. The render adapter retains the selectors used by fish painting, staff uniforms, stock visibility and received goods. A presentation-only sync follows the initial redraw so fish remain visible immediately after loading.

## Validation
After character/UI block: existing cargo-sales tests passed.
After furniture/room block: existing identity tests passed.
New visual-polish.test.cjs: fish visible on load, preserved character hooks, redraw leaves state byte-identical, no horizontal overflow at 320/390/768/1280 px, no browser errors. Screenshots reviewed at mobile and desktop sizes.
Full existing 21-block suite: see final result below.

Tests run against isolated localhost port 4183. External run-test.cjs changes the existing 4174 URL in memory only. NODE_PATH points to the existing installation in the shared project; no dependency files changed.

## Recovery and integration
Backup: D:\chatgpt\99_Backups\Aquarium-visual-polish-20260919\baseline.zip
Original fish-art.js SHA256: 9EC4BC729E86A18DEE37158B9BB84B48DA407D5315E30F7EE74FB2B3962497ED
Only integrate the visual commit onto the appropriate current gameplay branch. Do not cherry-pick c22e25d blindly: it records pre-existing local v0.13 work, not visual changes. The adapter depends on the current rendering hooks; future renderer changes should rerun the visual test.

## Final result — 2026-09-20
All 21 existing blocks passed. The interrupted run completed its first 19 blocks; cross-sales and cross-cargo were restarted and both exited 0. The new visual-polish test also exited 0 (22/22 blocks in total). Logs: full-suite.log and remaining-tests.log in the backup folder. Full progression reached level 10 after 1,121 sales with 12,010 coins at arrival. No functional regression or gameplay correction was required.

Manual local review at normal speed showed the updated employee with the fish bag at checkout. Desktop/mobile screenshots cover the stocked expanded shop with two employees. Remaining limitation: this is stylized SVG/2.5D art, not replacement 3D assets; future art can still replace the current character renderer. No production validation or publication was performed.
