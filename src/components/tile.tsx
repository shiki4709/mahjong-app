import { Tile as TileType } from "@/lib/types";

// Visual representations that work across languages
const SUIT_SYMBOLS: Record<string, string> = {
  wan: "W",    // 万 Characters
  tiao: "T",   // 条 Bamboo
  tong: "D",   // 筒 Dots
};

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

export function TileDisplay({ tile, size = "md", onClick, showEnglish = false }: {
  tile: TileType;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  showEnglish?: boolean;
}) {
  const colors = SUIT_COLORS[tile.suit];
  const sizeClasses = {
    sm: "w-10 h-13 text-xs",
    md: "w-12 h-16 text-sm",
    lg: "w-14 h-19 text-base",
  };

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} mahjong-tile rounded-lg flex flex-col items-center justify-center font-bold ${colors.text} ${onClick ? "cursor-pointer hover:brightness-105" : "cursor-default"}`}
    >
      <span className="text-lg leading-none font-black">{tile.number}</span>
      <span className="leading-none mt-0.5 text-[10px]">
        {showEnglish ? SUIT_SYMBOLS[tile.suit] : SUIT_LABELS[tile.suit]}
      </span>
    </button>
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
