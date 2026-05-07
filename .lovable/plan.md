
# Fix pb-card hover effect killing mobile scroll

The `.pb-card:hover` rule in `src/index.css` applies `transform: translateY(-3px)` on hover. On mobile, touch events trigger `:hover` during scrolling, causing cards to shift mid-scroll and making thumb scrolling feel janky/stuck.

The Tailwind `hoverOnlyWhenSupported` config only applies to Tailwind `hover:` utilities — this custom CSS `:hover` is unaffected.

## Fix

Wrap the `.pb-card:hover` rule in `@media (hover: hover)` so it only fires on devices with a real pointer (mouse/trackpad), not touch.

**File: `src/index.css` (line 471)**

```css
/* Before */
.pb-card:hover { transform: translateY(-3px); ... }

/* After */
@media (hover: hover) {
  .pb-card:hover { transform: translateY(-3px); ... }
}
```

One line changed, one file.
