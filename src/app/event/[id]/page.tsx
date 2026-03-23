"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MahjongEvent } from "@/lib/types";
import { computeLedger } from "@/lib/ledger";
import { Leaderboard } from "@/components/leaderboard";
import { EventQRCode } from "@/components/qr-code";
import Link from "next/link";

export default function EventDashboard() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const pin = searchParams.get("pin");
  const playerParam = searchParams.get("player");
  const isHost = !!pin;

  const [event, setEvent] = useState<MahjongEvent | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [roundDismissed, setRoundDismissed] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Player identity: URL param (tab-specific) > localStorage (fallback)
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  useEffect(() => {
    // URL param is source of truth (tab-specific), localStorage is fallback only
    const saved = playerParam || localStorage.getItem(`mahjong-player-${eventId}`);
    if (saved) setMyPlayerId(saved);
  }, [eventId, playerParam]);

  const fetchEvent = useCallback(async () => {
    const res = await fetch(`/api/events/${eventId}${pin ? `?pin=${pin}` : ""}`);
    const data = await res.json();
    setEvent(data.event);
  }, [eventId, pin]);

  useEffect(() => {
    fetchEvent();
    const interval = setInterval(fetchEvent, 5000);
    return () => clearInterval(interval);
  }, [fetchEvent]);

  if (!event) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-4xl mb-3">🀄</div>
      Loading...
    </div>
  );

  const myPlayer = event.players.find(p => p.id === myPlayerId);
  const myTable = event.tables.find(t => t.id === myPlayer?.tableId);

  // Full event ledger — scores follow players across all tables
  const ledgers = computeLedger(event);

  // Table view: current players + anyone who played rounds at this table
  const tablePlayerIds = new Set(myTable?.playerIds || []);
  // Also include players who participated in this table's rounds (departed players)
  for (const round of event.rounds.filter(r => r.tableId === myTable?.id)) {
    for (const pid of round.handsPlayed) tablePlayerIds.add(pid);
  }
  const tableLedgers = ledgers.filter(l => tablePlayerIds.has(l.playerId));
  const myLedger = ledgers.find(l => l.playerId === myPlayerId);

  const myTableRounds = event.rounds.filter(r => r.tableId === myTable?.id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="mahjong-header -mx-4 px-6 pt-8 pb-6 text-center text-white rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-1">
          {isHost && (
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Host</span>
          )}
          {myPlayer && !isHost && (
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{myPlayer.name} {myTable ? `· ${myTable.name}` : ""}</span>
          )}
        </div>
        <h1 className="text-2xl font-bold">🀄 {event.name}</h1>
        {myTable && !isHost && (
          <p className="text-red-200 text-xs mt-1">{myTable.name}</p>
        )}
      </div>

      {/* Player welcome */}
      {!isHost && myPlayer && myTableRounds.length === 0 && (
        <div className="mahjong-card p-4 border-l-4 border-[#c41e3a]">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-800">Hi {myPlayer.name}!</span> When you win a hand, tap <span className="font-bold text-[#c41e3a]">我胡了!</span> below to snap a photo. The app calculates your score automatically.
          </p>
          <Link
            href={`/how-to-play?from=${eventId}${myPlayerId ? `&player=${myPlayerId}` : ""}`}
            className="inline-block mt-3 text-xs text-[#c41e3a] font-medium hover:underline"
          >
            📖 New to Mahjong? Learn how to play →
          </Link>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Link
          href={`/event/${eventId}/submit${myPlayerId ? `?player=${myPlayerId}` : ""}`}
          className="flex-1 py-4 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-2xl font-bold text-center text-lg shadow-lg shadow-red-900/25 transition-colors"
        >
          我胡了!
          <span className="block text-xs font-normal text-red-200 mt-0.5">I Won</span>
        </Link>
        <Link
          href={`/event/${eventId}/kong${myPlayerId ? `?player=${myPlayerId}` : ""}`}
          className="py-4 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-center text-lg shadow-lg shadow-amber-900/20 transition-colors"
        >
          杠
          <span className="block text-xs font-normal text-amber-100 mt-0.5">Kong</span>
        </Link>
      </div>

      {/* How to play — always visible */}
      {!isHost && (
        <Link
          href={`/how-to-play?from=${eventId}${myPlayerId ? `&player=${myPlayerId}` : ""}`}
          className="block text-center text-xs text-gray-400 hover:text-[#c41e3a] transition-colors"
        >
          📖 How to Play — Rules & Scoring Reference
        </Link>
      )}

      {/* Round complete banner — scoped to this table */}
      {(() => {
        const rounds = !isHost && myTable ? myTableRounds : event.rounds;
        const lastRound = rounds[rounds.length - 1];
        if (lastRound && lastRound.status === "completed" && roundDismissed !== lastRound.id) {
          const winners = lastRound.wins.map((w) => event.players.find((p) => p.id === w.winnerId)?.name).filter(Boolean);
          const loser = event.players.find((p) =>
            lastRound.handsPlayed.includes(p.id) && !lastRound.wins.some((w) => w.winnerId === p.id)
          );
          return (
            <div className="mahjong-card p-5 border-l-4 border-amber-500 text-center space-y-3">
              <div className="text-3xl">🎊</div>
              <p className="font-bold text-gray-800">Round {rounds.length} Complete!</p>
              <p className="text-xs text-gray-500">
                {winners.join(", ")} won
                {loser && <> — <span className="text-red-500 font-bold">{loser.name}</span> didn&apos;t make it 😅</>}
              </p>
              <button
                onClick={() => setRoundDismissed(lastRound.id)}
                className="w-full py-3 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-xl font-bold text-sm shadow-md shadow-red-900/20 transition-colors"
              >
                Ready for Next Round
              </button>
            </div>
          );
        }
        return null;
      })()}

      {/* Player stats card — show personal ranking for non-host */}
      {!isHost && myPlayer && myLedger && myLedger.gamesPlayed > 0 && (
        <div className="mahjong-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Your Stats</h2>
            <span className="text-xs text-gray-400">
              #{tableLedgers.findIndex((l) => l.playerId === myPlayerId) + 1} of {tableLedgers.length} at table
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className={`text-lg font-bold ${myLedger.avgPointsPerGame > 0 ? "text-emerald-600" : myLedger.avgPointsPerGame < 0 ? "text-red-600" : "text-gray-400"}`}>
                {myLedger.avgPointsPerGame > 0 ? "+" : ""}{myLedger.avgPointsPerGame}
              </p>
              <p className="text-[10px] text-gray-500">Avg/Game</p>
            </div>
            <div>
              <p className={`text-lg font-bold ${myLedger.totalPoints > 0 ? "text-emerald-600" : myLedger.totalPoints < 0 ? "text-red-600" : "text-gray-400"}`}>
                {myLedger.totalPoints > 0 ? "+" : ""}{myLedger.totalPoints}
              </p>
              <p className="text-[10px] text-gray-500">Total</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{myLedger.gamesPlayed}</p>
              <p className="text-[10px] text-gray-500">Games</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-600">{myLedger.wins}</p>
              <p className="text-[10px] text-gray-500">Wins</p>
            </div>
          </div>
          <Link
            href={`/event/${eventId}/player/${myPlayerId}${myPlayerId ? `?player=${myPlayerId}` : ""}`}
            className="block text-center text-xs text-[#c41e3a] font-medium hover:underline"
          >
            View win history →
          </Link>
        </div>
      )}

      {/* Table leaderboard for players (only their table) */}
      {!isHost && myTable && (
        <div className="mahjong-card p-4">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#d4a017] rounded-full inline-block"></span>
            {myTable.name} Leaderboard
          </h2>
          {tableLedgers.length > 0 ? (
            <Leaderboard ledgers={tableLedgers} eventId={eventId} myPlayerId={myPlayerId} />
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🀄</div>
              <p className="text-sm">No games played yet</p>
            </div>
          )}
        </div>
      )}

      {/* Full leaderboard for host */}
      {isHost && (
        <div className="mahjong-card p-4">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#d4a017] rounded-full inline-block"></span>
            Event Leaderboard
          </h2>
          {ledgers.length > 0 ? (
            <Leaderboard ledgers={ledgers} eventId={eventId} myPlayerId={myPlayerId} />
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🀄</div>
              <p className="text-sm">No games played yet</p>
            </div>
          )}
        </div>
      )}

      {/* No player context — show full leaderboard */}
      {!isHost && !myPlayer && (
        <div className="mahjong-card p-4">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#d4a017] rounded-full inline-block"></span>
            Leaderboard
          </h2>
          {ledgers.length > 0 ? (
            <Leaderboard ledgers={ledgers} eventId={eventId} myPlayerId={myPlayerId} />
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🀄</div>
              <p className="text-sm">No games played yet</p>
            </div>
          )}
        </div>
      )}

      {/* Table view for players */}
      {!isHost && myTable && (
        <div className="mahjong-card p-4 space-y-3">
          <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Your Table: {myTable.name}</h2>
          <div className="flex flex-wrap gap-2">
            {myTable.playerIds.map((pid) => {
              const p = event.players.find(pl => pl.id === pid);
              return p ? (
                <span
                  key={pid}
                  className={`text-sm px-3 py-1.5 rounded-full ${pid === myPlayerId ? "bg-[#c41e3a] text-white font-bold" : "bg-gray-100 text-gray-600"}`}
                >
                  {p.name}
                </span>
              ) : null;
            })}
            {myTable.playerIds.length < 4 && (
              <span className="text-sm px-3 py-1.5 rounded-full bg-gray-50 text-gray-300 border border-dashed border-gray-200">
                Waiting... ({4 - myTable.playerIds.length} spots)
              </span>
            )}
          </div>

          {/* Leave table */}
          {myPlayer && !showLeaveConfirm && (
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Leave table
            </button>
          )}
          {showLeaveConfirm && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
              <p className="text-xs text-amber-800">Leave <span className="font-bold">{myTable.name}</span>? Your scores are kept — you can join another table with a new code.</p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await fetch(`/api/events/${eventId}/leave`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ playerId: myPlayerId }),
                    });
                    setShowLeaveConfirm(false);
                    // Go to join page with event context so they can enter a new table code
                    window.location.href = `/?rejoin=${eventId}&name=${encodeURIComponent(myPlayer?.name || "")}`;
                  }}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Leave Table
                </button>
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Stay
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== HOST CONTROLS ===== */}
      {isHost && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pt-2">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Host Controls</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          {/* Tables with codes */}
          <div className="mahjong-card p-4 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full inline-block"></span>
              Table Codes
            </h3>
            <p className="text-xs text-gray-500">Share these codes with players so they can join the right table</p>

            {event.tables.map((table) => (
              <div key={table.id} className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">{table.name}</h4>
                  <span className="text-xs text-gray-400">{table.playerIds.length}/4 players</span>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <p className="text-3xl font-mono font-bold tracking-[0.3em]">{table.code}</p>
                </div>
                {/* Players at this table */}
                {table.playerIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {table.playerIds.map((pid) => {
                      const p = event.players.find(pl => pl.id === pid);
                      return p ? (
                        <span key={pid} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full inline-flex items-center gap-1">
                          {p.name}
                          <button
                            onClick={async () => {
                              if (!confirm(`Remove ${p.name} from ${table.name}?`)) return;
                              await fetch(`/api/events/${eventId}/players/${pid}?pin=${pin}`, { method: "DELETE" });
                              fetchEvent();
                            }}
                            className="text-red-400 hover:text-red-600 font-bold leading-none"
                            title={`Remove ${p.name}`}
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                <button
                  onClick={() => setShowQR(showQR === table.code ? null : table.code!)}
                  className="text-xs text-gray-500 underline"
                >
                  {showQR === table.code ? "Hide QR" : "Show QR"}
                </button>
                {showQR === table.code && (
                  <EventQRCode
                    url={typeof window !== "undefined" ? `${window.location.origin}` : ""}
                    eventName={`${table.name} — Code: ${table.code}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Manage & End */}
          <div className="flex gap-2">
            <Link
              href={`/event/${eventId}/admin?pin=${pin}`}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm text-center hover:bg-gray-50 transition-colors"
            >
              Manage Tables
            </Link>
            <Link
              href={`/event/${eventId}/summary?pin=${pin}`}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-sm text-center transition-colors"
            >
              End Event
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
