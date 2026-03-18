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

  if (!event) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-4xl mb-3">🀄</div>
      Loading...
    </div>
  );

  const ledgers = computeLedger(event);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="mahjong-header -mx-4 px-6 pt-8 pb-6 text-center text-white rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold">🀄 {event.name}</h1>
        <p className="text-red-200 text-xs mt-1 tracking-widest">CODE: {event.id}</p>
      </div>

      {/* Getting started hint for host */}
      {isHost && event.players.length === 0 && (
        <div className="mahjong-card p-4 border-l-4 border-[#d4a017]">
          <p className="font-bold text-sm mb-2">Getting started:</p>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Add player names below in Host Controls</li>
            <li>Share the code <span className="font-mono font-bold text-gray-800">{event.id}</span> or show QR to players</li>
            <li>When someone wins, tap the red button to record it</li>
          </ol>
        </div>
      )}

      {/* Player instructions (non-host, no games yet) */}
      {!isHost && event.rounds.length === 0 && (
        <div className="mahjong-card p-4 border-l-4 border-[#c41e3a]">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-800">Welcome!</span> When you win a hand, tap <span className="font-bold text-[#c41e3a]">我胡了!</span> to take a photo of your tiles. The app will calculate your score automatically.
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
          </div>
        )}
      </div>

      {/* Host controls */}
      {isHost && (
        <div className="mahjong-card p-4 space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <span className="w-1 h-5 bg-emerald-600 rounded-full inline-block"></span>
            Host Controls
          </h2>

          {/* Add player */}
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

          {/* Player list */}
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

          {/* QR Code */}
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

          {/* Admin + End event */}
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
