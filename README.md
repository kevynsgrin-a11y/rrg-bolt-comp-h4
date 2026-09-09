# Ride Ready Guide — Holiday Trip Cost Planner

A single-page design comp: an interactive trip cost planner for a fictional theme park's holiday season.

## What this comp demonstrates

- **Left input rail** — party size stepper, nights stepper, date-band selector (5 bands across Nov 13 – Jan 6), three product toggles (after-hours party tickets, skip-queue pass, food budget) with per-unit prices shown, and a food budget slider ($40–$160/person/day).
- **Right results panel** — a total trip cost with smooth count-up animation, a stacked bar showing where the money goes (day tickets, party nights, skip-queue, food), an honest-savings line ("The same trip costs $X less in early December"), and a per-person breakdown.
- **Season-price curve** — day tickets $134–$189, party tickets $139–$229, skip-queue $26–$34, all varying by date band. Thanksgiving and holiday-week are peaks; early December is the trough.
- **Both light and dark themes** with a 400ms cross-fade.
- **Full keyboard support** — steppers, band selector, toggles, and slider all work from the keyboard with visible focus rings.
- **prefers-reduced-motion** — count-up is instant, stacked bar does not animate, toggles do not spring, savings line does not cross-fade. Every number lands exactly.

## How to run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

## Tech

React 18 + TypeScript + Vite. Plain CSS (no Tailwind utility classes in components, no UI library). All icons are inline SVG components.
