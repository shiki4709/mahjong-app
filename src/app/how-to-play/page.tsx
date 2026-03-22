"use client";

import Link from "next/link";
import { useState } from "react";

type Section = "basics" | "tiles" | "goal" | "gameplay" | "winning" | "scoring" | "app";

interface SectionGroup {
  label: string;
  sections: { id: Section; title: string; icon: string }[];
}

const groups: SectionGroup[] = [
  {
    label: "Learn the Game",
    sections: [
      { id: "basics", title: "What is Mahjong?", icon: "🀄" },
      { id: "tiles", title: "The Tiles", icon: "🎴" },
      { id: "goal", title: "Goal of the Game", icon: "🎯" },
      { id: "gameplay", title: "How a Round Works", icon: "🔄" },
    ],
  },
  {
    label: "Winning & Scoring",
    sections: [
      { id: "winning", title: "Winning Hands", icon: "🏆" },
      { id: "scoring", title: "Scoring & Fan", icon: "💰" },
    ],
  },
  {
    label: "Using the App",
    sections: [
      { id: "app", title: "Using This App", icon: "📱" },
    ],
  },
];

export default function HowToPlay() {
  const [open, setOpen] = useState<Section | null>("basics");

  function toggle(id: Section) {
    setOpen(open === id ? null : id);
  }

  return (
    <div className="space-y-5">
      {/* Header with integrated back nav */}
      <div className="mahjong-header -mx-4 px-6 pt-10 pb-8 text-white rounded-b-3xl shadow-lg">
        <Link href="/" className="text-red-200 hover:text-white text-xs inline-flex items-center gap-1 mb-4 transition-colors">
          ← Back to Home
        </Link>
        <div className="text-center">
          <div className="text-5xl mb-2">📖</div>
          <h1 className="text-2xl font-bold tracking-tight">How to Play</h1>
          <p className="text-red-200 text-sm mt-1">Sichuan Mahjong (血战到底) for Beginners</p>
        </div>
      </div>

      {/* Quick overview */}
      <div className="mahjong-card p-5 border-l-4 border-[#c41e3a]">
        <p className="text-sm text-gray-600 leading-relaxed">
          <span className="font-bold text-gray-800">Sichuan Mahjong</span> is a fast-paced, exciting variant from Sichuan, China.
          It uses only numbered tiles (no winds or dragons), and the game continues after the first winner until
          three players have won — this is called <span className="font-bold text-[#c41e3a]">血战到底</span> (fight to the bitter end)!
        </p>
      </div>

      {/* Grouped accordion sections */}
      {groups.map((group, gi) => (
        <div key={group.label}>
          {/* Group header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{group.label}</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <div className="space-y-2">
            {group.sections.map(({ id, title, icon }) => {
              const isOpen = open === id;
              const panelId = `panel-${id}`;
              const triggerId = `trigger-${id}`;

              return (
                <div
                  key={id}
                  className={`mahjong-card overflow-hidden transition-colors ${isOpen ? "border-l-4 border-[#c41e3a]" : ""}`}
                >
                  <button
                    id={triggerId}
                    onClick={() => toggle(id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c41e3a]/40 focus-visible:ring-inset rounded-xl"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">{icon}</span>
                      <span className="font-bold text-sm">{title}</span>
                    </span>
                    <span
                      className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="px-5 pb-5 text-sm text-gray-600 leading-relaxed space-y-3"
                    >
                      <SectionContent id={id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reassurance break after the "Learn the Game" group */}
          {gi === 0 && (
            <div className="mahjong-card p-5 mt-3 bg-green-50 border border-green-200 text-center">
              <p className="text-sm text-green-800 font-bold">That&apos;s enough to start playing!</p>
              <p className="text-xs text-green-700 mt-1">The sections below are just for reference during the game.</p>
              <Link
                href="/"
                className="inline-block mt-3 py-2 px-6 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-xl font-bold text-xs shadow-md shadow-red-900/20 transition-colors"
              >
                Join a Game
              </Link>
            </div>
          )}
        </div>
      ))}

      {/* Glossary */}
      <div className="mahjong-card p-5">
        <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Quick Glossary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            ["胡 (Hú)", "Win"],
            ["自摸 (Zìmō)", "Self-draw win"],
            ["点炮 (Diǎnpào)", "Win off discard"],
            ["杠 (Gàng)", "Kong (4 of a kind)"],
            ["碰 (Pèng)", "Claim a triplet"],
            ["吃 (Chī)", "Not used here!"],
            ["番 (Fān)", "Scoring multiplier"],
            ["清一色 (Qīngyīsè)", "All one suit"],
            ["七对 (Qīduì)", "Seven pairs"],
            ["血战到底", "Fight to the end"],
          ].map(([cn, en]) => (
            <div key={cn} className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="font-bold text-gray-800 text-xs">{cn}</p>
              <p className="text-gray-500 text-xs">{en}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ready to play */}
      <div className="text-center space-y-3 pb-4">
        <p className="text-sm text-gray-500">Ready to play?</p>
        <Link
          href="/"
          className="inline-block py-3 px-8 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-2xl font-bold text-sm shadow-md shadow-red-900/20 transition-colors"
        >
          Join a Game
        </Link>
      </div>
    </div>
  );
}

