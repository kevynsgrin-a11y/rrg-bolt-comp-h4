# POLISH MOVES — Holiday Trip Cost Planner

Five techniques used in this comp that a conservative production site typically lacks.

## 01 — Count-up that lands exactly

The total trip cost animates from the old value to the new via `requestAnimationFrame` with an `easeOutCubic` curve over 500ms. Each frame computes `Math.round(from + (target - from) * eased)`, and the final frame hard-sets the value to the exact target integer — no rounding drift, no off-by-one. A `fromRef` tracks the previous value across animations, so consecutive input changes (e.g. dragging the food slider) chain smoothly without resetting to zero. Under `prefers-reduced-motion` the counter snaps to the new value instantly with no animation.

## 02 — Keyed stacked-bar re-animation

The stacked bar is keyed by a counter that increments whenever any segment amount changes. React unmounts and remounts the bar container, so each segment replays its `barGrow` keyframe from 0% width to its target — the bar physically rebuilds on every input change. A 60ms staggered `animationDelay` per segment (based on index) makes the reflow read as a left-to-right sequence rather than a simultaneous snap. The bar only shows segment labels when the segment is wider than 8% to avoid cramped text on small slices.

## 03 — Spring-settled toggles

Each product toggle scales to 0.96 instantly on press, then springs back over 280ms with a cubic-bezier overshoot (`0.34, 1.56, 0.64, 1`) — the toggle physically responds to the tap. The toggle uses `aria-pressed` for screen-reader state, and the switch knob slides from left to right with a CSS `transform` transition. The spring is applied via a `useEffect` keyed on the `isOn` prop, using `requestAnimationFrame` to separate the instant set from the animated restore. Under reduced-motion the spring is skipped entirely — the toggle changes state with no transform.

## 04 — Cross-fading savings line

The honest-savings paragraph is keyed by a counter that increments on every text change. React unmounts the old `<p>` node and mounts a new one, which fades in from opacity 0 + 3px translateY over 300ms. The savings amount is computed from a ratio of the current date band's prices to the early-December trough prices — so the line is always honest about how much less the same trip costs in the cheapest window. When the user is already in the early-December band, the line switches to a green "you are already in the cheapest window" state with a matching border and icon colour.

## 05 — Slider with live gradient track

The food budget slider fills its track with a teal gradient up to the current value via a CSS custom property (`--slider-pct`) that the thumb position drives. The fill updates in real time as the slider moves — no JS round-trip needed for the visual, only for the number. The track uses `linear-gradient(90deg, brand-2 0%, brand-3 var(--slider-pct), bg-3 var(--slider-pct))` so the filled portion is teal and the unfilled portion is the neutral track colour. Three tick labels below (Budget $40 / Comfortable $100 / Premium $160) anchor the scale and give the slider a reference frame.
