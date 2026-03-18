"use client";

import { useState } from "react";
import { Tile } from "@/lib/types";
import { TileDisplay } from "./tile";

const SUITS: Array<{ key: Tile["suit"]; label: string }> = [
  { key: "wan", label: "万 (Characters)" },
  { key: "tiao", label: "条 (Bamboo)" },
  { key: "tong", label: "筒 (Dots)" },
];

export function TilePicker({ onConfirm, initialTiles = [] }: { onConfirm: (tiles: Tile[]) => void; initialTiles?: Tile[] }) {
  const [selected, setSelected] = useState<Tile[]>(initialTiles);

  function addTile(suit: Tile["suit"], number: number) {
    setSelected([...selected, { suit, number }]);
  }

  function removeTile(index: number) {
    setSelected(selected.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3 min-h-[60px]">
        <p className="text-xs text-gray-500 mb-2">Selected ({selected.length} tiles) — tap to remove:</p>
        <div className="flex flex-wrap gap-1">
          {selected.map((tile, i) => (
            <TileDisplay key={i} tile={tile} size="sm" onClick={() => removeTile(i)} />
          ))}
        </div>
      </div>

      {SUITS.map(({ key, label }) => (
        <div key={key}>
          <p className="text-sm font-medium mb-1">{label}</p>
          <div className="flex gap-1 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <TileDisplay key={num} tile={{ suit: key, number: num }} size="sm" onClick={() => addTile(key, num)} />
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => onConfirm(selected)}
        disabled={selected.length < 14}
        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Confirm Hand ({selected.length} tiles)
      </button>
    </div>
  );
}
