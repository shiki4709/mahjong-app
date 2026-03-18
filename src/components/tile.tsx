import { Tile as TileType } from "@/lib/types";

const SUIT_LABELS: Record<string, string> = {
  wan: "万",
  tiao: "条",
  tong: "筒",
};

const SUIT_COLORS: Record<string, string> = {
  wan: "text-red-600",
  tiao: "text-green-600",
  tong: "text-blue-600",
};

export function TileDisplay({ tile, size = "md", onClick }: { tile: TileType; size?: "sm" | "md" | "lg"; onClick?: () => void }) {
  const sizeClasses = {
    sm: "w-8 h-11 text-xs",
    md: "w-11 h-15 text-sm",
    lg: "w-14 h-19 text-base",
  };

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} bg-white border-2 border-gray-300 rounded-md shadow-sm flex flex-col items-center justify-center font-bold ${SUIT_COLORS[tile.suit]} ${onClick ? "cursor-pointer hover:border-yellow-400 active:bg-yellow-50" : "cursor-default"}`}
    >
      <span className="text-lg leading-none">{tile.number}</span>
      <span className="leading-none">{SUIT_LABELS[tile.suit]}</span>
    </button>
  );
}
