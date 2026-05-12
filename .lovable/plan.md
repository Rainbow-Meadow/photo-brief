I reproduced it in the browser at the current 1217×887 viewport: the dot rail works, but the deck does not lock. A small wheel scroll jumps from Research to Mechanism instead of pinning Research while the next slide lifts over it. The current implementation is still just native smooth document scrolling with `position: sticky`, and it is not producing the intended slide-lock behavior.

Plan:

1. Replace the landing deck behavior in `SlideStack`
   - Keep the same slide content and dot rail.
   - Stop relying on each individual slide being `position: sticky`.
   - Make the deck a tall scroll region and pin one viewport-height stage inside it.
   - Translate the slide stack vertically inside that pinned stage based on scroll progress, so one slide is locked in place and the next slide visibly slides over it.

2. Remove smooth-scroll interference for deck jumps
   - Change dot rail navigation for this component from `scrollIntoView({ behavior: "smooth" })` to precise `window.scrollTo(...)` positions for each slide stop.
   - This makes the rail land on deterministic slide positions instead of letting Lenis/native smooth scrolling pick intermediate positions.

3. Update the deck CSS to match the new model
   - `.pb-deck` becomes the scroll track with height based on slide count.
   - Add a pinned viewport stage inside the deck.
   - Position slides absolutely in the stage and animate them with transforms.
   - Preserve reduced-motion behavior by falling back to normal stacked sections.

4. Manually verify before saying it is fixed
   - Test `/` in the browser at the user’s current desktop viewport.
   - Scroll through Hero → Proof → Research → Mechanism and confirm the active slide stays pinned while the next slide moves over it.
   - Click dot rail buttons and confirm they jump to the correct locked slide positions.
   - Check console for new errors/warnings caused by this change.