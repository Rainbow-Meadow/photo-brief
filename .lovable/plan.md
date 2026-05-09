# Center the wordmark over the phone

Right now the right column uses `items-end` at `lg`, so the wordmark snaps to the right edge of the column while the phone illustration (which has its own `lg:scale-110 lg:translate-x-2` offset and a much larger rendered width) sits slightly inboard. The two pieces share an edge but not a center.

## Fix

Wrap the wordmark in a container that matches the phone illustration's bounding box, then center the wordmark inside that wrapper. That way the wordmark's horizontal center always tracks the phone's center, regardless of viewport width or the phone's `translate-x` nudge.

### Change (in `src/pages/Landing.tsx`, hero right column ~line 432–451)

- Right column root: keep `flex flex-col`, drop `items-center lg:items-end` → use `items-center` only, so the column itself centers its children.
- Wordmark wrapper: replace `w-full flex justify-center lg:justify-end` with a width-matched wrapper (`w-full max-w-md sm:max-w-lg lg:max-w-none flex justify-center`) that mirrors the phone's `max-w-*` ladder, plus the same `lg:translate-x-2` so the wordmark inherits the phone's horizontal offset.
- Phone wrapper: unchanged structure; it already centers within its own `max-w-*` box.

Result: at every breakpoint, the wordmark and phone share the same center line.

## Out of scope
- Sizing of the wordmark or phone illustration.
- Vertical spacing between the two.
- Any change to the left column.