function SectionContent({ id }: { id: Section }) {
  switch (id) {
    case "basics":
      return (
        <>
          <p>
            Mahjong is a tile-based game for <span className="font-bold">4 players</span>. Think of it like
            a card game — you draw and discard tiles each turn, trying to complete a winning hand.
          </p>
          <p>
            <span className="font-bold text-gray-800">Sichuan Mahjong</span> is simpler than other variants:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Only 3 suits of numbered tiles (no winds or dragons)</li>
            <li>No <span className="font-mono text-xs bg-gray-100 px-1 rounded">吃 (Chī)</span> — you can only claim triplets, not sequences</li>
            <li>Game continues until 3 players win (血战到底)</li>
            <li>Must discard one entire suit at the start (定缺)</li>
          </ul>
        </>
      );

    case "tiles":
      return (
        <>
          <p>Sichuan Mahjong uses <span className="font-bold">108 tiles</span> — three suits of 1-9, four copies each:</p>
          <div className="space-y-3 mt-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">万 Wàn (Characters)</p>
              <p className="text-xs text-gray-500">Tiles 1-9 with Chinese number characters</p>
              <div className="flex flex-wrap gap-1 mt-2 text-lg">
                {"🀇🀈🀉🀊🀋🀌🀍🀎🀏".split(/(?=.)/u).filter(Boolean).map((t, i) => (
                  <span key={i} className="mahjong-tile w-7 h-9 flex items-center justify-center rounded text-base">{t}</span>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">条 Tiáo (Bamboo)</p>
              <p className="text-xs text-gray-500">Tiles 1-9 with bamboo stick designs</p>
              <div className="flex flex-wrap gap-1 mt-2 text-lg">
                {"🀐🀑🀒🀓🀔🀕🀖🀗🀘".split(/(?=.)/u).filter(Boolean).map((t, i) => (
                  <span key={i} className="mahjong-tile w-7 h-9 flex items-center justify-center rounded text-base">{t}</span>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">筒 Tǒng (Dots)</p>
              <p className="text-xs text-gray-500">Tiles 1-9 with circle/dot designs</p>
              <div className="flex flex-wrap gap-1 mt-2 text-lg">
                {"🀙🀚🀛🀜🀝🀞🀟🀠🀡".split(/(?=.)/u).filter(Boolean).map((t, i) => (
                  <span key={i} className="mahjong-tile w-7 h-9 flex items-center justify-center rounded text-base">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </>
      );

    case "goal":
      return (
        <>
          <p>
            Your goal is to form a <span className="font-bold text-gray-800">complete hand</span> of 14 tiles.
            A standard winning hand has:
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-1">
            <p className="font-bold text-amber-800 text-center">
              4 sets + 1 pair = Win!
            </p>
            <p className="text-xs text-amber-700 text-center mt-1">
              Each set is either a sequence (e.g., 3-4-5) or a triplet (e.g., 7-7-7)
            </p>
          </div>
          <p className="font-bold text-gray-800 mt-1">Important Sichuan rules:</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>
              <span className="font-bold">定缺 (Dìng quē)</span> — At the start, each player picks one suit to &quot;lack.&quot;
              You must discard all tiles of that suit before you can win.
            </li>
            <li>
              Your winning hand must contain <span className="font-bold">only 2 suits</span> (the two you kept).
            </li>
          </ul>
        </>
      );

    case "gameplay":
      return (
        <>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <span className="bg-[#c41e3a] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <div>
                <p className="font-bold text-gray-800">Deal</p>
                <p>Each player receives 13 tiles. The dealer gets 14.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-[#c41e3a] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <div>
                <p className="font-bold text-gray-800">Choose your lacking suit (定缺)</p>
                <p>Pick one suit to discard entirely. You must get rid of all tiles in that suit before you can win.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-[#c41e3a] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <div>
                <p className="font-bold text-gray-800">Take turns</p>
                <p>On your turn: draw a tile from the wall, then discard one. You&apos;re trying to build sets!</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-[#c41e3a] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <div>
                <p className="font-bold text-gray-800">Claim tiles</p>
                <p>When someone discards, you can claim it for:</p>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                  <li><span className="font-bold">碰 (Pèng)</span> — You have 2 matching tiles, claim the 3rd to make a triplet</li>
                  <li><span className="font-bold">杠 (Gàng)</span> — You have 3 matching tiles, claim the 4th for a Kong</li>
                  <li><span className="font-bold">胡 (Hú)</span> — The tile completes your hand — you win!</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-[#c41e3a] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span>
              <div>
                <p className="font-bold text-gray-800">血战到底 — Fight to the end!</p>
                <p>After someone wins, the remaining players keep playing. The round ends when 3 out of 4 players have won (or tiles run out).</p>
              </div>
            </div>
          </div>
        </>
      );

    case "winning":
      return (
        <>
          <p>Here are the special winning hands and bonuses in Sichuan Mahjong:</p>
          <div className="space-y-2 mt-2">
            {[
              { name: "平胡", nameEn: "Basic Win", fan: "0 fan", desc: "Standard hand with sequences, triplets, and a pair" },
              { name: "对对胡", nameEn: "All Triplets", fan: "1 fan", desc: "All 4 sets are triplets (no sequences)" },
              { name: "清一色", nameEn: "Flush", fan: "2 fan", desc: "All tiles are the same suit" },
              { name: "七对", nameEn: "Seven Pairs", fan: "2 fan", desc: "7 pairs instead of 4 sets + 1 pair" },
              { name: "带幺九", nameEn: "All Terminals", fan: "1 fan", desc: "Every set contains a 1 or 9" },
              { name: "金钩钓", nameEn: "Golden Hook", fan: "2 fan", desc: "4 triplets + 1 pair, waiting for the pair" },
              { name: "自摸", nameEn: "Self-draw", fan: "1 fan", desc: "Win by drawing the tile yourself" },
              { name: "杠上开花", nameEn: "Win off Kong", fan: "1 fan", desc: "Win on the tile drawn after declaring a Kong" },
              { name: "海底捞月", nameEn: "Last Tile", fan: "1 fan", desc: "Win on the very last tile from the wall" },
              { name: "天胡", nameEn: "Heavenly Hand", fan: "4 fan", desc: "Dealer wins on their first draw — extremely rare!" },
              { name: "地胡", nameEn: "Earthly Hand", fan: "4 fan", desc: "Non-dealer wins on their first draw" },
            ].map((h) => (
              <div key={h.name} className="bg-gray-50 rounded-xl p-3 flex gap-3">
                <div className="shrink-0">
                  <span className="bg-[#c41e3a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{h.fan}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-xs">{h.name} · {h.nameEn}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      );

    case "scoring":
      return (
        <>
          <p>Scoring in Sichuan Mahjong uses <span className="font-bold">fan (番)</span> — each fan doubles the base score:</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-1">
            <p className="font-bold text-amber-800 text-center text-sm">
              Score = Base Score × 2<sup>total fan</sup>
            </p>
            <div className="mt-2 space-y-1 text-xs text-amber-700">
              <p>0 fan = 1× base (basic win by discard)</p>
              <p>1 fan = 2× base (e.g., self-draw)</p>
              <p>2 fan = 4× base (e.g., flush)</p>
              <p>3 fan = 8× base (e.g., flush + self-draw)</p>
            </div>
          </div>
          <p className="font-bold text-gray-800 mt-1">Payment rules:</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li><span className="font-bold">自摸 (Self-draw)</span> — All 3 other players pay you</li>
            <li><span className="font-bold">点炮 (Discard win)</span> — Only the player who discarded pays</li>
          </ul>
          <p className="mt-1">
            <span className="font-bold">杠 (Kong)</span> bonuses are paid separately:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li><span className="font-bold">明杠 (Open Kong)</span> — The discarder pays 1× base</li>
            <li><span className="font-bold">暗杠 (Concealed Kong)</span> — All 3 others pay 2× base each</li>
            <li><span className="font-bold">补杠 (Added Kong)</span> — All 3 others pay 1× base each</li>
          </ul>
        </>
      );

    case "app":
      return (
        <>
          <p>Here&apos;s how to use this app during your mahjong session:</p>
          <div className="space-y-3 mt-1">
            <div className="flex gap-3 items-start">
              <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <div>
                <p className="font-bold text-gray-800">Host creates the event</p>
                <p>The host sets up tables — each table gets a unique 4-letter code.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <div>
                <p className="font-bold text-gray-800">Players join with the code</p>
                <p>Enter the table code and your name to join.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <div>
                <p className="font-bold text-gray-800">Tap &quot;我胡了!&quot; when you win</p>
                <p>Take a photo of your winning hand. The AI will recognize your tiles and calculate the score automatically!</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <div>
                <p className="font-bold text-gray-800">Tap &quot;杠&quot; for Kongs</p>
                <p>Record any Kong bonuses as they happen.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span>
              <div>
                <p className="font-bold text-gray-800">Watch the leaderboard</p>
                <p>Scores update live across all tables. See who&apos;s winning the event!</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-2">
            <p className="text-xs text-green-700">
              <span className="font-bold">Tip:</span> Don&apos;t worry about calculating scores — the app does it all for you. Just play and have fun!
            </p>
          </div>
        </>
      );
  }
}
