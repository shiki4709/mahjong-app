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

// Chinese numeral characters for wan tiles
const WAN_CHARS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

export function TileDisplay({ tile, size = "md", onClick, showEnglish = false }: {
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

/* ─── Tile face renderers ─── */

function TileFace({ suit, number, size }: { suit: TileType["suit"]; number: number; size: "sm" | "md" | "lg" }) {
  switch (suit) {
    case "wan":
      return <WanFace number={number} size={size} />;
    case "tong":
      return <TongFace number={number} size={size} />;
    case "tiao":
      return <TiaoFace number={number} size={size} />;
  }
}

/* ─── Wan (Characters): Chinese numeral + 万 ─── */
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

/* ─── Tong (Dots): Colored circles in pattern ─── */
function TongFace({ number, size }: { number: number; size: string }) {
  const dotSize = size === "sm" ? 5 : size === "md" ? 6 : 7;
  const gap = size === "sm" ? 1 : 1.5;
  return (
    <div className="flex flex-col items-center justify-center" style={{ gap: `${gap}px` }}>
      <DotPattern count={number} dotSize={dotSize} gap={gap} />
    </div>
  );
}

function DotPattern({ count, dotSize, gap }: { count: number; dotSize: number; gap: number }) {
  // Arrange dots in recognizable mahjong patterns
  const layouts: Record<number, number[][]> = {
    1: [[1]],
    2: [[1], [1]],
    3: [[1], [1], [1]],
    4: [[1, 1], [1, 1]],
    5: [[1, 1], [0, 1], [1, 1]],
    6: [[1, 1], [1, 1], [1, 1]],
    7: [[1, 1], [1, 1, 1], [1, 1]],
    8: [[1, 1, 1], [1, 1], [1, 1, 1]],
    9: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  };

  const rows = layouts[count] || [[1]];

  return (
    <>
      {rows.map((row, ri) => (
        <div key={ri} className="flex items-center justify-center" style={{ gap: `${gap}px` }}>
          {row.map((filled, ci) => (
            <div
              key={ci}
              style={{ width: dotSize, height: dotSize }}
              className={`rounded-full ${
                filled ? "bg-blue-600 shadow-[inset_0_-1px_0_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]" : "opacity-0"
              }`}
            />
          ))}
        </div>
      ))}
    </>
  );
}

/* ─── Tiao (Bamboo): Vertical sticks ─── */
function TiaoFace({ number, size }: { number: number; size: string }) {
  if (number === 1) {
    // 1 tiao is traditionally a bird/special — show a single thick bamboo
    const h = size === "sm" ? 20 : size === "md" ? 24 : 28;
    return (
      <div className="flex flex-col items-center justify-center">
        <BambooStick height={h} highlight />
      </div>
    );
  }

  const stickH = size === "sm" ? 10 : size === "md" ? 12 : 14;
  const gap = size === "sm" ? 1 : 1.5;

  // Arrange bamboo sticks in rows
  const layouts: Record<number, number[]> = {
    2: [2],
    3: [3],
    4: [2, 2],
    5: [3, 2],
    6: [3, 3],
    7: [4, 3],
    8: [4, 4],
    9: [3, 3, 3],
  };

  const rows = layouts[number] || [number];

  return (
    <div className="flex flex-col items-center justify-center" style={{ gap: `${gap}px` }}>
      {rows.map((count, ri) => (
        <div key={ri} className="flex items-end justify-center" style={{ gap: `${gap + 0.5}px` }}>
          {Array.from({ length: count }).map((_, ci) => (
            <BambooStick key={ci} height={stickH} />
          ))}
        </div>
      ))}
    </div>
  );
}

function BambooStick({ height, highlight }: { height: number; highlight?: boolean }) {
  return (
    <div
      style={{ height, width: highlight ? 6 : 3 }}
      className={`rounded-full ${
        highlight
          ? "bg-gradient-to-b from-emerald-400 to-emerald-700"
          : "bg-gradient-to-b from-emerald-400 to-emerald-600"
      }`}
    />
  );
}

// Colored dot/badge to indicate suit without Chinese
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
