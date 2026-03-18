import { Tile } from "@/lib/types";
import { TileDisplay } from "./tile";

export function HandDisplay({ tiles, onTileClick }: { tiles: Tile[]; onTileClick?: (index: number) => void }) {
  const sorted = [...tiles].sort((a, b) => {
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
    return a.number - b.number;
  });

  return (
    <div className="flex flex-wrap gap-1 justify-center p-2">
      {sorted.map((tile, i) => (
        <TileDisplay
          key={i}
          tile={tile}
          onClick={onTileClick ? () => onTileClick(i) : undefined}
        />
      ))}
    </div>
  );
}
