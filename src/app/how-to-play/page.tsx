"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { TileDisplay, SuitBadge } from "@/components/tile";
import { Tile } from "@/lib/types";

const TOTAL_STEPS = 8;

// Helper to make tile objects concisely
function t(suit: Tile["suit"], number: number): Tile {
  return { suit, number };
}

export default function HowToPlay() {
  const [step, setStep] = useState(0);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)), []);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="mahjong-header -mx-4 px-6 pt-10 pb-6 text-white rounded-b-3xl shadow-lg">
        <Link href="/" className="text-red-200 hover:text-white text-xs inline-flex items-center gap-1 mb-4 transition-colors">
          ← Back
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">How to Play</h1>
          <p className="text-red-200 text-sm mt-1">Sichuan Mahjong for Beginners</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-1">
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-[#c41e3a]" : "bg-gray-200"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
        <p className="text-[10px] text-gray-400 text-right mt-1">{step + 1} / {TOTAL_STEPS}</p>
      </div>

      {/* Step content */}
      <div className="min-h-[420px]">
        {step === 0 && <StepWelcome />}
        {step === 1 && <StepTiles />}
        {step === 2 && <StepGoal />}
        {step === 3 && <StepGoalInteractive />}
        {step === 4 && <StepGameplay />}
        {step === 5 && <StepClaiming />}
        {step === 6 && <StepScoring />}
        {step === 7 && <StepApp />}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 ? (
          <button
            onClick={prev}
            className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm transition-colors hover:bg-gray-50"
          >
            ← Back
          </button>
        ) : (
          <div className="flex-1" />
        )}
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={next}
            className="flex-1 py-3.5 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-2xl font-bold text-sm shadow-md shadow-red-900/20 transition-colors"
          >
            Next →
          </button>
        ) : (
          <Link
            href="/"
            className="flex-1 py-3.5 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-2xl font-bold text-sm shadow-md shadow-red-900/20 transition-colors text-center"
          >
            Let&apos;s Play!
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─── Step 0: Welcome ─── */
function StepWelcome() {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl">🀄</div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Sichuan Mahjong</h2>
        <p className="text-sm text-gray-500 mt-1">血战到底 · Fight to the Bitter End</p>
      </div>
      <div className="mahjong-card p-5 text-left space-y-3">
        <p className="text-sm text-gray-600 leading-relaxed">
          Think of it like a <span className="font-bold text-gray-800">card game with tiles</span>.
          4 players take turns drawing and discarding, trying to complete a winning hand.
        </p>
        <div className="flex items-center justify-center gap-6 py-3">
          <div className="text-center">
            <div className="text-3xl">👥</div>
            <p className="text-xs text-gray-500 mt-1 font-bold">4 Players</p>
          </div>
          <div className="text-center">
            <div className="text-3xl">🎴</div>
            <p className="text-xs text-gray-500 mt-1 font-bold">108 Tiles</p>
          </div>
          <div className="text-center">
            <div className="text-3xl">⚡</div>
            <p className="text-xs text-gray-500 mt-1 font-bold">Fast-paced</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400">Swipe through this guide — it takes 2 minutes</p>
    </div>
  );
}

/* ─── Step 1: The Tiles ─── */
function StepTiles() {
  const suits: { suit: Tile["suit"]; label: string }[] = [
    { suit: "wan", label: "Characters" },
    { suit: "tiao", label: "Bamboo" },
    { suit: "tong", label: "Dots" },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">Three Suits, 1-9</h2>
        <p className="text-sm text-gray-500 mt-1">That&apos;s it — no winds, no dragons, just numbers</p>
      </div>

      {suits.map(({ suit, label }) => (
        <div key={suit} className="mahjong-card p-4">
          <div className="mb-2">
            <SuitBadge suit={suit} />
            <span className="text-xs text-gray-400 ml-2">{label}</span>
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <TileDisplay key={n} tile={t(suit, n)} size="sm" />
            ))}
          </div>
        </div>
      ))}

      <p className="text-center text-xs text-gray-400">4 copies of each tile = 108 total</p>
    </div>
  );
}

