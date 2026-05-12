## Swap mechanism step illustrations

Replace the four `src/assets/rmbc/cedar/*.png` images currently imported in `src/components/marketing/MechanismGrid.tsx` with the newly uploaded transparent versions.

### Mapping
- Step 01 Research → `user-uploads://Research.png` → `src/assets/rmbc/cedar/01-research-website-analysis.png`
- Step 02 Mechanism → `user-uploads://Mechanism.png` → `src/assets/rmbc/cedar/02-capture-phone-viewfinder.png`
- Step 03 Brief → `user-uploads://Brief.png` → `src/assets/rmbc/cedar/03-brief-packet.png`
- Step 04 Close → `user-uploads://Close.png` → `src/assets/rmbc/cedar/04-close-gmail-quote.png`

### Steps
1. `code--copy` each upload over the existing asset paths (overwrite=true). Filenames stay the same so no import changes needed.
2. Since the new images are transparent (and the current container uses a cream background `bg-[hsl(var(--pb-paper-edge))]` with `object-cover`), update `MechanismGrid.tsx`:
   - Switch image to `object-contain` so the device frames aren't cropped.
   - Drop the cream fill/border/ring so the transparent PNGs sit directly on the page background — letting the floating phone/laptop/annotation style read as intended.

### Out of scope
- Copy, layout rhythm, or other sections.
