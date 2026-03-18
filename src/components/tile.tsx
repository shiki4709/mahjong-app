import { Tile as TileType } from "@/lib/types";

const SUIT_LABELS: Record<string, string> = {
  wan: "万",
  tiao: "条",
  tong: "筒",
};

const SUIT_COLORS: Record<string, string> = {
  wan: "text-red-700",
  tiao: "text-emerald-700",
  tong: "text-blue-700",
};

export function TileDisplay({ tile, size = "md", onClick }: { tile: TileType; size?: "sm" | "md" | "lg"; onClick?: () => void }) {
  const sizeClasses = {
    sm: "w-9 h-12 text-xs",
    md: "w-12 h-16 text-sm",
    lg: "w-14 h-19 text-base",
  };

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} mahjong-tile rounded-lg flex flex-col items-center justify-center font-bold ${SUIT_COLORS[tile.suit]} ${onClick ? "cursor-pointer hover:brightness-105" : "cursor-default"}`}
    >
      <span className="text-lg leading-none font-black">{tile.number}</span>
      <span className="leading-none mt-0.5">{SUIT_LABELS[tile.suit]}</span>
    </button>
  );
}
