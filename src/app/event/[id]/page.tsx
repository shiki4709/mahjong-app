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
  const isHost = !!pin;

  const [event, setEvent] = useState<MahjongEvent | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [newPlayer, setNewPlayer] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // Restore selected player from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`mahjong-player-${eventId}`);
    if (saved) setSelectedPlayer(saved);
  }, [eventId]);

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

  async function addPlayer() {
    if (!newPlayer.trim()) return;
    await fetch(`/api/events/${eventId}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPlayer.trim() }),
    });
    setNewPlayer("");
    fetchEvent();
  }

  function selectPlayer(playerId: string) {
    setSelectedPlayer(playerId);
    localStorage.setItem(`mahjong-player-${eventId}`, playerId);
  }

  if (!event) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-4xl mb-3">🀄</div>
      Loading...
    </div>
  );

  const ledgers = computeLedger(event);
  const selectedPlayerName = event.players.find(p => p.id === selectedPlayer)?.name;

  // --- PLAYER: needs to pick who they are first ---
  if (!isHost && !selectedPlayer && event.players.length > 0) {
    return (
      <div className="space-y-5">
        <div className="mahjong-header -mx-4 px-6 pt-8 pb-6 text-center text-white rounded-b-3xl shadow-lg">
          <h1 className="text-2xl font-bold">🀄 {event.name}</h1>
          <p className="text-red-200 text-xs mt-1 tracking-widest">CODE: {event.id}</p>
        </div>

        <div className="mahjong-card p-5 space-y-4">
          <h2 className="font-bold text-lg text-center">Who are you?</h2>
          <p className="text-sm text-gray-500 text-center">Select your name to get started</p>
          <div className="space-y-2">
            {event.players.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPlayer(p.id)}
                className="w-full py-3.5 bg-gray-50 hover:bg-[#c41e3a] hover:text-white border border-gray-200 hover:border-[#c41e3a] rounded-xl font-medium text-sm transition-all"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="mahjong-header -mx-4 px-6 pt-8 pb-6 text-center text-white rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-1">
          {isHost && (
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Host</span>
          )}
          {selectedPlayerName && !isHost && (
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{selectedPlayerName}</span>
          )}
        </div>
        <h1 className="text-2xl font-bold">🀄 {event.name}</h1>
        <p className="text-red-200 text-xs mt-1 tracking-widest">CODE: {event.id}</p>
      </div>

      {/* Host: Getting started guide (only when no players yet) */}
      {isHost && event.players.length === 0 && (
        <div className="mahjong-card p-4 border-l-4 border-[#d4a017]">
          <p className="font-bold text-sm mb-2">Getting started:</p>
          <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
            <li>Add player names below</li>
            <li>Share the code <span className="font-mono font-bold text-gray-800">{event.id}</span> or show QR to players</li>
            <li>Players open this app and join with the code</li>
            <li>When someone wins, anyone can tap the red button to record it</li>
          </ol>
        </div>
      )}

      {/* Player: welcome (no games yet) */}
      {!isHost && event.rounds.length === 0 && selectedPlayer && (
        <div className="mahjong-card p-4 border-l-4 border-[#c41e3a]">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-800">Hi {selectedPlayerName}!</span> When you win a hand, tap <span className="font-bold text-[#c41e3a]">我胡了!</span> to snap a photo of your tiles. The app calculates your score and updates the leaderboard.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Link
          href={`/event/${eventId}/submit`}
          className="flex-1 py-4 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-2xl font-bold text-center text-lg shadow-lg shadow-red-900/25 transition-colors"
        >
          我胡了!
          <span className="block text-xs font-normal text-red-200 mt-0.5">I Won</span>
        </Link>
        <Link
          href={`/event/${eventId}/kong`}
          className="py-4 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-center text-lg shadow-lg shadow-amber-900/20 transition-colors"
        >
          杠
          <span className="block text-xs font-normal text-amber-100 mt-0.5">Kong</span>
        </Link>
      </div>

      {/* Leaderboard */}
      <div className="mahjong-card p-4">
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#d4a017] rounded-full inline-block"></span>
          Leaderboard
        </h2>
        {ledgers.length > 0 ? (
          <Leaderboard ledgers={ledgers} eventId={eventId} />
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">🀄</div>
            <p className="text-sm">No games played yet</p>
            {isHost && <p className="text-xs mt-1">Add players below to get started</p>}
          </div>
        )}
      </div>

      {/* Players list (visible to everyone) */}
      {event.players.length > 0 && !isHost && (
        <div className="mahjong-card p-4">
          <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">Players ({event.players.length})</h2>
          <div className="flex flex-wrap gap-2">
            {event.players.map((p) => (
              <span
                key={p.id}
                className={`text-sm px-3 py-1.5 rounded-full ${p.id === selectedPlayer ? "bg-[#c41e3a] text-white font-bold" : "bg-gray-100 text-gray-600"}`}
              >
                {p.name}
              </span>
            ))}
          </div>
          <button
            onClick={() => { setSelectedPlayer(null); localStorage.removeItem(`mahjong-player-${eventId}`); }}
            className="text-xs text-gray-400 mt-3 underline"
          >
            Switch player
          </button>
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

          {/* Add player */}
          <div className="mahjong-card p-4 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-600 rounded-full inline-block"></span>
              Add Players
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Player name"
                value={newPlayer}
                onChange={(e) => setNewPlayer(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-gray-50/50"
                onKeyDown={(e) => e.key === "Enter" && addPlayer()}
              />
              <button
                onClick={addPlayer}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Add
              </button>
            </div>

            {event.players.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                {event.players.map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center text-sm py-1.5 px-2">
                    <span className="font-medium">{i + 1}. {p.name}</span>
                    <span className="text-gray-400 text-xs font-mono">{p.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Share event */}
          <div className="mahjong-card p-4 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full inline-block"></span>
              Share with Players
            </h3>
            <p className="text-sm text-gray-500">Players join by opening this app and entering the code:</p>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-mono font-bold tracking-widest">{event.id}</p>
            </div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {showQR ? "Hide" : "Show"} QR Code
            </button>
            {showQR && (
              <EventQRCode
                url={typeof window !== "undefined" ? `${window.location.origin}/event/${eventId}` : ""}
                eventName={event.name}
              />
            )}
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
