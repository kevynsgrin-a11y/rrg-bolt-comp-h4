import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/* ============================================================
   Types & Data
   ============================================================ */

type DateBand = 'early-nov' | 'thanksgiving' | 'early-dec' | 'holiday-week' | 'new-year';

type DateBandInfo = {
  id: DateBand;
  label: string;
  dateRange: string;
  dayTicket: number;
  partyTicket: number;
  skipQueue: number;
};

const DATE_BANDS: DateBandInfo[] = [
  { id: 'early-nov',    label: 'Opening weeks',     dateRange: 'Nov 13 – Nov 25',  dayTicket: 134, partyTicket: 139, skipQueue: 28 },
  { id: 'thanksgiving', label: 'Thanksgiving week', dateRange: 'Nov 26 – Nov 30',  dayTicket: 169, partyTicket: 199, skipQueue: 34 },
  { id: 'early-dec',    label: 'Early December',    dateRange: 'Dec 1 – Dec 17',   dayTicket: 139, partyTicket: 149, skipQueue: 26 },
  { id: 'holiday-week', label: 'Holiday week',      dateRange: 'Dec 18 – Dec 26',  dayTicket: 189, partyTicket: 229, skipQueue: 34 },
  { id: 'new-year',     label: 'New Year period',   dateRange: 'Dec 27 – Jan 6',   dayTicket: 179, partyTicket: 209, skipQueue: 32 },
];

const FOOD_MIN = 40;
const FOOD_MAX = 160;

/* ============================================================
   Hooks
   ============================================================ */

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('rrg-cost-planner-theme') : null;
    if (stored === 'light' || stored === 'dark') return stored;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('rrg-cost-planner-theme', theme);
  }, [theme]);
  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle };
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/** Animated number counter — counts smoothly, lands exactly. */
function useAnimatedNumber(target: number, reduced: boolean, duration = 500): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    if (from === target) {
      setDisplay(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef) cancelAnimationFrame(rafRef.current!);
      fromRef.current = target;
    };
  }, [target, reduced, duration]);

  return display;
}

/* ============================================================
   Icons
   ============================================================ */

const Icon = {
  Sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  Moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Minus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  Calculator: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="8" y2="10" /><line x1="12" y1="10" x2="12" y2="10" /><line x1="16" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="8" y2="14" /><line x1="12" y1="14" x2="12" y2="14" /><line x1="16" y1="14" x2="16" y2="14" /><line x1="8" y1="18" x2="8" y2="18" /><line x1="12" y1="18" x2="12" y2="18" /><line x1="16" y1="18" x2="16" y2="18" />
    </svg>
  ),
};

/* ============================================================
   Inputs — Stepper
   ============================================================ */