/* ─── Step 2: Goal ─── */
function StepGoal() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">Build a Winning Hand</h2>
        <p className="text-sm text-gray-500 mt-1">Collect 14 tiles that form this pattern</p>
      </div>

      {/* Visual formula */}
      <div className="mahjong-card p-5">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Set 1 - sequence */}
          <div className="flex gap-0.5">
            <TileDisplay tile={t("tiao", 3)} size="sm" />
            <TileDisplay tile={t("tiao", 4)} size="sm" />
            <TileDisplay tile={t("tiao", 5)} size="sm" />
          </div>
          <span className="text-gray-300 text-lg">+</span>
          {/* Set 2 - sequence */}
          <div className="flex gap-0.5">
            <TileDisplay tile={t("wan", 1)} size="sm" />
            <TileDisplay tile={t("wan", 2)} size="sm" />
            <TileDisplay tile={t("wan", 3)} size="sm" />
          </div>
          <span className="text-gray-300 text-lg">+</span>
          {/* Set 3 - triplet */}
          <div className="flex gap-0.5">
            <TileDisplay tile={t("tiao", 7)} size="sm" />
            <TileDisplay tile={t("tiao", 7)} size="sm" />
            <TileDisplay tile={t("tiao", 7)} size="sm" />
          </div>
          <span className="text-gray-300 text-lg">+</span>
          {/* Set 4 - sequence */}
          <div className="flex gap-0.5">
            <TileDisplay tile={t("wan", 5)} size="sm" />
            <TileDisplay tile={t("wan", 6)} size="sm" />
            <TileDisplay tile={t("wan", 7)} size="sm" />
          </div>
          <span className="text-gray-300 text-lg">+</span>
          {/* Pair */}
          <div className="flex gap-0.5">
            <TileDisplay tile={t("tiao", 9)} size="sm" />
            <TileDisplay tile={t("tiao", 9)} size="sm" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded-lg">set</span>
          <span>+</span>
          <span className="bg-gray-100 px-2 py-1 rounded-lg">set</span>
          <span>+</span>
          <span className="bg-gray-100 px-2 py-1 rounded-lg">set</span>
          <span>+</span>
          <span className="bg-gray-100 px-2 py-1 rounded-lg">set</span>
          <span>+</span>
          <span className="bg-amber-100 px-2 py-1 rounded-lg text-amber-700">pair</span>
        </div>
      </div>

      <div className="mahjong-card p-4 space-y-2">
        <p className="text-sm text-gray-600">
          A <span className="font-bold">set</span> is either:
        </p>
        <div className="flex gap-3">
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
            <div className="flex gap-0.5 justify-center mb-1">
              <TileDisplay tile={t("tong", 3)} size="sm" />
              <TileDisplay tile={t("tong", 4)} size="sm" />
              <TileDisplay tile={t("tong", 5)} size="sm" />
            </div>
            <p className="text-xs font-bold text-gray-700">Sequence</p>
            <p className="text-[10px] text-gray-400">3 in a row</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
            <div className="flex gap-0.5 justify-center mb-1">
              <TileDisplay tile={t("wan", 8)} size="sm" />
              <TileDisplay tile={t("wan", 8)} size="sm" />
              <TileDisplay tile={t("wan", 8)} size="sm" />
            </div>
            <p className="text-xs font-bold text-gray-700">Triplet</p>
            <p className="text-[10px] text-gray-400">3 of a kind</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: Interactive — Tap the winning hand ─── */
