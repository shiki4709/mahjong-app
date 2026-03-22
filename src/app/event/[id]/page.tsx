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
  const [showQR, setShowQR] = useState<string | null>(null); // table code to show QR for

  // Player identity from localStorage
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  useEffect(() => {
    // Prefer sessionStorage (tab-specific) so multiple players on
    // the same device don't overwrite each other's identity
    const saved = sessionStorage.getItem(`mahjong-player-${eventId}`)
      || localStorage.getItem(`mahjong-player-${eventId}`);
    if (saved) setMyPlayerId(saved);
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

  if (!event) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-4xl mb-3">🀄</div>
      Loading...
    </div>
  );

  const ledgers = computeLedger(event);
  const myPlayer = event.players.find(p => p.id === myPlayerId);
  const myTable = event.tables.find(t => t.id === myPlayer?.tableId);

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
      {!isHost && myPlayer && event.rounds.length === 0 && (
        <div className="mahjong-card p-4 border-l-4 border-[#c41e3a]">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-800">Hi {myPlayer.name}!</span> When you win a hand, tap <span className="font-bold text-[#c41e3a]">我胡了!</span> below to snap a photo. The app calculates your score automatically.
          </p>
          <Link
            href="/how-to-play"
            className="inline-block mt-3 text-xs text-[#c41e3a] font-medium hover:underline"
          >
            📖 New to Mahjong? Learn how to play →
          </Link>
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

      {/* Table view for players */}
      {!isHost && myTable && (
        <div className="mahjong-card p-4">
          <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">Your Table: {myTable.name}</h2>
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
                        <span key={pid} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full">{p.name}</span>
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