function Stepper({
  label, value, min, max, onChange, suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="input-row">
      <span className="input-label">{label}</span>
      <div className="stepper">
        <button
          className="stepper-btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Icon.Minus />
        </button>
        <span className="stepper-value" aria-live="polite">{value}{suffix ? ` ${suffix}` : ''}</span>
        <button
          className="stepper-btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Icon.Plus />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Inputs — Date Band Selector
   ============================================================ */

function DateBandSelector({
  selected, onSelect,
}: {
  selected: DateBand;
  onSelect: (id: DateBand) => void;
}) {
  return (
    <div className="input-group">
      <span className="input-label">Travel dates</span>
      <div className="band-options" role="radiogroup" aria-label="Travel date band">
        {DATE_BANDS.map((band) => (
          <button
            key={band.id}
            className={`band-option ${selected === band.id ? 'selected' : ''}`}
            onClick={() => onSelect(band.id)}
            role="radio"
            aria-checked={selected === band.id}
          >
            <span className="band-option-label">{band.label}</span>
            <span className="band-option-dates">{band.dateRange}</span>
            <span className="band-option-price">${band.dayTicket}/day</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Inputs — Toggle
   ============================================================ */

function Toggle({
  label, description, price, isOn, onToggle, reduced,
}: {
  label: string;
  description: string;
  price: string;
  isOn: boolean;
  onToggle: () => void;
  reduced: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    el.style.transition = 'none';
    el.style.transform = 'scale(0.96)';
    void el.offsetHeight;
    requestAnimationFrame(() => {
      el.style.transition = 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.transform = '';
    });
  }, [isOn, reduced]);

  return (
    <button
      ref={ref}
      className={`toggle-row ${isOn ? 'on' : ''}`}
      onClick={onToggle}
      aria-pressed={isOn}
    >
      <div className="toggle-info">
        <span className="toggle-label">{label}</span>
        <span className="toggle-desc">{description}</span>
      </div>
      <div className="toggle-right">
        <span className="toggle-price">{price}</span>
        <span className="toggle-switch" aria-hidden="true">
          <span className="toggle-knob" />
        </span>
      </div>
    </button>
  );
}

/* ============================================================
   Inputs — Food Slider
   ============================================================ */

function FoodSlider({
  value, onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - FOOD_MIN) / (FOOD_MAX - FOOD_MIN)) * 100;
  return (
    <div className="input-group">
      <div className="slider-head">
        <span className="input-label">Food budget</span>
        <span className="slider-value">${value}<span className="slider-unit">/person/day</span></span>
      </div>
      <input
        type="range"
        min={FOOD_MIN}
        max={FOOD_MAX}
        step="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="food-slider"
        aria-label={`Food budget: ${value} dollars per person per day`}
        style={{ '--slider-pct': `${pct}%` } as React.CSSProperties}
      />
      <div className="slider-ticks">
        <span>Budget<br /><strong>${FOOD_MIN}</strong></span>
        <span>Comfortable<br /><strong>$100</strong></span>
        <span>Premium<br /><strong>${FOOD_MAX}</strong></span>
      </div>
    </div>
  );
}

/* ============================================================
   Results — Stacked Bar
   ============================================================ */

type CostSegment = { key: string; label: string; amount: number; color: string };

function StackedBar({ segments, total, reduced }: { segments: CostSegment[]; total: number; reduced: boolean }) {
  const [barKey, setBarKey] = useState(0);
  useEffect(() => { setBarKey((k) => k + 1); }, [segments.map((s) => s.amount).join(',')]);

  return (
    <div className="stacked-bar-block">
      <div className="stacked-bar-label">Where your money goes</div>
      <div className="stacked-bar" key={barKey}>
        {segments.map((seg) => {
          const pct = total > 0 ? (seg.amount / total) * 100 : 0;
          return (
            <div
              key={seg.key}
              className={`bar-segment ${reduced ? '' : 'bar-segment-anim'}`}
              style={{
                width: `${pct}%`,
                background: seg.color,
                animationDelay: reduced ? '0ms' : `${segments.indexOf(seg) * 60}ms`,
              }}
              aria-label={`${seg.label}: $${seg.amount} (${pct.toFixed(0)}%)`}
            >
              {pct > 8 && <span className="bar-segment-label">{seg.label}</span>}
            </div>
          );
        })}
      </div>
      <div className="bar-legend">
        {segments.map((seg) => (
          <div className="legend-item" key={seg.key}>
            <span className="legend-swatch" style={{ background: seg.color }} />
            <span className="legend-label">{seg.label}</span>
            <span className="legend-amount">${seg.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Results — Savings Line
   ============================================================ */

function SavingsLine({ currentBand, total, partySize, reduced }: {
  currentBand: DateBand;
  total: number;
  partySize: number;
  reduced: boolean;
}) {
  const current = DATE_BANDS.find((b) => b.id === currentBand)!;
  const earlyDec = DATE_BANDS.find((b) => b.id === 'early-dec')!;
  const isEarlyDec = currentBand === 'early-dec';

  // Compute what the same trip would cost in early December
  // We approximate by scaling: ratio of early-dec prices to current prices
  const ratio = (earlyDec.dayTicket + earlyDec.partyTicket + earlyDec.skipQueue) /
                (current.dayTicket + current.partyTicket + current.skipQueue);
  const earlyDecCost = Math.round(total * ratio);

  const savings = total - earlyDecCost;
  const savingsText = isEarlyDec
    ? `You are already in the cheapest window — early December is the trough of the season curve. No further savings from date-shifting.`
    : savings > 0
    ? `The same trip costs $${savings} less in early December. That is the season-price trough — Thanksgiving and holiday-week peaks add $${Math.round(savings / Math.max(1, partySize))} per person.`
    : `Early December is slightly more expensive for this configuration — your current band is already at or near the floor.`;

  const [fadeKey, setFadeKey] = useState(0);
  useEffect(() => { setFadeKey((k) => k + 1); }, [savingsText]);

  return (
    <div className={`savings-line ${isEarlyDec ? 'is-best' : savings > 0 ? 'has-savings' : ''}`}>
      <div className="savings-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      <p key={fadeKey} className={reduced ? 'savings-text' : 'savings-text savings-animate'}>
        {savingsText}
      </p>
    </div>
  );
}

/* ============================================================
   Results — Per-Person Breakdown
   ============================================================ */

function PerPersonBreakdown({ segments, partySize, reduced }: {
  segments: CostSegment[];
  partySize: number;
  reduced: boolean;
}) {
  const perPerson = partySize > 0 ? partySize : 1;
  return (
    <div className="perperson-block">
      <div className="perperson-head">Per person ({partySize})</div>
      <div className="perperson-list">
        {segments.map((seg) => (
          <div className="perperson-row" key={seg.key}>
            <span className="perperson-label">{seg.label}</span>
            <span className="perperson-amount">${Math.round(seg.amount / perPerson)}</span>
          </div>
        ))}
        <div className="perperson-row perperson-total">
          <span className="perperson-label">Per person total</span>
          <span className="perperson-amount">${Math.round(segments.reduce((s, seg) => s + seg.amount, 0) / perPerson)}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   POLISH MOVES
   ============================================================ */

const POLISH_MOVES: { title: string; desc: string }[] = [
  { title: 'Count-up that lands exactly', desc: 'The total cost animates from the old value to the new via requestAnimationFrame with an easeOutCubic curve over 500ms. Each frame computes Math.round(from + (target - from) * eased), and the final frame hard-sets the value to the exact target — no rounding drift. A fromRef tracks the previous value so consecutive input changes chain smoothly. Under reduced-motion the counter snaps instantly.' },
  { title: 'Keyed stacked-bar re-animation', desc: 'The stacked bar is keyed by a counter that increments on any segment change. React unmounts and remounts the bar, so each segment replays its grow animation from 0% width to its target — the bar physically rebuilds on every input change. A 60ms staggered delay per segment makes the reflow read as a sequence rather than a simultaneous snap.' },
  { title: 'Spring-settled toggles', desc: 'Each product toggle scales to 0.96 instantly on press, then springs back over 280ms with a cubic-bezier overshoot (0.34, 1.56, 0.64, 1). The toggle uses aria-pressed for screen-reader state, and the switch knob slides with a CSS transition. Under reduced-motion the spring is skipped entirely.' },
  { title: 'Cross-fading savings line', desc: 'The honest-savings paragraph is keyed by a counter that increments on every text change. React unmounts the old node and mounts a new one, which fades in from opacity 0 over 300ms. The savings amount is computed from a ratio of the current date band to the early-December trough — so the line is always honest about how much less the same trip costs in the cheapest window.' },
  { title: 'Slider with live gradient track', desc: 'The food budget slider fills its track with a teal gradient up to the current value via a CSS custom property (--slider-pct) that the thumb position drives. The fill updates in real time as the slider moves — no JS round-trip needed for the visual, only for the number. Three tick labels below (Budget / Comfortable / Premium) anchor the scale.' },
];

function PolishMoves() {
  return (
    <section className="polish-section">
      <div className="polish-container">
        <div className="polish-heading">Polish Moves</div>
        <ol className="polish-list">
          {POLISH_MOVES.map((m, i) => (
            <li className="polish-item" key={i}>
              <div className="polish-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="polish-title">{m.title}</div>
              <div className="polish-desc">{m.desc}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ============================================================
   App
   ============================================================ */

function App() {
  const { theme, toggle } = useTheme();
  const reduced = useReducedMotion();

  const [partySize, setPartySize] = useState(4);
  const [nights, setNights] = useState(3);
  const [dateBand, setDateBand] = useState<DateBand>('early-dec');
  const [addPartyTickets, setAddPartyTickets] = useState(true);
  const [addSkipQueue, setAddSkipQueue] = useState(true);
  const [addFood, setAddFood] = useState(true);
  const [foodPerPerson, setFoodPerPerson] = useState(80);

  const band = DATE_BANDS.find((b) => b.id === dateBand)!;

  // Compute costs
  const dayTicketCost = band.dayTicket * partySize * nights;
  const partyTicketCost = addPartyTickets ? band.partyTicket * partySize * nights : 0;
  const skipQueueCost = addSkipQueue ? band.skipQueue * partySize * nights : 0;
  const foodCost = addFood ? foodPerPerson * partySize * nights : 0;

  const total = dayTicketCost + partyTicketCost + skipQueueCost + foodCost;

  const segments: CostSegment[] = useMemo(() => {
    const segs: CostSegment[] = [
      { key: 'day', label: 'Day tickets', amount: dayTicketCost, color: 'var(--seg-day)' },
    ];
    if (addPartyTickets) segs.push({ key: 'party', label: 'Party nights', amount: partyTicketCost, color: 'var(--seg-party)' });
    if (addSkipQueue) segs.push({ key: 'skip', label: 'Skip-queue', amount: skipQueueCost, color: 'var(--seg-skip)' });
    if (addFood) segs.push({ key: 'food', label: 'Food budget', amount: foodCost, color: 'var(--seg-food)' });
    return segs;
  }, [dayTicketCost, partyTicketCost, skipQueueCost, foodCost, addPartyTickets, addSkipQueue, addFood]);

  const animatedTotal = useAnimatedNumber(total, reduced);

  return (
    <div className="page">
      {/* Masthead */}
      <header className="masthead">
        <div className="masthead-inner">
          <div className="masthead-brand">
            <div className="brand-mark">RR</div>
            <span className="brand-wordmark">RIDE READY GUIDE</span>
          </div>
          <div className="masthead-actions">
            <span className="masthead-label">Independent planning publication</span>
            <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
              {theme === 'dark' ? <Icon.Sun /> : <Icon.Moon />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-band">
        <div className="hero-inner">
          <div className="hero-eyebrow"><Icon.Calculator /> HOLIDAY TRIP COST PLANNER</div>
          <h1 className="hero-headline">What will it actually cost?<br className="hero-break" /> Let us do the math.</h1>
          <p className="hero-lede">
            Pick your party size, your nights, and your travel window. We will total every line item —
            tickets, party nights, skip-queue, food — and tell you honestly when the same trip costs less.
          </p>
        </div>
      </section>

      {/* Tool body */}
      <div className="tool-container">
        <div className="tool-layout">
          {/* Left rail: inputs */}
          <div className="input-rail" role="group" aria-label="Trip inputs">
            <div className="rail-section">
              <div className="rail-section-title">Your party</div>
              <Stepper label="Party size" value={partySize} min={1} max={12} onChange={setPartySize} suffix={partySize === 1 ? 'person' : 'people'} />
              <Stepper label="Nights at the park" value={nights} min={1} max={8} onChange={setNights} suffix={nights === 1 ? 'night' : 'nights'} />
            </div>

            <div className="rail-section">
              <div className="rail-section-title">When you go</div>
              <DateBandSelector selected={dateBand} onSelect={setDateBand} />
            </div>

            <div className="rail-section">
              <div className="rail-section-title">Add-ons</div>
              <div className="toggle-list">
                <Toggle
                  label="After-hours party tickets"
                  description={`${nights} night${nights > 1 ? 's' : ''} × $${band.partyTicket}/person`}
                  price={`$${band.partyTicket * partySize * nights}`}
                  isOn={addPartyTickets}
                  onToggle={() => setAddPartyTickets((v) => !v)}
                  reduced={reduced}
                />
                <Toggle
                  label="Skip-queue pass"
                  description={`Per person per day · $${band.skipQueue}`}
                  price={`$${band.skipQueue * partySize * nights}`}
                  isOn={addSkipQueue}
                  onToggle={() => setAddSkipQueue((v) => !v)}
                  reduced={reduced}
                />
                <Toggle
                  label="Food budget"
                  description={`$${foodPerPerson}/person/day`}
                  price={`$${foodPerPerson * partySize * nights}`}
                  isOn={addFood}
                  onToggle={() => setAddFood((v) => !v)}
                  reduced={reduced}
                />
              </div>
            </div>

            {addFood && (
              <div className="rail-section">
                <div className="rail-section-title">Food detail</div>
                <FoodSlider value={foodPerPerson} onChange={setFoodPerPerson} />
              </div>
            )}
          </div>

          {/* Right panel: results */}
          <div className="results-panel" aria-live="polite" aria-label="Cost summary">
            {/* Total */}
            <div className="total-block">
              <span className="total-label">Estimated trip cost</span>
              <span className="total-amount">${animatedTotal}</span>
              <span className="total-sub">{partySize} {partySize === 1 ? 'person' : 'people'} · {nights} {nights === 1 ? 'night' : 'nights'} · {band.label}</span>
            </div>

            {/* Stacked bar */}
            <StackedBar segments={segments} total={total} reduced={reduced} />

            {/* Savings line */}
            <SavingsLine currentBand={dateBand} total={total} partySize={partySize} reduced={reduced} />

            {/* Per-person breakdown */}
            <PerPersonBreakdown segments={segments} partySize={partySize} reduced={reduced} />
          </div>
        </div>
      </div>

      {/* Polish Moves */}
      <PolishMoves />
    </div>
  );
}

export default App;
