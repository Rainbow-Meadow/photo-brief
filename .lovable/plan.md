I visually confirmed the desktop overlap: the hero media column is laid out as if it is only 520px tall, but the portrait before/after slider renders taller than that and its caption/BrandMark overflow into the marquee band.

Plan:

1. Fix the root layout bug in `src/pages/Landing.tsx`
   - Remove the `lg:max-h-[520px]` constraint from the hero image wrapper.
   - Replace it with a real responsive width cap for the portrait slider so the browser reserves the full rendered height instead of letting it overflow.
   - Keep the hero image on the right and preserve the existing before/after slider behavior.

2. Tighten the desktop media sizing
   - Reduce the desktop hero image max width enough that the portrait frame, caption, and logo fit cleanly above the marquee.
   - Keep the current mobile behavior unchanged unless the existing responsive classes naturally apply.

3. Preserve the slimmer marquee band
   - Leave the current thin marquee styling in place.
   - Adjust only the top spacing if needed after the media wrapper is fixed, so the band starts below the fully measured hero content.

4. Verify visually
   - Re-check `/` at desktop widths around 1280–1366px.
   - Confirm no slider, caption, or BrandMark content intersects the marquee text or band.