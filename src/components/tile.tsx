import { Tile as TileType } from "@/lib/types";

const SUIT_LABELS: Record<string, string> = {
  wan: "万",
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

/* ═══ Wan (Characters): Chinese numeral + 万 ═══ */
function WanFace({ number, size }: { number: number; size: string }) {
  const charSize = size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg";
  const labelSize = size === "sm" ? "text-[8px]" : "text-[10px]";
  return (
    <>
      <span className={`${charSize} font-black leading-none text-red-700`}>{WAN_CHARS[number]}</span>
      <span className={`${labelSize} leading-none mt-0.5 text-red-700 font-bold`}>万</span>
    </>
  );
}

/* ═══ Tong (Dots/Circles): Concentric ring pattern ═══ */
// Authentic tong tiles show concentric circles (筒 = tube cross-section)
// with alternating colored rings: blue outer, white gap, red/green inner

// Positions for each count, in a 3x3 grid coordinate space
// Each position is [col, row] where 0,0 is top-left and 2,2 is bottom-right
const TONG_POSITIONS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[1, 0], [1, 2]],
  3: [[1, 0], [1, 1], [1, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
  7: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [2, 2]],
  8: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  9: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
};

function TongSVG({ number, size }: { number: number; size: number }) {
  const positions = TONG_POSITIONS[number];
  const padding = 3;
  const usable = size - padding * 2;

  // For 1 tong, make it bigger
  if (number === 1) {
    const cx = size / 2;
    const cy = size / 2;
    const r = usable * 0.35;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <TongCircle cx={cx} cy={cy} r={r} />
      </svg>
    );
  }

  // Determine grid bounds
  const cols = positions.reduce((max, [c]) => Math.max(max, c), 0);
  const rows = positions.reduce((max, [, r]) => Math.max(max, r), 0);

  const cellW = cols > 0 ? usable / (cols + 1) : usable;
  const cellH = rows > 0 ? usable / (rows + 1) : usable;
  const r = Math.min(cellW, cellH) * 0.38;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {positions.map(([c, row], i) => {
        const cx = padding + (cols > 0 ? c * (usable / cols) : usable / 2);
        const cy = padding + (rows > 0 ? row * (usable / rows) : usable / 2);
        return <TongCircle key={i} cx={cx} cy={cy} r={r} />;
      })}
    </svg>
  );
}

// A single tong circle: concentric rings (blue outer, white, green inner, red center)
function TongCircle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1e40af" />
      <circle cx={cx} cy={cy} r={r * 0.78} fill="#f0ece4" />
      <circle cx={cx} cy={cy} r={r * 0.6} fill="#15803d" />
      <circle cx={cx} cy={cy} r={r * 0.35} fill="#f0ece4" />
      <circle cx={cx} cy={cy} r={r * 0.18} fill="#dc2626" />
    </g>
  );
}

/* ═══ Tiao (Bamboo): Segmented sticks with nodes ═══ */
// Authentic bamboo tiles show segmented sticks with alternating colors
// 1 tiao is traditionally a bird

// Row layouts: each row has N sticks
const TIAO_LAYOUTS: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [2, 2],
  5: [3, 2],
  6: [3, 3],
  7: [3, 4],
  8: [4, 4],
  9: [3, 3, 3],
};

function TiaoSVG({ number, size }: { number: number; size: number }) {
  if (number === 1) {
    return <TiaoBird size={size} />;
  }

  const rows = TIAO_LAYOUTS[number];
  const padding = 2;
  const usable = size - padding * 2;
  const rowH = usable / rows.length;
  const maxCols = Math.max(...rows);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rows.map((count, ri) => {
        const y = padding + ri * rowH;
        const stickW = Math.min(usable / maxCols, 6);
        const totalW = count * stickW + (count - 1) * stickW * 0.4;
        const startX = (size - totalW) / 2;

        return Array.from({ length: count }).map((_, ci) => {
          const x = startX + ci * (stickW + stickW * 0.4);
          // Alternate green and blue sticks
          const isGreen = (ri + ci) % 2 === 0;
          return (
            <BambooSegmented
              key={`${ri}-${ci}`}
              x={x}
              y={y + 1}
              w={stickW}
              h={rowH - 2}
              green={isGreen}
            />
          );
        });
      })}
    </svg>
  );
}

// A single bamboo stick with 3 segments and node rings
function BambooSegmented({ x, y, w, h, green }: {
  x: number; y: number; w: number; h: number; green: boolean;
}) {
  const color1 = green ? "#15803d" : "#1e40af";
  const color2 = green ? "#22c55e" : "#3b82f6";
  const segH = h / 3;
  const nodeH = Math.max(1, h * 0.04);
  const r = w * 0.2;

  return (
    <g>
      {/* 3 segments with alternating shades */}
      {[0, 1, 2].map((si) => (
        <rect
          key={si}
          x={x}
          y={y + si * segH}
          width={w}
          height={segH}
          rx={r}
          fill={si % 2 === 0 ? color1 : color2}
        />
      ))}
      {/* Node rings between segments */}
      {[1, 2].map((ni) => (
        <rect
          key={`n${ni}`}
          x={x - w * 0.1}
          y={y + ni * segH - nodeH / 2}
          width={w * 1.2}
          height={nodeH}
          rx={nodeH / 2}
          fill="#fbbf24"
        />
      ))}
    </g>
  );
}

// 1-tiao bird: simplified stylized bird (traditional design)
function TiaoBird({ size }: { size: number }) {
  const cx = size / 2;
  const s = size * 0.35;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Body */}
      <ellipse cx={cx} cy={cx + s * 0.1} rx={s * 0.5} ry={s * 0.65} fill="#15803d" />
      {/* Head */}
      <circle cx={cx} cy={cx - s * 0.55} r={s * 0.3} fill="#15803d" />
      {/* Eye */}
      <circle cx={cx + s * 0.08} cy={cx - s * 0.6} r={s * 0.06} fill="white" />
      {/* Beak */}
      <polygon
        points={`${cx + s * 0.28},${cx - s * 0.55} ${cx + s * 0.5},${cx - s * 0.5} ${cx + s * 0.28},${cx - s * 0.45}`}
        fill="#dc2626"
      />
      {/* Wing */}
      <ellipse cx={cx - s * 0.15} cy={cx + s * 0.05} rx={s * 0.35} ry={s * 0.25} fill="#22c55e" transform={`rotate(-15 ${cx} ${cx})`} />
      {/* Tail feathers */}
      <line x1={cx - s * 0.1} y1={cx + s * 0.7} x2={cx - s * 0.35} y2={cx + s * 1.0} stroke="#15803d" strokeWidth={s * 0.08} strokeLinecap="round" />
      <line x1={cx + s * 0.1} y1={cx + s * 0.7} x2={cx + s * 0.15} y2={cx + s * 1.0} stroke="#22c55e" strokeWidth={s * 0.08} strokeLinecap="round" />
      <line x1={cx} y1={cx + s * 0.7} x2={cx - s * 0.1} y2={cx + s * 1.05} stroke="#16a34a" strokeWidth={s * 0.08} strokeLinecap="round" />
    </svg>
  );
}

// Colored dot/badge to indicate suit
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