function StepGoalInteractive() {
  const winningIds = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  const allTiles: Tile[] = [
    // Winning hand: 1-2-3wan, 4-5-6wan, 7-7-7tiao, 2-3-4tiao, 9-9tiao
    t("wan", 1), t("wan", 2), t("wan", 3),
    t("wan", 4), t("wan", 5), t("wan", 6),
    t("tiao", 7), t("tiao", 7), t("tiao", 7),
    t("tiao", 2), t("tiao", 3), t("tiao", 4),
    t("tiao", 9), t("tiao", 9),
  ];

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(false);

  function toggleTile(i: number) {
    if (revealed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function reveal() {
    setRevealed(true);
  }

  // Check if user correctly identified structure
  const setsEqual = selected.size === winningIds.size && [...selected].every((id) => winningIds.has(id));

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">Can You Spot the Sets?</h2>
        <p className="text-sm text-gray-500 mt-1">Tap tiles to group them into 4 sets + 1 pair</p>
      </div>

      <div className="mahjong-card p-4">
        <div className="flex flex-wrap gap-1 justify-center">
          {allTiles.map((tile, i) => (
            <div key={i} className="relative">
              <div className={`transition-transform ${selected.has(i) ? "-translate-y-2" : ""}`}>
                <TileDisplay tile={tile} size="sm" onClick={() => toggleTile(i)} />
              </div>
              {selected.has(i) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#c41e3a] rounded-full" />
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          {selected.size} tiles selected
        </p>
      </div>

      {!revealed ? (
        <button
          onClick={reveal}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-colors"
        >
          Show Me the Answer
        </button>
      ) : (
        <div className="mahjong-card p-4 border-l-4 border-green-500 space-y-3">
          <p className="text-sm font-bold text-green-800">
            {setsEqual ? "You got it! 🎉" : "Here's how it breaks down:"}
          </p>
          <div className="space-y-2">
            {[
              { label: "Set 1", tiles: [t("wan", 1), t("wan", 2), t("wan", 3)], type: "Sequence" },
              { label: "Set 2", tiles: [t("wan", 4), t("wan", 5), t("wan", 6)], type: "Sequence" },
              { label: "Set 3", tiles: [t("tiao", 7), t("tiao", 7), t("tiao", 7)], type: "Triplet" },
              { label: "Set 4", tiles: [t("tiao", 2), t("tiao", 3), t("tiao", 4)], type: "Sequence" },
              { label: "Pair", tiles: [t("tiao", 9), t("tiao", 9)], type: "Pair" },
            ].map(({ label, tiles, type }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 w-10 shrink-0">{label}</span>
                <div className="flex gap-0.5">
                  {tiles.map((tile, i) => (
                    <TileDisplay key={i} tile={tile} size="sm" />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Step 4: Gameplay ─── */
function StepGameplay() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">How a Round Works</h2>
      </div>

      <div className="space-y-3">
        {[
          {
            num: "1",
            title: "Deal",
            desc: "Each player gets 13 tiles",
            visual: (
              <div className="flex gap-0.5 justify-center mt-2">
                {[1, 3, 5, 7, 2, 4, 6, 8, 9, 1, 3, 5, 7].map((n, i) => (
                  <TileDisplay key={i} tile={t(i < 5 ? "wan" : i < 9 ? "tiao" : "tong", n)} size="sm" />
                ))}
              </div>
            ),
          },
          {
            num: "2",
            title: "Pick a suit to throw away (定缺)",
            desc: "Choose one suit — you must discard all of it before winning",
            visual: (
              <div className="flex gap-3 justify-center mt-2">
                <div className="opacity-100"><SuitBadge suit="wan" /></div>
                <div className="opacity-100"><SuitBadge suit="tiao" /></div>
                <div className="opacity-30 line-through"><SuitBadge suit="tong" /></div>
              </div>
            ),
          },
          {
            num: "3",
            title: "Draw → Discard → Repeat",
            desc: "Take turns until someone completes their hand",
            visual: (
              <div className="flex items-center justify-center gap-3 mt-2 text-sm text-gray-500">
                <div className="bg-gray-100 px-3 py-2 rounded-lg text-center">
                  <p className="text-lg">📥</p>
                  <p className="text-[10px]">Draw</p>
                </div>
                <span>→</span>
                <div className="bg-gray-100 px-3 py-2 rounded-lg text-center">
                  <p className="text-lg">🤔</p>
                  <p className="text-[10px]">Choose</p>
                </div>
                <span>→</span>
                <div className="bg-gray-100 px-3 py-2 rounded-lg text-center">
                  <p className="text-lg">📤</p>
                  <p className="text-[10px]">Discard</p>
                </div>
              </div>
            ),
          },
          {
            num: "🔥",
            title: "Fight to the End!",
            desc: "Game keeps going after the first win — until 3 of 4 players have won",
            visual: (
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">🏆 Won</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">🏆 Won</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">🏆 Won</span>
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">😅</span>
              </div>
            ),
          },
        ].map(({ num, title, desc, visual }) => (
          <div key={num} className="mahjong-card p-4">
            <div className="flex gap-3 items-start">
              <span className="bg-[#c41e3a] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {num}
              </span>
              <div>
                <p className="font-bold text-sm text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
            <div className="mt-1">{visual}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 5: Claiming tiles ─── */
function StepClaiming() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">Steal Discards!</h2>
        <p className="text-sm text-gray-500 mt-1">When someone throws a tile you need, grab it</p>
      </div>

      <div className="mahjong-card p-4 space-y-4">
        {/* Peng example */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#c41e3a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">碰 Pèng</span>
            <span className="text-xs text-gray-400">Make a triplet</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-xs text-gray-400">You have</span>
            <div className="flex gap-0.5">
              <TileDisplay tile={t("wan", 5)} size="sm" />
              <TileDisplay tile={t("wan", 5)} size="sm" />
            </div>
            <span className="text-xs text-gray-400">+ someone throws</span>
            <div className="relative">
              <TileDisplay tile={t("wan", 5)} size="sm" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#c41e3a] rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">!</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Kong example */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">杠 Gàng</span>
            <span className="text-xs text-gray-400">Kong — 4 of a kind (bonus points!)</span>
          </div>
          <div className="flex gap-0.5 justify-center">
            <TileDisplay tile={t("tong", 3)} size="sm" />
            <TileDisplay tile={t("tong", 3)} size="sm" />
            <TileDisplay tile={t("tong", 3)} size="sm" />
            <TileDisplay tile={t("tong", 3)} size="sm" />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Win example */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">胡 Hú</span>
            <span className="text-xs text-gray-400">Win! The tile completes your hand</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-xs text-gray-400">Need one more?</span>
            <span className="text-lg">→</span>
            <span className="text-2xl">🎉</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
        <p className="text-xs text-amber-700">
          <span className="font-bold">Note:</span> No 吃 (Chī) in Sichuan Mahjong — you can only claim matching tiles, not sequences.
        </p>
      </div>
    </div>
  );
}

/* ─── Step 6: Scoring ─── */
function StepScoring() {
  const [selectedFan, setSelectedFan] = useState<number | null>(null);

  const hands = [
    { name: "自摸", en: "Self-draw", fan: 1, desc: "Won by drawing the tile yourself", color: "bg-blue-50 border-blue-200" },
    { name: "对对胡", en: "All Triplets", fan: 1, desc: "All sets are triplets — no sequences", color: "bg-purple-50 border-purple-200" },
    { name: "清一色", en: "Flush", fan: 2, desc: "All tiles are the same suit", color: "bg-emerald-50 border-emerald-200" },
    { name: "七对", en: "Seven Pairs", fan: 2, desc: "7 pairs instead of 4+1", color: "bg-pink-50 border-pink-200" },
    { name: "天胡", en: "Heavenly Hand", fan: 4, desc: "Dealer wins first draw — super rare!", color: "bg-amber-50 border-amber-200" },
  ];

  const totalFan = selectedFan ?? 0;
  const score = Math.pow(2, totalFan);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">Scoring is Simple</h2>
        <p className="text-sm text-gray-500 mt-1">Each bonus doubles your score</p>
      </div>

      {/* Interactive score calculator */}
      <div className="mahjong-card p-5 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Score formula</p>
        <div className="flex items-center justify-center gap-2 text-lg">
          <span className="bg-gray-100 px-3 py-1 rounded-lg font-bold text-gray-700">Base</span>
          <span className="text-gray-400">×</span>
          <span className="bg-[#c41e3a] text-white px-3 py-1 rounded-lg font-bold">2<sup>{totalFan}</sup></span>
          <span className="text-gray-400">=</span>
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg font-bold">{score}×</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Tap a hand type below to see how it affects score</p>
      </div>

      {/* Hand types - tappable */}
      <div className="space-y-2">
        {hands.map((h, i) => (
          <button
            key={h.name}
            onClick={() => setSelectedFan(selectedFan === h.fan ? null : h.fan)}
            className={`w-full mahjong-card p-3 flex items-center gap-3 text-left transition-colors ${
              selectedFan === h.fan ? "border-l-4 border-[#c41e3a]" : ""
            }`}
          >
            <span className="bg-[#c41e3a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              {h.fan} fan
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800">{h.name} · {h.en}</p>
              <p className="text-[10px] text-gray-500 truncate">{h.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mahjong-card p-3 space-y-1">
        <p className="text-xs text-gray-600">
          <span className="font-bold text-gray-800">自摸 (self-draw):</span> all 3 others pay you
        </p>
        <p className="text-xs text-gray-600">
          <span className="font-bold text-gray-800">点炮 (off discard):</span> only the discarder pays
        </p>
      </div>
    </div>
  );
}

/* ─── Step 7: Using the App ─── */
function StepApp() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">Using This App</h2>
        <p className="text-sm text-gray-500 mt-1">The app handles all the scoring for you</p>
      </div>

      <div className="space-y-3">
        {[
          { icon: "📸", title: "Win? Snap a photo", desc: "AI reads your tiles and calculates the score" },
          { icon: "🀄", title: "Kong? Tap 杠", desc: "Record kong bonuses as they happen" },
          { icon: "📊", title: "Watch the leaderboard", desc: "Live scores across all tables" },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="mahjong-card p-4 flex gap-4 items-center">
            <span className="text-3xl shrink-0">{icon}</span>
            <div>
              <p className="font-bold text-sm text-gray-800">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-lg font-bold text-green-800">You&apos;re ready!</p>
        <p className="text-xs text-green-700 mt-1">
          Don&apos;t worry about memorizing everything — the app does the math. Just play and have fun!
        </p>
      </div>

      {/* Quick reference glossary */}
      <div className="mahjong-card p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Reference</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            ["胡 Hú", "Win"],
            ["自摸 Zìmō", "Self-draw"],
            ["碰 Pèng", "Triplet claim"],
            ["杠 Gàng", "Kong"],
            ["番 Fān", "Score multiplier"],
            ["定缺 Dìng quē", "Pick a suit to drop"],
          ].map(([cn, en]) => (
            <div key={cn} className="bg-gray-50 rounded-lg px-2 py-1.5">
              <p className="font-bold text-gray-800 text-[10px]">{cn}</p>
              <p className="text-gray-500 text-[10px]">{en}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
