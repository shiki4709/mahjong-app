"use client";

import { useState } from "react";
import { Tile } from "@/lib/types";
import { TileDisplay } from "./tile";

const SUITS: Array<{ key: Tile["suit"]; label: string; emoji: string; color: string }> = [
  { key: "wan", label: "Characters", emoji: "万", color: "bg-red-50 border-red-200 text-red-700" },
  { key: "tiao", label: "Bamboo", emoji: "条", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { key: "tong", label: "Dots", emoji: "筒", color: "bg-blue-50 border-blue-200 text-blue-700" },
];

export function TilePicker({ onConfirm, initialTiles = [] }: { onConfirm: (tiles: Tile[]) => void; initialTiles?: Tile[] }) {
  const [selected, setSelected] = useState<Tile[]>(initialTiles);

  function addTile(suit: Tile["suit"], number: number) {
    setSelected([...selected, { suit, number }]);
  }

  function removeTile(index: number) {
    setSelected(selected.filter((_, i) => i !== index));
  }

  const sorted = [...selected].sort((a, b) => {
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
    return a.number - b.number;
  });

  return (
    <div className="space-y-5">
      {/* Selected tiles */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold">{selected.length} tiles selected</p>
          {selected.length > 0 && (
            <button onClick={() => setSelected([])} className="text-xs text-red-500 hover:text-red-700">Clear all</button>
          )}
        </div>
        <div className="bg-gray-50 rounded-xl p-3 min-h-[60px] flex flex-wrap gap-1.5 items-start">
          {sorted.length === 0 ? (
            <p className="text-gray-400 text-xs w-full text-center py-3">Tap tiles below to add them</p>
          ) : (
            sorted.map((tile, i) => (
              <TileDisplay key={i} tile={tile} size="md" onClick={() => {
                const origIdx = selected.findIndex((t, idx) => {
                  // Find the first matching tile that hasn't been "used" yet
                  const alreadySorted = sorted.slice(0, i);
                  const sameCount = alreadySorted.filter(s => s.suit === tile.suit && s.number === tile.number).length;
                  const matchCount = selected.slice(0, idx + 1).filter(s => s.suit === tile.suit && s.number === tile.number).length;
                  return t.suit === tile.suit && t.number === tile.number && matchCount > sameCount;
                });
                if (origIdx >= 0) removeTile(origIdx);
              }} />
            ))
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Tap a tile above to remove it</p>
      </div>

      {/* Tile grid by suit — big touch targets for mobile */}
      {SUITS.map(({ key, label, emoji, color }) => (
        <div key={key}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${color}`}>{emoji}</span>
            <span className="text-sm font-medium text-gray-600">{label}</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => addTile(key, num)}
                className="mahjong-tile rounded-xl flex flex-col items-center justify-center py-3 active:scale-95 transition-transform"
              >
                <span className={`text-2xl font-black leading-none ${key === "wan" ? "text-red-700" : key === "tiao" ? "text-emerald-700" : "text-blue-700"}`}>
                  {num}
                </span>
                <span className={`text-xs mt-0.5 ${key === "wan" ? "text-red-400" : key === "tiao" ? "text-emerald-400" : "text-blue-400"}`}>
                  {emoji}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Confirm button — sticky at bottom on mobile */}
      <div className="sticky bottom-4">
        <button
          onClick={() => onConfirm(selected)}
          disabled={selected.length < 14}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
        >
          {selected.length < 14
            ? `Need ${14 - selected.length} more tiles`
            : `Confirm Hand (${selected.length} tiles)`
          }
        </button>
      </div>
    </div>
  );
}
