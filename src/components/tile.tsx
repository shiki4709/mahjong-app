import { Tile as TileType } from "@/lib/types";

const SUIT_LABELS: Record<string, string> = {
  wan: "萬",
  tiao: "条",
  tong: "筒",
};

const SUIT_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  wan: { text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  tiao: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  tong: { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
};

const WAN_CHARS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

export function TileDisplay({ tile, size = "md", onClick }: {
  tile: TileType;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  showEnglish?: boolean;
}) {
  const colors = SUIT_COLORS[tile.suit];
  const sizeClasses = {
    sm: "w-10 h-13",
    md: "w-12 h-16",
    lg: "w-14 h-19",
  };

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} mahjong-tile rounded-lg flex flex-col items-center justify-center ${colors.text} ${onClick ? "cursor-pointer hover:brightness-105" : "cursor-default"}`}
    >
      <TileFace suit={tile.suit} number={tile.number} size={size} />
    </button>
  );
}

function TileFace({ suit, number, size }: { suit: TileType["suit"]; number: number; size: "sm" | "md" | "lg" }) {
  const svgSize = size === "sm" ? 30 : size === "md" ? 38 : 46;
  switch (suit) {
    case "wan":
      return <WanFace number={number} size={size} />;
    case "tong":
      return <TongSVG number={number} size={svgSize} />;
    case "tiao":
      return <TiaoSVG number={number} size={svgSize} />;
  }
}

/* ═══════════════════════════════════════════════
   Wan (萬/Characters): Chinese numeral + 萬
   Number in blue/black on top, 萬 in red below
   ═══════════════════════════════════════════════ */
function WanFace({ number, size }: { number: number; size: string }) {
  const charSize = size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg";
  const labelSize = size === "sm" ? "text-[7px]" : "text-[9px]";
  return (
    <>
      <span className={`${charSize} font-black leading-none text-blue-900`}>{WAN_CHARS[number]}</span>
      <span className={`${labelSize} leading-none mt-0.5 text-red-700 font-bold`}>萬</span>
    </>
  );
}

/* ═══════════════════════════════════════════════
   Tong (筒/Circles): Concentric ring coins
   Authentic positions per tile number
   ═══════════════════════════════════════════════ */

// Each circle position: [x, y] in normalized 0-1 space, plus color
type TongDot = { x: number; y: number; color: "green" | "blue" | "red" };

const TONG_DOTS: Record<number, TongDot[]> = {
  // 1: One large centered circle (multicolored — handled specially)
  1: [{ x: 0.5, y: 0.5, color: "green" }],
  // 2: Two stacked vertically
  2: [
    { x: 0.5, y: 0.25, color: "green" },
    { x: 0.5, y: 0.75, color: "blue" },
  ],
  // 3: Three diagonally top-left to bottom-right
  3: [
    { x: 0.25, y: 0.2, color: "blue" },
    { x: 0.5, y: 0.5, color: "red" },
    { x: 0.75, y: 0.8, color: "green" },
  ],
  // 4: 2x2 square, opposite corners same color
  4: [
    { x: 0.3, y: 0.28, color: "blue" },
    { x: 0.7, y: 0.28, color: "green" },
    { x: 0.3, y: 0.72, color: "green" },
    { x: 0.7, y: 0.72, color: "blue" },
  ],
  // 5: Quincunx (4 corners + center)
  5: [
    { x: 0.28, y: 0.22, color: "blue" },
    { x: 0.72, y: 0.22, color: "green" },
    { x: 0.5, y: 0.5, color: "red" },
    { x: 0.28, y: 0.78, color: "green" },
    { x: 0.72, y: 0.78, color: "blue" },
  ],
  // 6: 2 green top + 4 red bottom (2+4 split)
  6: [
    { x: 0.35, y: 0.18, color: "green" },
    { x: 0.65, y: 0.18, color: "green" },
    { x: 0.35, y: 0.5, color: "red" },
    { x: 0.65, y: 0.5, color: "red" },
    { x: 0.35, y: 0.82, color: "red" },
    { x: 0.65, y: 0.82, color: "red" },
  ],
  // 7: 3 green diagonal top-left→bottom-right + 4 red in 2x2 rectangle below
  7: [
    { x: 0.25, y: 0.12, color: "green" },
    { x: 0.50, y: 0.24, color: "green" },
    { x: 0.75, y: 0.36, color: "green" },
    { x: 0.35, y: 0.58, color: "red" },
    { x: 0.65, y: 0.58, color: "red" },
    { x: 0.35, y: 0.82, color: "red" },
    { x: 0.65, y: 0.82, color: "red" },
  ],
  // 8: 2x4 rectangle (2 columns, 4 rows)
  8: [
    { x: 0.35, y: 0.14, color: "blue" },
    { x: 0.65, y: 0.14, color: "blue" },
    { x: 0.35, y: 0.38, color: "blue" },
    { x: 0.65, y: 0.38, color: "blue" },
    { x: 0.35, y: 0.62, color: "blue" },
    { x: 0.65, y: 0.62, color: "blue" },
    { x: 0.35, y: 0.86, color: "blue" },
    { x: 0.65, y: 0.86, color: "blue" },
  ],
  // 9: 3x3 grid, middle row red
  9: [
    { x: 0.22, y: 0.18, color: "green" },
    { x: 0.50, y: 0.18, color: "green" },
    { x: 0.78, y: 0.18, color: "green" },
    { x: 0.22, y: 0.50, color: "red" },
    { x: 0.50, y: 0.50, color: "red" },
    { x: 0.78, y: 0.50, color: "red" },
    { x: 0.22, y: 0.82, color: "green" },
    { x: 0.50, y: 0.82, color: "green" },
    { x: 0.78, y: 0.82, color: "green" },
  ],
};

const TONG_COLORS = {
  green: { outer: "#15803d", inner: "#22c55e" },
  blue: { outer: "#1e40af", inner: "#3b82f6" },
  red: { outer: "#b91c1c", inner: "#ef4444" },
};

function TongSVG({ number, size }: { number: number; size: number }) {
  const dots = TONG_DOTS[number];
  const pad = 3;

  // 1-tong: one large ornate circle
  if (number === 1) {
    const cx = size / 2;
    const r = (size - pad * 2) * 0.38;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="#15803d" />
        <circle cx={cx} cy={cx} r={r * 0.82} fill="#f0ece4" />
        <circle cx={cx} cy={cx} r={r * 0.68} fill="#b91c1c" />
        <circle cx={cx} cy={cx} r={r * 0.52} fill="#f0ece4" />
        <circle cx={cx} cy={cx} r={r * 0.38} fill="#1e40af" />
        <circle cx={cx} cy={cx} r={r * 0.2} fill="#f0ece4" />
      </svg>
    );
  }

  const usable = size - pad * 2;
  // Circle radius scales with count
  const maxR = number <= 4 ? 0.16 : number <= 6 ? 0.13 : 0.11;
  const r = usable * maxR;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {dots.map((dot, i) => {
        const cx = pad + dot.x * usable;
        const cy = pad + dot.y * usable;
        const c = TONG_COLORS[dot.color];
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill={c.outer} />
            <circle cx={cx} cy={cy} r={r * 0.7} fill="#f0ece4" />
            <circle cx={cx} cy={cy} r={r * 0.45} fill={c.inner} />
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   Tiao (条/Bamboo): Segmented sticks
   1-tiao = bird, red accents on 5 (center),
   7 (top center), 9 (center column)
   ═══════════════════════════════════════════════ */

// Each stick: [col, row, isRed]
// Positions in normalized grid
type TiaoStick = { x: number; y: number; red: boolean };

const TIAO_STICKS: Record<number, TiaoStick[]> = {
  // 2: Two side by side
  2: [
    { x: 0.33, y: 0.5, red: false },
    { x: 0.67, y: 0.5, red: false },
  ],
  // 3: Three in a row
  3: [
    { x: 0.25, y: 0.5, red: false },
    { x: 0.50, y: 0.5, red: false },
    { x: 0.75, y: 0.5, red: false },
  ],
  // 4: Four in a row
  4: [
    { x: 0.18, y: 0.5, red: false },
    { x: 0.39, y: 0.5, red: false },
    { x: 0.61, y: 0.5, red: false },
    { x: 0.82, y: 0.5, red: false },
  ],
  // 5: 2-1-2, center is red
  5: [
    { x: 0.25, y: 0.28, red: false },
    { x: 0.75, y: 0.28, red: false },
    { x: 0.50, y: 0.50, red: true },
    { x: 0.25, y: 0.72, red: false },
    { x: 0.75, y: 0.72, red: false },
  ],
  // 6: 3x2 grid
  6: [
    { x: 0.25, y: 0.30, red: false },
    { x: 0.50, y: 0.30, red: false },
    { x: 0.75, y: 0.30, red: false },
    { x: 0.25, y: 0.70, red: false },
    { x: 0.50, y: 0.70, red: false },
    { x: 0.75, y: 0.70, red: false },
  ],
  // 7: 3x2 + 1 red on top center
  7: [
    { x: 0.50, y: 0.17, red: true },
    { x: 0.25, y: 0.45, red: false },
    { x: 0.50, y: 0.45, red: false },
    { x: 0.75, y: 0.45, red: false },
    { x: 0.25, y: 0.78, red: false },
    { x: 0.50, y: 0.78, red: false },
    { x: 0.75, y: 0.78, red: false },
  ],
  // 8: Symmetric fan/M pattern — 2 groups of 4 angled
  8: [
    { x: 0.20, y: 0.25, red: false },
    { x: 0.40, y: 0.25, red: false },
    { x: 0.60, y: 0.25, red: false },
    { x: 0.80, y: 0.25, red: false },
    { x: 0.20, y: 0.75, red: false },
    { x: 0.40, y: 0.75, red: false },
    { x: 0.60, y: 0.75, red: false },
    { x: 0.80, y: 0.75, red: false },
  ],
  // 9: 3x3 grid, center column red
  9: [
    { x: 0.22, y: 0.18, red: false },
    { x: 0.50, y: 0.18, red: true },
    { x: 0.78, y: 0.18, red: false },
    { x: 0.22, y: 0.50, red: false },
    { x: 0.50, y: 0.50, red: true },
    { x: 0.78, y: 0.50, red: false },
    { x: 0.22, y: 0.82, red: false },
    { x: 0.50, y: 0.82, red: true },
    { x: 0.78, y: 0.82, red: false },
  ],
};

function TiaoSVG({ number, size }: { number: number; size: number }) {
  if (number === 1) {
    return <TiaoBird size={size} />;
  }

  const sticks = TIAO_STICKS[number];
  const pad = 2;
  const usable = size - pad * 2;

  // Stick dimensions scale with count
  const stickW = number <= 4 ? usable * 0.1 : usable * 0.08;
  const stickH = number <= 4 ? usable * 0.7 : usable * 0.3;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {sticks.map((stick, i) => {
        const cx = pad + stick.x * usable;
        const cy = pad + stick.y * usable;
        return (
          <BambooStick
            key={i}
            cx={cx}
            cy={cy}
            w={stickW}
            h={stickH}
            red={stick.red}
          />
        );
      })}
    </svg>
  );
}

// Single bamboo stick: 3 colored segments with gold node rings
function BambooStick({ cx, cy, w, h, red }: {
  cx: number; cy: number; w: number; h: number; red: boolean;
}) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const segH = h / 3;
  const nodeH = Math.max(0.8, h * 0.06);
  const r = w * 0.25;

  const dark = red ? "#b91c1c" : "#15803d";
  const light = red ? "#ef4444" : "#22c55e";

  return (
    <g>
      {[0, 1, 2].map((si) => (
        <rect
          key={si}
          x={x}
          y={y + si * segH}
          width={w}
          height={segH}
          rx={r}
          fill={si % 2 === 0 ? dark : light}
        />
      ))}
      {/* Gold node rings between segments */}
      {[1, 2].map((ni) => (
        <rect
          key={`n${ni}`}
          x={x - w * 0.15}
          y={y + ni * segH - nodeH / 2}
          width={w * 1.3}
          height={nodeH}
          rx={nodeH / 2}
          fill="#d97706"
        />
      ))}
    </g>
  );
}

// 1-tiao: Traditional bird (peacock/sparrow)
function TiaoBird({ size }: { size: number }) {
  const cx = size / 2;
  const s = size * 0.38;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Body */}
      <ellipse cx={cx} cy={cx + s * 0.15} rx={s * 0.45} ry={s * 0.6} fill="#15803d" />
      {/* Belly */}
      <ellipse cx={cx} cy={cx + s * 0.3} rx={s * 0.3} ry={s * 0.35} fill="#22c55e" />
      {/* Head */}
      <circle cx={cx} cy={cx - s * 0.5} r={s * 0.28} fill="#15803d" />
      {/* Eye */}
      <circle cx={cx + s * 0.07} cy={cx - s * 0.55} r={s * 0.07} fill="white" />
      <circle cx={cx + s * 0.09} cy={cx - s * 0.55} r={s * 0.03} fill="black" />
      {/* Beak */}
      <polygon
        points={`${cx + s * 0.26},${cx - s * 0.52} ${cx + s * 0.48},${cx - s * 0.48} ${cx + s * 0.26},${cx - s * 0.42}`}
        fill="#dc2626"
      />
      {/* Wing */}
      <ellipse cx={cx - s * 0.12} cy={cx + s * 0.08} rx={s * 0.32} ry={s * 0.22} fill="#16a34a" transform={`rotate(-10 ${cx} ${cx})`} />
      {/* Tail feathers */}
      <line x1={cx - s * 0.05} y1={cx + s * 0.7} x2={cx - s * 0.3} y2={cx + s * 1.05} stroke="#15803d" strokeWidth={s * 0.09} strokeLinecap="round" />
      <line x1={cx + s * 0.05} y1={cx + s * 0.72} x2={cx} y2={cx + s * 1.1} stroke="#dc2626" strokeWidth={s * 0.09} strokeLinecap="round" />
      <line x1={cx + s * 0.15} y1={cx + s * 0.68} x2={cx + s * 0.3} y2={cx + s * 1.0} stroke="#16a34a" strokeWidth={s * 0.09} strokeLinecap="round" />
      {/* Crest */}
      <line x1={cx} y1={cx - s * 0.75} x2={cx - s * 0.05} y2={cx - s * 0.95} stroke="#dc2626" strokeWidth={s * 0.06} strokeLinecap="round" />
      <line x1={cx + s * 0.08} y1={cx - s * 0.73} x2={cx + s * 0.15} y2={cx - s * 0.9} stroke="#dc2626" strokeWidth={s * 0.06} strokeLinecap="round" />
    </svg>
  );
}

// Colored badge to indicate suit
export function SuitBadge({ suit }: { suit: string }) {
  const labels: Record<string, string> = {
    wan: "Characters",
    tiao: "Bamboo",
    tong: "Dots",
  };
  const colors = SUIT_COLORS[suit];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} ${colors.border} border font-medium`}>
      {SUIT_LABELS[suit]} {labels[suit]}
    </span>
  );
}
